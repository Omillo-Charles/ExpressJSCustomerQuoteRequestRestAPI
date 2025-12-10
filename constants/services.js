/**
 * OMYTECH Services and Pricing Constants
 * All prices are base prices and may vary based on project complexity
 */

// Service categories and their details
export const SERVICES = {
    WEB_DEVELOPMENT: {
        name: 'Web Development',
        description: 'Custom web applications and websites',
        category: 'development',
        features: ['Frontend', 'Backend', 'Database', 'API', 'Authentication'],
        basePrice: {
            USD: 230,
            KES: 30000
        },
        priceRange: {
            USD: { min: 150, max: 2300 },
            KES: { min: 20000, max: 300000 }
        },
        timeline: '2-12 weeks',
        complexity: {
            basic: {
                description: 'Simple static websites or basic web apps',
                multiplier: 1.0,
                features: ['Responsive Design', 'Basic SEO', 'Contact Forms']
            },
            intermediate: {
                description: 'Dynamic websites with CMS or e-commerce',
                multiplier: 1.8,
                features: ['Database Integration', 'User Authentication', 'Admin Panel', 'Payment Integration']
            },
            advanced: {
                description: 'Complex web applications with custom features',
                multiplier: 3.0,
                features: ['Custom APIs', 'Third-party Integrations', 'Advanced Security', 'Scalable Architecture']
            }
        }
    },

    MOBILE_APP_DESIGN: {
        name: 'Mobile App Design',
        description: 'Native and cross-platform mobile applications',
        category: 'development',
        features: ['iOS Development', 'Android Development', 'Cross-platform', 'API Integration', 'Push Notifications'],
        basePrice: {
            USD: 385,
            KES: 50000
        },
        priceRange: {
            USD: { min: 230, max: 3850 },
            KES: { min: 30000, max: 500000 }
        },
        timeline: '4-16 weeks',
        complexity: {
            basic: {
                description: 'Simple apps with basic functionality',
                multiplier: 1.0,
                features: ['Basic UI/UX', 'Local Storage', 'Simple Navigation']
            },
            intermediate: {
                description: 'Apps with backend integration and moderate features',
                multiplier: 2.0,
                features: ['API Integration', 'User Authentication', 'Push Notifications', 'In-app Purchases']
            },
            advanced: {
                description: 'Complex apps with advanced features and integrations',
                multiplier: 3.5,
                features: ['Real-time Features', 'Advanced Analytics', 'Complex Integrations', 'Offline Functionality']
            }
        }
    },

    UI_UX_DESIGN: {
        name: 'UI/UX Design',
        description: 'User interface and user experience design services',
        category: 'design',
        features: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Usability Testing'],
        basePrice: {
            USD: 154,
            KES: 20000
        },
        priceRange: {
            USD: { min: 77, max: 770 },
            KES: { min: 10000, max: 100000 }
        },
        timeline: '1-6 weeks',
        designTypes: ['Website', 'Mobile App', 'Dashboard', 'Branding'],
        platforms: ['Desktop', 'Tablet', 'Mobile'],
        complexity: {
            basic: {
                description: 'Simple designs with standard layouts',
                multiplier: 1.0,
                deliverables: ['Wireframes', 'Basic Mockups', 'Style Guide']
            },
            intermediate: {
                description: 'Custom designs with interactive elements',
                multiplier: 1.8,
                deliverables: ['Interactive Prototypes', 'Detailed Mockups', 'Component Library', 'User Journey Maps']
            },
            advanced: {
                description: 'Complex designs with extensive user research',
                multiplier: 2.5,
                deliverables: ['User Research', 'Advanced Prototypes', 'Design System', 'Usability Testing', 'Animation Specs']
            }
        }
    },

    ECOMMERCE_SOLUTIONS: {
        name: 'E-commerce Solutions',
        description: 'Complete e-commerce platforms and online stores',
        category: 'development',
        features: ['Product Catalog', 'Shopping Cart', 'Payment Gateway', 'Order Management', 'Inventory Management'],
        basePrice: {
            USD: 308,
            KES: 40000
        },
        priceRange: {
            USD: { min: 185, max: 3080 },
            KES: { min: 24000, max: 400000 }
        },
        timeline: '3-12 weeks',
        complexity: {
            basic: {
                description: 'Simple online store with basic features',
                multiplier: 1.0,
                features: ['Product Listings', 'Basic Cart', 'Simple Checkout', 'Order Notifications']
            },
            intermediate: {
                description: 'Full-featured e-commerce platform',
                multiplier: 2.2,
                features: ['Advanced Product Management', 'Multiple Payment Options', 'Inventory Tracking', 'Customer Accounts', 'Basic Analytics']
            },
            advanced: {
                description: 'Enterprise e-commerce solution',
                multiplier: 4.0,
                features: ['Multi-vendor Support', 'Advanced Analytics', 'Custom Integrations', 'Mobile App', 'Advanced SEO']
            }
        }
    },

    DIGITAL_MARKETING: {
        name: 'Digital Marketing',
        description: 'Comprehensive digital marketing and SEO services',
        category: 'marketing',
        features: ['SEO Optimization', 'Social Media Marketing', 'Content Marketing', 'PPC Advertising', 'Analytics'],
        basePrice: {
            USD: 77,
            KES: 10000
        },
        priceRange: {
            USD: { min: 38, max: 385 },
            KES: { min: 5000, max: 50000 }
        },
        timeline: '1-12 months',
        channels: ['Social Media', 'SEO', 'Content Marketing', 'Email Marketing', 'PPC'],
        campaignDurations: ['1 Month', '3 Months', '6 Months', '12 Months', 'Ongoing'],
        complexity: {
            basic: {
                description: 'Basic digital marketing package',
                multiplier: 1.0,
                services: ['Basic SEO', 'Social Media Setup', 'Content Calendar']
            },
            intermediate: {
                description: 'Comprehensive marketing strategy',
                multiplier: 2.0,
                services: ['Advanced SEO', 'Paid Advertising', 'Content Creation', 'Analytics Reporting']
            },
            advanced: {
                description: 'Full-scale digital marketing campaign',
                multiplier: 3.0,
                services: ['Multi-channel Campaigns', 'Advanced Analytics', 'Marketing Automation', 'Conversion Optimization']
            }
        }
    },

    CONSULTING_AUTOMATION: {
        name: 'Consulting & Automation',
        description: 'Business process automation and technical consulting',
        category: 'consulting',
        features: ['Process Analysis', 'Automation Solutions', 'System Integration', 'Technical Consulting', 'Training'],
        basePrice: {
            USD: 115,
            KES: 15000
        },
        priceRange: {
            USD: { min: 58, max: 770 },
            KES: { min: 7500, max: 100000 }
        },
        timeline: '1-8 weeks',
        complexity: {
            basic: {
                description: 'Simple automation or consultation',
                multiplier: 1.0,
                services: ['Process Assessment', 'Basic Automation', 'Documentation']
            },
            intermediate: {
                description: 'Comprehensive automation solutions',
                multiplier: 2.5,
                services: ['Custom Automation', 'System Integration', 'Staff Training', 'Ongoing Support']
            },
            advanced: {
                description: 'Enterprise-level automation and consulting',
                multiplier: 4.0,
                services: ['Complex Integrations', 'Custom Development', 'Change Management', 'Long-term Support']
            }
        }
    }
};

