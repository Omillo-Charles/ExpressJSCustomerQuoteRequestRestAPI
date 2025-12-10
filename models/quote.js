import mongoose from 'mongoose';

// Define the quote request schema
const quoteSchema = new mongoose.Schema({
    // Contact Information
    name: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    company: {
        type: String,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },

    // Project Details
    service: {
        type: String,
        required: [true, 'Service selection is required'],
        enum: {
            values: [
                'Web Development',
                'Mobile App Design',
                'UI/UX Design',
                'E-commerce Solutions',
                'Digital Marketing',
                'Consulting & Automation'
            ],
            message: 'Please select a valid service'
        }
    },
    timeline: {
        type: String,
        required: [true, 'Timeline is required'],
        enum: {
            values: ['1-2 weeks', '3-4 weeks', '1-2 months', '3-6 months', '6+ months', 'Flexible'],
            message: 'Please select a valid timeline'
        }
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [0, 'Budget must be a positive number']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        enum: {
            values: ['USD', 'KES'],
            message: 'Please select a valid currency'
        },
        default: 'USD'
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    // Service-specific fields for Web Development & Mobile App
    features: [{
        type: String,
        enum: ['Frontend', 'Backend', 'Database', 'API', 'Authentication']
    }],
    hosting: {
        type: String,
        enum: ['Yes', 'No', 'Advice'],
        required: function () {
            return this.service === 'Web Development' || this.service === 'Mobile App Design';
        }
    },
    domain: {
        type: String,
        enum: ['Yes', 'No', 'Advice'],
        required: function () {
            return this.service === 'Web Development' || this.service === 'Mobile App Design';
        }
    },
    maintenance: {
        type: String,
        enum: ['None', 'Monthly', 'Quarterly', 'Yearly', 'Custom'],
        required: function () {
            return this.service === 'Web Development' || this.service === 'Mobile App Design';
        }
    },

    // Service-specific fields for UI/UX Design
    designType: [{
        type: String,
        enum: ['Website', 'Mobile App', 'Dashboard', 'Branding']
    }],
    platforms: [{
        type: String,
        enum: ['Desktop', 'Tablet', 'Mobile']
    }],
    pages: {
        type: String,
        trim: true,
        required: function () {
            return this.service === 'UI/UX Design';
        }
    },

    // Service-specific fields for Digital Marketing
    marketingChannels: [{
        type: String,
        enum: ['Social Media', 'SEO', 'Content Marketing', 'Email Marketing', 'PPC']
    }],
    campaignDuration: {
        type: String,
        enum: ['1 Month', '3 Months', '6 Months', '12 Months', 'Ongoing'],
        required: function () {
            return this.service === 'Digital Marketing';
        }
    },
    targetAudience: {
        type: String,
        trim: true,
        maxlength: [1000, 'Target audience description cannot exceed 1000 characters'],
        required: function () {
            return this.service === 'Digital Marketing';
        }
    },

    // System fields
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    quotedAmount: {
        type: Number,
        min: [0, 'Quoted amount must be a positive number']
    },
    quotedCurrency: {
        type: String,
        enum: ['USD', 'KES'],
        default: 'USD'
    },
    assignedTo: {
        type: String,
        trim: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
quoteSchema.index({ email: 1 });
quoteSchema.index({ service: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ priority: 1, createdAt: -1 });

// Virtual for formatted budget
quoteSchema.virtual('formattedBudget').get(function () {
    return `${this.currency} ${this.budget.toLocaleString()}`;
});

// Virtual for formatted quoted amount
quoteSchema.virtual('formattedQuotedAmount').get(function () {
    if (this.quotedAmount) {
        return `${this.quotedCurrency} ${this.quotedAmount.toLocaleString()}`;
    }
    return null;
});

// Pre-save middleware to validate service-specific fields
quoteSchema.pre('save', function (next) {
    // Validate Web Development & Mobile App specific fields
    if ((this.service === 'Web Development' || this.service === 'Mobile App Design')) {
        if (!this.hosting || !this.domain || !this.maintenance) {
            return next(new Error('Hosting, domain, and maintenance fields are required for this service'));
        }
    }

    // Validate UI/UX Design specific fields
    if (this.service === 'UI/UX Design') {
        if (!this.pages || this.designType.length === 0 || this.platforms.length === 0) {
            return next(new Error('Design type, platforms, and pages are required for UI/UX Design service'));
        }
    }

    // Validate Digital Marketing specific fields
    if (this.service === 'Digital Marketing') {
        if (!this.campaignDuration || !this.targetAudience || this.marketingChannels.length === 0) {
            return next(new Error('Marketing channels, campaign duration, and target audience are required for Digital Marketing service'));
        }
    }

    next();
});

// Static method to get quotes by status
quoteSchema.statics.findByStatus = function (status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Static method to get quotes by service
quoteSchema.statics.findByService = function (service) {
    return this.find({ service }).sort({ createdAt: -1 });
};

// Static method to get recent quotes
quoteSchema.statics.findRecent = function (limit = 10) {
    return this.find().sort({ createdAt: -1 }).limit(limit);
};

// Instance method to update status
quoteSchema.methods.updateStatus = function (newStatus, notes = '') {
    this.status = newStatus;
    if (notes) {
        this.notes = notes;
    }
    return this.save();
};

// Instance method to add quote
quoteSchema.methods.addQuote = function (amount, currency = 'USD') {
    this.quotedAmount = amount;
    this.quotedCurrency = currency;
    this.status = 'quoted';
    return this.save();
};

// Create and export the model
const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;