import { sequelize } from './models';

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
    try {
        // authenticate sequalize connection pool
        await sequelize.authenticate();
        console.log('✅ Sequelize connection established successfully.');
        initialized = true;
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