// Additional service options and pricing
export const SERVICE_ADDONS = {
    hosting: {
        name: 'Web Hosting',
        prices: {
            basic: { USD: 10, KES: 1300, period: 'monthly' },
            premium: { USD: 25, KES: 3250, period: 'monthly' },
            enterprise: { USD: 50, KES: 6500, period: 'monthly' }
        }
    },
    domain: {
        name: 'Domain Registration',
        prices: {
            '.com': { USD: 15, KES: 1950, period: 'yearly' },
            '.co.ke': { USD: 20, KES: 2600, period: 'yearly' },
            '.org': { USD: 18, KES: 2340, period: 'yearly' }
        }
    },
    maintenance: {
        name: 'Website Maintenance',
        prices: {
            monthly: { USD: 100, KES: 13000, period: 'monthly' },
            quarterly: { USD: 250, KES: 32500, period: 'quarterly' },
            yearly: { USD: 800, KES: 104000, period: 'yearly' }
        }
    },
    ssl: {
        name: 'SSL Certificate',
        prices: {
            basic: { USD: 50, KES: 6500, period: 'yearly' },
            premium: { USD: 150, KES: 19500, period: 'yearly' }
        }
    }
};

// Discount and pricing rules
export const PRICING_RULES = {
    discounts: {
        student: 0.15, // 15% discount for students
        nonprofit: 0.20, // 20% discount for non-profits
        bulk: 0.10, // 10% discount for multiple services
        returning: 0.05 // 5% discount for returning customers
    },
    rushFees: {
        urgent: 0.50, // 50% rush fee for urgent projects (< 1 week)
        expedited: 0.25 // 25% rush fee for expedited projects (< 2 weeks)
    },
    minimums: {
        USD: 38,
        KES: 5000
    }
};

