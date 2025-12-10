import express from 'express';
import quotesRoutes from './quotes.js';
import servicesRoutes from './services.js';
import adminRoutes from './admin.js';
import authRoutes from './auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { verifyEmailConfig } from '../utils/nodemailer.js';
import { checkDatabaseHealth } from '../database/mongodb.js';
import config from '../config/env.js';

const router = express.Router();

/**
 * @route   GET /api
 * @desc    API root endpoint with basic info
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'OmyTech Quote Request API',
        version: '1.0.0',
        environment: config.server.nodeEnv,
        endpoints: {
            quotes: '/api/quotes',
            services: '/api/services',
            admin: '/api/admin',
            auth: '/api/auth',
            health: '/api/health'
        },
        documentation: 'https://github.com/omytech/quote-api',
        support: 'omytechkenya@gmail.com'
    });
}));

/**
 * @route   GET /api/health
 * @desc    Comprehensive health check endpoint
 * @access  Public
 */
router.get('/health', asyncHandler(async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const emailHealth = await verifyEmailConfig();

    const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
        services: {
            database: {
                status: dbHealth ? 'healthy' : 'unhealthy',
                connected: dbHealth
            },
            email: {
                status: emailHealth ? 'healthy' : 'unhealthy',
                configured: emailHealth
            },
            server: {
                status: 'healthy',
                uptime: process.uptime(),
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
                }
            }
        }
    };

    // Overall health status
    const allHealthy = dbHealth && emailHealth;
    healthStatus.status = allHealthy ? 'healthy' : 'degraded';

    const statusCode = allHealthy ? 200 : 503;

    res.status(statusCode).json({
        success: allHealthy,
        message: allHealthy ? 'All systems operational' : 'Some systems are experiencing issues',
        data: healthStatus
    });
}));

/**
 * @route   GET /api/ping
 * @desc    Simple ping endpoint for basic connectivity test
 * @access  Public
 */
router.get('/ping', (req, res) => {
    res.json({
        success: true,
        message: 'pong',
        timestamp: new Date().toISOString(),
        server: 'OmyTech Quote API'
    });
});

/**
 * @route   GET /api/version
 * @desc    Get API version and build info
 * @access  Public
 */
router.get('/version', (req, res) => {
    res.json({
        success: true,
        data: {
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            nodeVersion: process.version,
            environment: config.server.nodeEnv,
            features: [
                'Automatic Quote Generation',
                'Email Notifications',
                'Service Pricing Calculator',
                'Admin Dashboard',
                'Rate Limiting',
                'Input Validation',
                'Security Headers'
            ]
        }
    });
});

// Mount route modules
router.use('/quotes', quotesRoutes);
router.use('/services', servicesRoutes);
router.use('/admin', adminRoutes);
router.use('/auth', authRoutes);

export default router;