import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import config from './config/env.js';
import { initializeDB, checkDatabaseHealth } from './database/mongodb.js';

const app = express();
const PORT = config.server.port;

// Middleware
app.use(cors({
    origin: config.server.corsOrigin,
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Customer Quote Request API',
        version: '1.0.0',
        status: 'running',
        environment: config.server.nodeEnv
    });
});

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbHealth = await checkDatabaseHealth();

    res.json({
        status: dbHealth ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
        database: {
            connected: dbHealth,
            status: dbHealth ? 'connected' : 'disconnected'
        }
    });
});

// Import routes (will be created)
// import quoteRoutes from './routes/quotes.js';
// app.use('/api/quotes', quoteRoutes);

// 404 handler
app.use((req, res, next) => {
    next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: config.app.isDevelopment ? err : {}
    });
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Initialize database connection
        await initializeDB();

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📝 Environment: ${config.server.nodeEnv}`);
            console.log(`🌐 CORS Origin: ${config.server.corsOrigin}`);
            console.log(`💾 Database: Connected`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Start the application
startServer();

export default app;