// Service categories for filtering and organization
export const SERVICE_CATEGORIES = {
    DEVELOPMENT: 'development',
    DESIGN: 'design',
    MARKETING: 'marketing',
    CONSULTING: 'consulting'
};

// Timeline options
export const TIMELINES = [
    '1-2 weeks',
    '3-4 weeks',
    '1-2 months',
    '3-6 months',
    '6+ months',
    'Flexible'
];

// Currency options
export const CURRENCIES = {
    USD: {
        symbol: '$',
        name: 'US Dollar',
        code: 'USD'
    },
    KES: {
        symbol: 'KSh',
        name: 'Kenyan Shilling',
        code: 'KES'
    }
};

// Status options for quotes
export const QUOTE_STATUSES = {
    PENDING: 'pending',
    REVIEWED: 'reviewed',
    QUOTED: 'quoted',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    COMPLETED: 'completed'
};

// Priority levels
export const PRIORITY_LEVELS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

/**
 * Calculate estimated price for a service
 * @param {string} serviceName - Name of the service
 * @param {string} complexity - Complexity level (basic, intermediate, advanced)
 * @param {string} currency - Currency code (USD, KES)
 * @param {Array} addons - Additional services
 * @returns {Object} Price calculation details
 */
export const calculateEstimatedPrice = (serviceName, complexity = 'basic', currency = 'USD', addons = []) => {
    const service = Object.values(SERVICES).find(s => s.name === serviceName);

    if (!service) {
        throw new Error('Service not found');
    }

    const basePrice = service.basePrice[currency];
    const multiplier = service.complexity[complexity]?.multiplier || 1.0;
    const servicePrice = Math.round(basePrice * multiplier);

    let addonPrice = 0;
    const addonDetails = [];

    addons.forEach(addon => {
        if (SERVICE_ADDONS[addon]) {
            const addonService = SERVICE_ADDONS[addon];
            // Use basic pricing for addons by default
            const price = addonService.prices.basic?.[currency] ||
                addonService.prices[Object.keys(addonService.prices)[0]]?.[currency] || 0;
            addonPrice += price;
            addonDetails.push({
                name: addonService.name,
                price: price,
                currency: currency
            });
        }
    });

    const totalPrice = servicePrice + addonPrice;

    return {
        service: serviceName,
        complexity,
        currency,
        basePrice,
        multiplier,
        servicePrice,
        addons: addonDetails,
        addonPrice,
        totalPrice,
        priceRange: service.priceRange[currency],
        timeline: service.timeline
    };
};

/**
 * Get all available services
 * @returns {Array} Array of service objects
 */
export const getAllServices = () => {
    return Object.values(SERVICES);
};

/**
 * Get services by category
 * @param {string} category - Service category
 * @returns {Array} Array of services in the category
 */
export const getServicesByCategory = (category) => {
    return Object.values(SERVICES).filter(service => service.category === category);
};

/**
 * Get service by name
 * @param {string} name - Service name
 * @returns {Object} Service object
 */
export const getServiceByName = (name) => {
    return Object.values(SERVICES).find(service => service.name === name);
};