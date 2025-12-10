import express from 'express';
import {
    getAllServices,
    getServicesByCategory,
    getServiceByName,
    calculateEstimatedPrice,
    SERVICE_CATEGORIES,
    TIMELINES,
    CURRENCIES
} from '../constants/services.js';
import { generalLimiter } from '../middleware/rateLimiter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { query, param, validationResult } from 'express-validator';

const router = express.Router();

// Apply general rate limiting
router.use(generalLimiter);

/**
 * Handle validation errors for services routes
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
 * @route   GET /api/services
 * @desc    Get all available services
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
    const services = getAllServices();

    res.json({
        success: true,
        message: 'Services retrieved successfully',
        data: {
            services,
            categories: Object.values(SERVICE_CATEGORIES),
            timelines: TIMELINES,
            currencies: CURRENCIES
        }
    });
}));

/**
 * @route   GET /api/services/categories
 * @desc    Get all service categories
 * @access  Public
 */
router.get('/categories', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Service categories retrieved successfully',
        data: {
            categories: Object.values(SERVICE_CATEGORIES)
        }
    });
}));

/**
 * @route   GET /api/services/category/:category
 * @desc    Get services by category
 * @access  Public
 */
router.get('/category/:category', [
    param('category')
        .isIn(Object.values(SERVICE_CATEGORIES))
        .withMessage('Invalid service category'),
    handleValidationErrors
], asyncHandler(async (req, res) => {
    const { category } = req.params;
    const services = getServicesByCategory(category);

    res.json({
        success: true,
        message: `Services in ${category} category retrieved successfully`,
        data: {
            category,
            services
        }
    });
}));

/**
 * @route   GET /api/services/:serviceName
 * @desc    Get specific service details
 * @access  Public
 */
router.get('/:serviceName', asyncHandler(async (req, res) => {
    const { serviceName } = req.params;
    const service = getServiceByName(serviceName);

    if (!service) {
        return res.status(404).json({
            success: false,
            message: 'Service not found'
        });
    }

    res.json({
        success: true,
        message: 'Service details retrieved successfully',
        data: service
    });
}));

/**
 * @route   POST /api/services/calculate-price
 * @desc    Calculate estimated price for a service
 * @access  Public
 */
router.post('/calculate-price', [
    query('service')
        .notEmpty()
        .withMessage('Service name is required'),
    query('complexity')
        .optional()
        .isIn(['basic', 'intermediate', 'advanced'])
        .withMessage('Complexity must be basic, intermediate, or advanced'),
    query('currency')
        .optional()
        .isIn(['USD', 'KES'])
        .withMessage('Currency must be USD or KES'),
    handleValidationErrors
], asyncHandler(async (req, res) => {
    try {
        const {
            service,
            complexity = 'basic',
            currency = 'KES',
            addons = []
        } = req.query;

        // Parse addons if it's a string
        let parsedAddons = [];
        if (typeof addons === 'string') {
            parsedAddons = addons.split(',').map(addon => addon.trim());
        } else if (Array.isArray(addons)) {
            parsedAddons = addons;
        }

        const priceCalculation = calculateEstimatedPrice(
            service,
            complexity,
            currency,
            parsedAddons
        );

        res.json({
            success: true,
            message: 'Price calculated successfully',
            data: priceCalculation
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}));

/**
 * @route   GET /api/services/timelines
 * @desc    Get available project timelines
 * @access  Public
 */
router.get('/meta/timelines', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Timelines retrieved successfully',
        data: {
            timelines: TIMELINES
        }
    });
}));

/**
 * @route   GET /api/services/currencies
 * @desc    Get supported currencies
 * @access  Public
 */
router.get('/meta/currencies', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Currencies retrieved successfully',
        data: {
            currencies: CURRENCIES
        }
    });
}));

export default router;