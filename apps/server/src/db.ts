import mysql, { type Pool, type PoolOptions } from 'mysql2/promise';

let _pool: Pool | null = null;

const envKeys = {
    host: 'RDS_HOSTNAME',
    user: 'RDS_USERNAME',
    password: 'RDS_PASSWORD',
    db: 'RDS_DATABASE',
    port: 'RDS_PORT',
};

let initialized = false,
    closing = false,
    hooksRegistered = false;

export async function shutdown() {
    if (!initialized || !_pool) {
        console.warn('Attempted to shut down uninitialized or already shut down database pool.');
        return;
    }
    if (closing) {
        console.warn('Database shutdown already in progress.');
        return;
    }
    closing = true;
    console.log('Initiating graceful database pool shutdown...');
    try {
        await _pool.end();
        initialized = false;
        _pool = null;
        console.log('Database pool shut down successfully.');
    } catch (error) {
        console.error('Error during database pool shutdown:', error);
        throw new Error(`Database shutdown failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        closing = false;
    }
}

/**
 * Initializes the database connection pool. Must be called before any database operations.
 */
export async function initialize() {
    if (initialized) {
        console.warn('Database already initialized, skipping re-initialization');
        return;
    }
    // ensure env variables are set
    const missingKeys = [envKeys.host, envKeys.user, envKeys.password, envKeys.db].filter((key) => !process.env[key]);
    if (missingKeys.length) {
        throw new Error(`Database initialization failed: ${missingKeys.join(', ')} must be set`);
    }
    // resolve config
    const config: PoolOptions = {
        host: process.env[envKeys.host]!,
        user: process.env[envKeys.user]!,
        password: process.env[envKeys.password]!,
        port: parseInt(process.env[envKeys.port] ?? '3306', 10),
        connectTimeout: 10000, // 10 seconds
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        maxIdle: 10,
        idleTimeout: 60000,
        enableKeepAlive: true,
    };
    try {
        // create connection pool
        _pool = mysql.createPool(config);
        initialized = true;
        // ping the database to ensure a connection can be established
        const connection = await _pool.getConnection();
        connection.release(); // release the connection immediately after successful ping
        // use database specified by RDS_DATABASE env key
        const db = process.env[envKeys.db]!;
        // create database if it exists
        await _pool.query(`CREATE DATABASE IF NOT EXISTS ${db}`);
        // use database
        await _pool.query(`USE ${db}`);
        // setup shutdown hooks if this is the first initialization
        if (!hooksRegistered) {
            const gracefulShutdown = async (signal: string) => {
                console.log(`\n📡 Received ${signal}, initiating graceful shutdown...`);
                try {
                    await shutdown();
                    process.exit(0);
                } catch (error) {
                    console.error(`Error during ${signal} shutdown:`, error);
                    process.exit(1);
                }
            };
            // register signal handlers
            process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
            process.on('SIGINT', () => gracefulShutdown('SIGINT'));
            // Handle uncaught exceptions
            process.on('uncaughtException', (error) => {
                console.error('Uncaught Exception:', error);
                shutdown().finally(() => process.exit(1));
            });
            process.on('unhandledRejection', (reason, promise) => {
                console.error('Unhandled Rejection at:', promise, 'reason:', reason);
                shutdown().finally(() => process.exit(1));
            });
            hooksRegistered = true;
        }
    } catch (error) {
        console.error('Failed to initialize database connection pool:', error);
        initialized = false; // Reset flag on failure
        throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function pool(): Pool {
    if (!initialized || !_pool) {
        throw new Error('Database pool is not initialized');
    }
    if (closing) {
        throw new Error('Database shutdown is in progress, cannot execute queries');
    }
    return _pool;
}