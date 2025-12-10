import mongoose from 'mongoose';
import config from '../config/env.js';

// MongoDB connection state
let isConnected = false;

// Connection options
const connectionOptions = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    bufferCommands: false // Disable mongoose buffering
};

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
    // If already connected, return
    if (isConnected) {
        console.log('Using existing MongoDB connection');
        return;
    }

    try {
        console.log('Connecting to MongoDB...');

        const db = await mongoose.connect(config.database.mongoUri, connectionOptions);

        isConnected = db.connections[0].readyState === 1;

        console.log('MongoDB connected successfully');
        console.log(`Database: ${db.connection.name}`);
        console.log(`Host: ${db.connection.host}:${db.connection.port}`);

    } catch (error) {
        console.error('MongoDB connection error:', error.message);

        // In production, you might want to exit the process
        if (config.app.isProduction) {
            process.exit(1);
        }

        throw error;
    }
};

/**
 * Disconnect from MongoDB database
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
    if (!isConnected) {
        console.log('No MongoDB connection to close');
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        console.log('MongoDB disconnected successfully');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error.message);
        throw error;
    }
};

/**
 * Get connection status
 * @returns {boolean}
 */
export const getConnectionStatus = () => {
    return {
        isConnected,
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
    };
};

/**
 * Check if database is healthy
 * @returns {Promise<boolean>}
 */
export const checkDatabaseHealth = async () => {
    try {
        if (!isConnected) {
            return false;
        }

        // Ping the database
        await mongoose.connection.db.admin().ping();
        return true;
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return false;
    }
};

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
    isConnected = true;
});

mongoose.connection.on('error', (error) => {
    console.error('Mongoose connection error:', error.message);
    isConnected = false;
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
    isConnected = false;
});

// Handle application termination
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Gracefully shutting down...');
    await disconnectDB();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM. Gracefully shutting down...');
    await disconnectDB();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Promise Rejection:', error.message);
    if (config.app.isProduction) {
        process.exit(1);
    }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    if (config.app.isProduction) {
        process.exit(1);
    }
});

/**
 * Initialize database connection with retry logic
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<void>}
 */
export const initializeDB = async (maxRetries = 5, retryDelay = 5000) => {
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await connectDB();
            return;
        } catch (error) {
            retries++;
            console.error(`Database connection attempt ${retries}/${maxRetries} failed:`, error.message);

            if (retries === maxRetries) {
                console.error('Max retries reached. Could not connect to database.');
                throw error;
            }

            console.log(`Retrying in ${retryDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
};

/**
 * Create database indexes for better performance
 * @returns {Promise<void>}
 */
export const createIndexes = async () => {
    try {
        console.log('Creating database indexes...');

        // Import models to ensure indexes are created
        const { default: Quote } = await import('../models/quote.js');

        // Ensure indexes are created
        await Quote.createIndexes();

        console.log('Database indexes created successfully');
    } catch (error) {
        console.error('Error creating database indexes:', error.message);
        throw error;
    }
};

// Export default connection function
export default connectDB;