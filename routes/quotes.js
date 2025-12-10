import express from 'express';
import {
    getAllQuotes,
    getQuoteById,
    createQuote,
    updateQuoteStatus,
    addQuoteAmount,
    deleteQuote,
    getQuotesByService,
    getQuoteStats
} from '../controllers/quote.js';
import {
    validateCreateQuote,
    validateUpdateStatus,
    validateAddQuote,
    validateObjectId,
    validateQueryParams,
    validateServiceParam
} from '../middleware/validation.js';
import {
    generalLimiter,
    createQuoteLimiter,
    adminLimiter
} from '../middleware/rateLimiter.js';
import {
    authenticate,
    authorizeAdmin,
    optionalAuth
} from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Apply general rate limiting to all routes
router.use(generalLimiter);

/**
 * @route   GET /api/quotes
 * @desc    Get all quotes with pagination and filtering
 * @access  Private (Admin only)
 * @params  ?page=1&limit=10&status=pending&service=Web Development&sortBy=createdAt&sortOrder=desc
 */
router.get('/',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    validateQueryParams,
    asyncHandler(getAllQuotes)
);

/**
 * @route   GET /api/quotes/stats
 * @desc    Get quote statistics and analytics
 * @access  Private (Admin only)
 */
router.get('/stats',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    asyncHandler(getQuoteStats)
);

/**
 * @route   GET /api/quotes/service/:service
 * @desc    Get quotes by service type
 * @access  Private (Admin only)
 * @params  ?page=1&limit=10
 */
router.get('/service/:service',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    validateServiceParam,
    validateQueryParams,
    asyncHandler(getQuotesByService)
);

/**
 * @route   GET /api/quotes/:id
 * @desc    Get a single quote by ID
 * @access  Private (Admin only)
 */
router.get('/:id',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    validateObjectId,
    asyncHandler(getQuoteById)
);

/**
 * @route   POST /api/quotes
 * @desc    Create a new quote request (automatically generates and sends quote)
 * @access  Public (with rate limiting)
 */
router.post('/',
    createQuoteLimiter,
    validateCreateQuote,
    asyncHandler(createQuote)
);

/**
 * @route   PATCH /api/quotes/:id/status
 * @desc    Update quote status
 * @access  Private (Admin only)
 */
router.patch('/:id/status',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    validateUpdateStatus,
    asyncHandler(updateQuoteStatus)
);

/**
 * @route   PATCH /api/quotes/:id/quote
 * @desc    Add or update quote amount (manual override)
 * @access  Private (Admin only)
 */
router.patch('/:id/quote',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    validateAddQuote,
    asyncHandler(addQuoteAmount)
);

/**
 * @route   DELETE /api/quotes/:id
 * @desc    Delete a quote request
 * @access  Private (Admin only)
 */
router.delete('/:id',
    adminLimiter,
    authenticate,
    authorizeAdmin,
    validateObjectId,
    asyncHandler(deleteQuote)
);

export default router;