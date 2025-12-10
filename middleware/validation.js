import { body, param, query, validationResult } from 'express-validator';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }

    next();
};

/**
 * Validation rules for creating a quote
 */
export const validateCreateQuote = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required')
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please provide a valid phone number'),

    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),

    body('service')
        .notEmpty()
        .withMessage('Service selection is required')
        .isIn([
            'Web Development',
            'Mobile App Design',
            'UI/UX Design',
            'E-commerce Solutions',
            'Digital Marketing',
            'Consulting & Automation'
        ])
        .withMessage('Please select a valid service'),

    body('timeline')
        .notEmpty()
        .withMessage('Timeline is required')
        .isIn(['1-2 weeks', '3-4 weeks', '1-2 months', '3-6 months', '6+ months', 'Flexible'])
        .withMessage('Please select a valid timeline'),

    body('budget')
        .notEmpty()
        .withMessage('Budget is required')
        .isNumeric()
        .withMessage('Budget must be a number')
        .isFloat({ min: 0 })
        .withMessage('Budget must be a positive number'),

    body('currency')
        .optional()
        .isIn(['USD', 'KES'])
        .withMessage('Currency must be USD or KES'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Project description is required')
        .isLength({ min: 10, max: 2000 })
        .withMessage('Description must be between 10 and 2000 characters'),

    // Service-specific validations
    body('features')
        .optional()
        .isArray()
        .withMessage('Features must be an array'),

    body('features.*')
        .optional()
        .isIn(['Frontend', 'Backend', 'Database', 'API', 'Authentication'])
        .withMessage('Invalid feature selected'),

    body('hosting')
        .optional()
        .isIn(['Yes', 'No', 'Advice'])
        .withMessage('Invalid hosting option'),

    body('domain')
        .optional()
        .isIn(['Yes', 'No', 'Advice'])
        .withMessage('Invalid domain option'),

    body('maintenance')
        .optional()
        .isIn(['None', 'Monthly', 'Quarterly', 'Yearly', 'Custom'])
        .withMessage('Invalid maintenance option'),

    body('designType')
        .optional()
        .isArray()
        .withMessage('Design type must be an array'),

    body('designType.*')
        .optional()
        .isIn(['Website', 'Mobile App', 'Dashboard', 'Branding'])
        .withMessage('Invalid design type selected'),

    body('platforms')
        .optional()
        .isArray()
        .withMessage('Platforms must be an array'),

    body('platforms.*')
        .optional()
        .isIn(['Desktop', 'Tablet', 'Mobile'])
        .withMessage('Invalid platform selected'),

    body('pages')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Pages description cannot exceed 50 characters'),

    body('marketingChannels')
        .optional()
        .isArray()
        .withMessage('Marketing channels must be an array'),

    body('marketingChannels.*')
        .optional()
        .isIn(['Social Media', 'SEO', 'Content Marketing', 'Email Marketing', 'PPC'])
        .withMessage('Invalid marketing channel selected'),

    body('campaignDuration')
        .optional()
        .isIn(['1 Month', '3 Months', '6 Months', '12 Months', 'Ongoing'])
        .withMessage('Invalid campaign duration'),

    body('targetAudience')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Target audience description cannot exceed 1000 characters'),

    handleValidationErrors
];

/**
 * Validation rules for updating quote status
 */
export const validateUpdateStatus = [
    param('id')
        .isMongoId()
        .withMessage('Invalid quote ID'),

    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed'])
        .withMessage('Invalid status value'),

    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters'),

    handleValidationErrors
];

/**
 * Validation rules for adding quote amount
 */
export const validateAddQuote = [
    param('id')
        .isMongoId()
        .withMessage('Invalid quote ID'),

    body('amount')
        .notEmpty()
        .withMessage('Quote amount is required')
        .isNumeric()
        .withMessage('Amount must be a number')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),

    body('currency')
        .optional()
        .isIn(['USD', 'KES'])
        .withMessage('Currency must be USD or KES'),

    handleValidationErrors
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
export const validateObjectId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),

    handleValidationErrors
];

/**
 * Validation rules for query parameters
 */
export const validateQueryParams = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),

    query('status')
        .optional()
        .isIn(['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed'])
        .withMessage('Invalid status filter'),

    query('service')
        .optional()
        .isIn([
            'Web Development',
            'Mobile App Design',
            'UI/UX Design',
            'E-commerce Solutions',
            'Digital Marketing',
            'Consulting & Automation'
        ])
        .withMessage('Invalid service filter'),

    query('sortBy')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'name', 'service', 'status', 'budget'])
        .withMessage('Invalid sort field'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),

    handleValidationErrors
];

/**
 * Validation rules for service parameter
 */
export const validateServiceParam = [
    param('service')
        .isIn([
            'Web Development',
            'Mobile App Design',
            'UI/UX Design',
            'E-commerce Solutions',
            'Digital Marketing',
            'Consulting & Automation'
        ])
        .withMessage('Invalid service type'),

    handleValidationErrors
];