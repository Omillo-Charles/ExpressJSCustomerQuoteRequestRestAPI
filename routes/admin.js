import express from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { verifyEmailConfig, sendTestEmail } from '../utils/nodemailer.js';
import { checkDatabaseHealth, getConnectionStatus } from '../database/mongodb.js';
import Quote from '../models/quote.js';

const router = express.Router();

// Apply admin rate limiting and authentication to all routes
router.use(adminLimiter);
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin only)
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
    // Get quote statistics
    const totalQuotes = await Quote.countDocuments();
    const pendingQuotes = await Quote.countDocuments({ status: 'pending' });
    const quotedQuotes = await Quote.countDocuments({ status: 'quoted' });
    const acceptedQuotes = await Quote.countDocuments({ status: 'accepted' });
    const completedQuotes = await Quote.countDocuments({ status: 'completed' });
    const rejectedQuotes = await Quote.countDocuments({ status: 'rejected' });

    // Get recent quotes
    const recentQuotes = await Quote.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('name email service status createdAt budget currency');

    // Get quotes by service
    const serviceStats = await Quote.aggregate([
        {
            $group: {
                _id: '$service',
                count: { $sum: 1 },
                avgBudget: { $avg: '$budget' },
                totalRevenue: { $sum: '$quotedAmount' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);

    // Get monthly statistics
    const monthlyStats = await Quote.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$quotedAmount' }
            }
        },
        {
            $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
            $limit: 12
        }
    ]);

    res.json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
            overview: {
                totalQuotes,
                pendingQuotes,
                quotedQuotes,
                acceptedQuotes,
                completedQuotes,
                rejectedQuotes
            },
            recentQuotes,
            serviceStats,
            monthlyStats
        }
    });
}));

/**
 * @route   GET /api/admin/system-status
 * @desc    Get system health and status
 * @access  Private (Admin only)
 */
router.get('/system-status', asyncHandler(async (req, res) => {
    const dbHealth = await checkDatabaseHealth();
    const dbStatus = getConnectionStatus();
    const emailHealth = await verifyEmailConfig();

    res.json({
        success: true,
        message: 'System status retrieved successfully',
        data: {
            database: {
                healthy: dbHealth,
                ...dbStatus
            },
            email: {
                healthy: emailHealth
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                environment: process.env.NODE_ENV
            }
        }
    });
}));

/**
 * @route   POST /api/admin/test-email
 * @desc    Send test email to verify email configuration
 * @access  Private (Admin only)
 */
router.post('/test-email', asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        const result = await sendTestEmail(email);

        res.json({
            success: true,
            message: 'Test email sent successfully',
            data: {
                messageId: result.messageId,
                recipient: email || 'default admin email'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
}));

/**
 * @route   GET /api/admin/quotes/export
 * @desc    Export quotes data (CSV format)
 * @access  Private (Admin only)
 */
router.get('/quotes/export', asyncHandler(async (req, res) => {
    const { format = 'json', status, service, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (service) filter.service = service;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const quotes = await Quote.find(filter)
        .sort({ createdAt: -1 })
        .lean();

    if (format === 'csv') {
        // Convert to CSV format
        const csvHeaders = [
            'ID', 'Name', 'Email', 'Phone', 'Company', 'Service',
            'Timeline', 'Budget', 'Currency', 'Status', 'Quoted Amount',
            'Created At', 'Updated At'
        ];

        const csvRows = quotes.map(quote => [
            quote._id,
            quote.name,
            quote.email,
            quote.phone,
            quote.company || '',
            quote.service,
            quote.timeline,
            quote.budget,
            quote.currency,
            quote.status,
            quote.quotedAmount || '',
            quote.createdAt,
            quote.updatedAt
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=quotes-export.csv');
        res.send(csvContent);
    } else {
        res.json({
            success: true,
            message: 'Quotes exported successfully',
            data: {
                quotes,
                total: quotes.length,
                exportedAt: new Date().toISOString()
            }
        });
    }
}));

/**
 * @route   DELETE /api/admin/quotes/bulk-delete
 * @desc    Bulk delete quotes
 * @access  Private (Admin only)
 */
router.delete('/quotes/bulk-delete', asyncHandler(async (req, res) => {
    const { quoteIds } = req.body;

    if (!Array.isArray(quoteIds) || quoteIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Quote IDs array is required'
        });
    }

    const result = await Quote.deleteMany({
        _id: { $in: quoteIds }
    });

    res.json({
        success: true,
        message: `${result.deletedCount} quotes deleted successfully`,
        data: {
            deletedCount: result.deletedCount
        }
    });
}));

/**
 * @route   PATCH /api/admin/quotes/bulk-update-status
 * @desc    Bulk update quote status
 * @access  Private (Admin only)
 */
router.patch('/quotes/bulk-update-status', asyncHandler(async (req, res) => {
    const { quoteIds, status, notes } = req.body;

    if (!Array.isArray(quoteIds) || quoteIds.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Quote IDs array is required'
        });
    }

    const validStatuses = ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status value'
        });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    const result = await Quote.updateMany(
        { _id: { $in: quoteIds } },
        updateData
    );

    res.json({
        success: true,
        message: `${result.modifiedCount} quotes updated successfully`,
        data: {
            modifiedCount: result.modifiedCount
        }
    });
}));

export default router;