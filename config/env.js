import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'SMTP_HOST',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'EMAIL_FROM',
    'EMAIL_TO',
    'JWT_SECRET'
];

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    process.exit(1);
}

// Environment configuration object
const config = {
    // Server configuration
    server: {
        port: parseInt(process.env.PORT) || 3001,
        nodeEnv: process.env.NODE_ENV || 'development',
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
    },

    // Database configuration
    database: {
        mongoUri: process.env.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },

    // Email/SMTP configuration
    email: {
        smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        },
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_TO
    },

    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Application settings
    app: {
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isTest: process.env.NODE_ENV === 'test'
    }
};

// Validate configuration
const validateConfig = () => {
    // Validate port
    if (isNaN(config.server.port) || config.server.port < 1 || config.server.port > 65535) {
        throw new Error('Invalid PORT: must be a number between 1 and 65535');
    }

    // Validate MongoDB URI format
    if (!config.database.mongoUri.startsWith('mongodb')) {
        throw new Error('Invalid MONGODB_URI: must start with mongodb:// or mongodb+srv://');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.email.from)) {
        throw new Error('Invalid EMAIL_FROM: must be a valid email address');
    }
    if (!emailRegex.test(config.email.to)) {
        throw new Error('Invalid EMAIL_TO: must be a valid email address');
    }

    // Validate JWT secret length
    if (config.jwt.secret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    console.log('✅ Environment configuration validated successfully');
};

// Run validation
try {
    validateConfig();
} catch (error) {
    console.error('❌ Configuration validation failed:', error.message);
    process.exit(1);
}

export default config;