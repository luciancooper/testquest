import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';

const envKeys = {
    host: 'RDS_HOSTNAME',
    user: 'RDS_USERNAME',
    password: 'RDS_PASSWORD',
    db: 'RDS_DATABASE',
    port: 'RDS_PORT',
};

const sqlConfig = {
    host: process.env[envKeys.host]!,
    username: process.env[envKeys.user]!,
    password: process.env[envKeys.password]!,
    port: parseInt(process.env[envKeys.port] ?? '3306', 10),
    database: process.env[envKeys.db]!,
};

// create sequelize connection
export const sequelize = new Sequelize({
    ...sqlConfig,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    logging: process.env['NODE_ENV'] === 'development' ? console.log : false,
    dialectOptions: {
        connectTimeout: 10000,
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
    },
});

let initialized = false,
    closing = false;

export async function shutdown() {
    if (!initialized) {
        console.warn('Attempted to shut down uninitialized or already shut down database pool.');
        return;
    }
    if (closing) {
        console.warn('Database shutdown already in progress.');
        return;
    }
    closing = true;
    console.log('Initiating graceful sequelize shutdown...');
    try {
        await sequelize.close();
        initialized = false;
        console.log('Sequelize shut down successfully.');
    } catch (error) {
        console.error('Error during Sequelize shutdown:', error);
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
        throw new Error(`Bad environment config: ${missingKeys.join(', ')} must be set`);
    }
    try {
        // establish mysql connection to ensure db exists
        const connection = await mysql.createConnection({
            host: sqlConfig.host,
            user: sqlConfig.username,
            password: sqlConfig.password,
            port: sqlConfig.port,
            connectTimeout: 10000, // 10 seconds
            enableKeepAlive: false,
        });
        // create database if it does not exist
        {
            const [{ warningStatus }] = await connection.query(
                `CREATE DATABASE IF NOT EXISTS ${sqlConfig.database}`,
            ) as unknown as [{ warningStatus: 0 | 1 }];
            if (!warningStatus) console.log('✅ DB %s created', sqlConfig.database);
        }
        // close the connection
        await connection.end();
        // authenticate sequalize connection pool
        await sequelize.authenticate();
        console.log('✅ Sequelize connection established successfully.');
        initialized = true;
        // sync models
        await sequelize.sync({ alter: true });
        console.log('✅ Sequelize models synced');
        // setup shutdown hooks
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
    } catch (error) {
        console.error('❌ Failed to initialize database connection pool:', error);
        initialized = false; // Reset flag on failure
        throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}