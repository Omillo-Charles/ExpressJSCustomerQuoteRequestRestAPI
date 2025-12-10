import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

/**
 * General rate limiter for all routes
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.app.isProduction ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting in development for localhost
        if (!config.app.isProduction && req.ip === '127.0.0.1') {
            return true;
        }
        return false;
    }
});

/**
 * Strict rate limiter for quote creation
 */
export const createQuoteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: config.app.isProduction ? 5 : 50, // Limit each IP to 5 quote submissions per hour in production
    message: {
        success: false,
        message: 'Too many quote requests from this IP, please try again in an hour.',
        retryAfter: '1 hour'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (!config.app.isProduction && req.ip === '127.0.0.1') {
            return true;
        }
        return false;
    }
});

/**
 * Rate limiter for admin operations
 */
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.app.isProduction ? 200 : 1000, // Higher limit for admin operations
    message: {
        success: false,
        message: 'Too many admin requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        if (!config.app.isProduction && req.ip === '127.0.0.1') {
            return true;
        }
        return false;
    }
});

/**
 * Rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: config.app.isProduction ? 10 : 100, // Limit login attempts
    message: {
        success: false,
        message: 'Too many authentication attempts from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    skip: (req) => {
        if (!config.app.isProduction && req.ip === '127.0.0.1') {
            return true;
        }
        return false;
    }
});