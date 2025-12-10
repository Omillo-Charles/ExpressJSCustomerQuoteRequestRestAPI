import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { generateToken, authenticate, refreshToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import config from '../config/env.js';

const router = express.Router();

// Apply auth rate limiting to all routes
router.use(authLimiter);

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * @route   POST /api/auth/login
 * @desc    Admin login (simplified for demo - in production use proper user management)
 * @access  Public
 */
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    handleValidationErrors
], asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Simplified authentication - in production, use proper user management
    // This is just for demo purposes
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@omytech.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email !== adminEmail || password !== adminPassword) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Generate tokens
    const tokenPayload = {
        id: 'admin-001',
        email: adminEmail,
        role: 'admin'
    };

    const accessToken = generateToken(tokenPayload, '1h');
    const refreshTokenValue = generateToken(tokenPayload, '7d');

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: 'admin-001',
                email: adminEmail,
                role: 'admin'
            },
            tokens: {
                accessToken,
                refreshToken: refreshTokenValue,
                expiresIn: '1h'
            }
        }
    });
}));

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public (with valid refresh token)
 */
router.post('/refresh', [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
    handleValidationErrors
], refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success and let client handle token removal

    res.json({
        success: true,
        message: 'Logout successful'
    });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current user info
 * @access  Private
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'User info retrieved successfully',
        data: {
            user: req.user
        }
    });
}));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change admin password (simplified)
 * @access  Private (Admin only)
 */
router.post('/change-password', [
    authenticate,
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters'),
    handleValidationErrors
], asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // Simplified password change - in production, use proper user management
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (currentPassword !== adminPassword) {
        return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
        });
    }

    // In production, you would update the password in the database
    // For now, we'll just return success
    console.log(`Password change requested. New password would be: ${newPassword}`);

    res.json({
        success: true,
        message: 'Password changed successfully (demo mode - password not actually changed)'
    });
}));

/**
 * @route   GET /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Private
 */
router.get('/verify-token', authenticate, asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        data: {
            user: req.user,
            tokenValid: true
        }
    });
}));

export default router;