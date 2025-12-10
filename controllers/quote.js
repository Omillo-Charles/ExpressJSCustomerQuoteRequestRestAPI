import Quote from '../models/quote.js';
import config from '../config/env.js';
import { sendQuoteNotificationEmail, sendQuoteResponseEmail, sendStatusUpdateEmail } from '../utils/nodemailer.js';
import { calculateEstimatedPrice, getServiceByName } from '../constants/services.js';

/**
 * Get all quote requests with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllQuotes = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            service,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (service) filter.service = service;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute query
        const quotes = await Quote.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const totalQuotes = await Quote.countDocuments(filter);
        const totalPages = Math.ceil(totalQuotes / parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Quotes retrieved successfully',
            data: {
                quotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalQuotes,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Error fetching quotes:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quotes',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Get a single quote by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuoteById = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quote retrieved successfully',
            data: quote
        });

    } catch (error) {
        console.error('Error fetching quote:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quote',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Create a new quote request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createQuote = async (req, res) => {
    try {
        const quoteData = req.body;

        // Create new quote
        const quote = new Quote(quoteData);
        const savedQuote = await quote.save();

        // Automatically calculate and add quote based on service
        try {
            const complexity = determineComplexity(quoteData);
            const addons = determineAddons(quoteData);
            const priceCalculation = calculateEstimatedPrice(
                quoteData.service,
                complexity,
                quoteData.currency || 'KES',
                addons
            );

            // Add the calculated quote to the saved quote
            const quotedQuote = await savedQuote.addQuote(priceCalculation.totalPrice, quoteData.currency || 'KES');

            // Send quote response email to customer immediately
            await sendQuoteResponseEmail(quotedQuote, priceCalculation);

            // Send notification email to admin
            await sendQuoteNotificationEmail(quotedQuote);

            res.status(201).json({
                success: true,
                message: 'Quote request submitted and quote sent successfully',
                data: {
                    quote: quotedQuote,
                    priceBreakdown: priceCalculation
                }
            });

        } catch (emailError) {
            console.error('Failed to send emails:', emailError.message);

            // Still return success but note email issue
            res.status(201).json({
                success: true,
                message: 'Quote request submitted successfully, but there was an issue sending the quote email',
                data: savedQuote,
                warning: 'Quote email delivery failed'
            });
        }



    } catch (error) {
        console.error('Error creating quote:', error.message);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create quote request',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Update quote status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateQuoteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate status
        const validStatuses = ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Store old status for email notification
        const oldStatus = quote.status;

        // Update status using model method
        const updatedQuote = await quote.updateStatus(status, notes);

        // Send status update email to customer
        try {
            await sendStatusUpdateEmail(updatedQuote, oldStatus);
        } catch (emailError) {
            console.error('Failed to send status update email:', emailError.message);
            // Don't fail the request if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Quote status updated successfully',
            data: updatedQuote
        });

    } catch (error) {
        console.error('Error updating quote status:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update quote status',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Add quote amount to a quote request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const addQuoteAmount = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, currency = 'USD' } = req.body;

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quote amount is required'
            });
        }

        const quote = await Quote.findById(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        // Add quote using model method
        const updatedQuote = await quote.addQuote(amount, currency);

        // Send quote response email to customer
        try {
            await sendQuoteResponseEmail(updatedQuote);
        } catch (emailError) {
            console.error('Failed to send quote response email:', emailError.message);
            // Don't fail the request if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Quote amount added successfully',
            data: updatedQuote
        });

    } catch (error) {
        console.error('Error adding quote amount:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to add quote amount',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Delete a quote request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteQuote = async (req, res) => {
    try {
        const { id } = req.params;

        const quote = await Quote.findByIdAndDelete(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Quote deleted successfully',
            data: quote
        });

    } catch (error) {
        console.error('Error deleting quote:', error.message);

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID format'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to delete quote',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Get quotes by service type
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuotesByService = async (req, res) => {
    try {
        const { service } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Validate service
        const validServices = [
            'Web Development',
            'Mobile App Design',
            'UI/UX Design',
            'E-commerce Solutions',
            'Digital Marketing',
            'Consulting & Automation'
        ];

        if (!validServices.includes(service)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid service type'
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const quotes = await Quote.findByService(service)
            .skip(skip)
            .limit(parseInt(limit));

        const totalQuotes = await Quote.countDocuments({ service });

        res.status(200).json({
            success: true,
            message: `Quotes for ${service} retrieved successfully`,
            data: {
                quotes,
                service,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalQuotes / parseInt(limit)),
                    totalQuotes
                }
            }
        });

    } catch (error) {
        console.error('Error fetching quotes by service:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quotes by service',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Get quote statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getQuoteStats = async (req, res) => {
    try {
        const totalQuotes = await Quote.countDocuments();
        const pendingQuotes = await Quote.countDocuments({ status: 'pending' });
        const quotedQuotes = await Quote.countDocuments({ status: 'quoted' });
        const acceptedQuotes = await Quote.countDocuments({ status: 'accepted' });
        const completedQuotes = await Quote.countDocuments({ status: 'completed' });

        // Get quotes by service
        const serviceStats = await Quote.aggregate([
            {
                $group: {
                    _id: '$service',
                    count: { $sum: 1 },
                    avgBudget: { $avg: '$budget' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Get recent quotes
        const recentQuotes = await Quote.findRecent(5);

        res.status(200).json({
            success: true,
            message: 'Quote statistics retrieved successfully',
            data: {
                overview: {
                    totalQuotes,
                    pendingQuotes,
                    quotedQuotes,
                    acceptedQuotes,
                    completedQuotes
                },
                serviceStats,
                recentQuotes
            }
        });

    } catch (error) {
        console.error('Error fetching quote statistics:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve quote statistics',
            error: config.app.isDevelopment ? error.message : 'Internal server error'
        });
    }
};

/**
 * Determine project complexity based on quote data
 * @param {Object} quoteData - Quote request data
 * @returns {string} Complexity level (basic, intermediate, advanced)
 */
const determineComplexity = (quoteData) => {
    let complexityScore = 0;

    // Budget-based complexity
    const budget = parseFloat(quoteData.budget);
    const currency = quoteData.currency || 'KES';
    const service = getServiceByName(quoteData.service);

    if (service) {
        const basePrice = service.basePrice[currency];
        const budgetRatio = budget / basePrice;

        if (budgetRatio >= 3) complexityScore += 2;
        else if (budgetRatio >= 1.5) complexityScore += 1;
    }

    // Timeline-based complexity
    if (quoteData.timeline === '6+ months') complexityScore += 2;
    else if (quoteData.timeline === '3-6 months') complexityScore += 1;
    else if (quoteData.timeline === '1-2 weeks') complexityScore -= 1;

    // Service-specific complexity indicators
    if (quoteData.service === 'Web Development' || quoteData.service === 'Mobile App Design') {
        if (quoteData.features && quoteData.features.length >= 4) complexityScore += 2;
        else if (quoteData.features && quoteData.features.length >= 2) complexityScore += 1;

        if (quoteData.features && quoteData.features.includes('Authentication')) complexityScore += 1;
        if (quoteData.features && quoteData.features.includes('API')) complexityScore += 1;
    }

    if (quoteData.service === 'UI/UX Design') {
        if (quoteData.designType && quoteData.designType.length >= 3) complexityScore += 2;
        else if (quoteData.designType && quoteData.designType.length >= 2) complexityScore += 1;

        if (quoteData.platforms && quoteData.platforms.length >= 3) complexityScore += 1;
    }

    if (quoteData.service === 'Digital Marketing') {
        if (quoteData.marketingChannels && quoteData.marketingChannels.length >= 4) complexityScore += 2;
        else if (quoteData.marketingChannels && quoteData.marketingChannels.length >= 2) complexityScore += 1;

        if (quoteData.campaignDuration === '12 Months' || quoteData.campaignDuration === 'Ongoing') {
            complexityScore += 1;
        }
    }

    // Description length as complexity indicator
    if (quoteData.description && quoteData.description.length > 500) complexityScore += 1;

    // Determine final complexity
    if (complexityScore >= 4) return 'advanced';
    if (complexityScore >= 2) return 'intermediate';
    return 'basic';
};

/**
 * Determine required addons based on quote data
 * @param {Object} quoteData - Quote request data
 * @returns {Array} Array of addon names
 */
const determineAddons = (quoteData) => {
    const addons = [];

    // Web Development and Mobile App specific addons
    if (quoteData.service === 'Web Development' || quoteData.service === 'Mobile App Design') {
        if (quoteData.hosting === 'Yes') {
            addons.push('hosting');
        }

        if (quoteData.domain === 'Yes') {
            addons.push('domain');
        }

        if (quoteData.maintenance && quoteData.maintenance !== 'None') {
            addons.push('maintenance');
        }
    }

    return addons;
};