# OMYTECH Quote Request API

A professional REST API for automated quote generation and management, built with Node.js, Express, and MongoDB. This API automatically calculates and delivers quotes for various digital services including web development, mobile apps, UI/UX design, e-commerce, digital marketing, and consulting.

## Features

### Core Functionality

- **Automatic Quote Generation** - Intelligent pricing based on service complexity and requirements
- **Real-time Email Notifications** - Professional email templates for customers and admins
- **Service Pricing Calculator** - Dynamic pricing with complexity analysis
- **Admin Dashboard** - Comprehensive quote management and analytics
- **JWT Authentication** - Secure admin access with token-based authentication

### Technical Features

- **RESTful API Design** - Clean, consistent API endpoints
- **Input Validation** - Comprehensive request validation with detailed error messages
- **Rate Limiting** - Protection against abuse with configurable limits
- **Security Headers** - Helmet.js integration for enhanced security
- **Error Handling** - Centralized error management with proper HTTP status codes
- **Database Integration** - MongoDB with Mongoose ODM
- **Email Integration** - Nodemailer with HTML templates

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Services & Pricing](#services--pricing)
- [Authentication](#authentication)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB installation
- SMTP email service (Gmail, SendGrid, etc.)

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/omytech/quote-request-api.git
   cd ExpressJSCustomerQuoteRequestRestAPI
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

The API will be available at `http://localhost:3001`

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quotes

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_TO=admin@omytech.com

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=24h

# Admin Credentials (Demo)
ADMIN_EMAIL=admin@omytech.com
ADMIN_PASSWORD=admin123
```

## API Endpoints

### Public Endpoints

| Method | Endpoint                        | Description                                   |
| ------ | ------------------------------- | --------------------------------------------- |
| GET    | `/api`                          | API information and available endpoints       |
| GET    | `/api/ping`                     | Simple connectivity test                      |
| GET    | `/api/health`                   | Comprehensive health check                    |
| GET    | `/api/services`                 | Get all available services with pricing       |
| GET    | `/api/services/:serviceName`    | Get specific service details                  |
| POST   | `/api/services/calculate-price` | Calculate estimated price for a service       |
| POST   | `/api/quotes`                   | Submit a quote request (auto-generates quote) |

### Admin Endpoints (Authentication Required)

| Method | Endpoint                   | Description                    |
| ------ | -------------------------- | ------------------------------ |
| POST   | `/api/auth/login`          | Admin login                    |
| GET    | `/api/quotes`              | Get all quotes with pagination |
| GET    | `/api/quotes/:id`          | Get specific quote             |
| PATCH  | `/api/quotes/:id/status`   | Update quote status            |
| DELETE | `/api/quotes/:id`          | Delete quote                   |
| GET    | `/api/admin/dashboard`     | Admin dashboard data           |
| GET    | `/api/admin/system-status` | System health status           |

## Services & Pricing

### Available Services

| Service                 | Base Price (KES) | Base Price (USD) | Complexity Levels             |
| ----------------------- | ---------------- | ---------------- | ----------------------------- |
| Web Development         | 30,000           | 230              | Basic, Intermediate, Advanced |
| Mobile App Design       | 50,000           | 385              | Basic, Intermediate, Advanced |
| UI/UX Design            | 20,000           | 154              | Basic, Intermediate, Advanced |
| E-commerce Solutions    | 40,000           | 308              | Basic, Intermediate, Advanced |
| Digital Marketing       | 10,000           | 77               | Basic, Intermediate, Advanced |
| Consulting & Automation | 15,000           | 115              | Basic, Intermediate, Advanced |

### Pricing Multipliers

- **Basic**: 1.0x (Standard projects)
- **Intermediate**: 1.8-2.5x (Enhanced features)
- **Advanced**: 2.5-4.0x (Complex, enterprise-level)

### Add-on Services

- **Web Hosting**: KES 1,300-6,500/month
- **Domain Registration**: KES 1,950-2,600/year
- **SSL Certificate**: KES 6,500-19,500/year
- **Maintenance Plans**: KES 13,000-104,000/year

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Admin endpoints require a valid JWT token.

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@omytech.com",
    "password": "admin123"
  }'
```

### Using the Token

```bash
curl -X GET http://localhost:3001/api/quotes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Usage Examples

### 1. Submit a Quote Request

```bash
curl -X POST http://localhost:3001/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+254712345678",
    "service": "Web Development",
    "timeline": "1-2 months",
    "budget": 50000,
    "currency": "KES",
    "description": "Need a business website with contact forms",
    "features": ["Frontend", "Backend"],
    "hosting": "Yes",
    "domain": "Yes",
    "maintenance": "Monthly"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "Quote request submitted and quote sent successfully",
  "data": {
    "quote": {
      "_id": "6939bb3c4995b3226ab23f52",
      "name": "John Doe",
      "email": "john@example.com",
      "service": "Web Development",
      "budget": 50000,
      "quotedAmount": 70250,
      "status": "quoted",
      "createdAt": "2025-12-10T18:26:04.889Z"
    },
    "priceBreakdown": {
      "complexity": "intermediate",
      "servicePrice": 54000,
      "addons": [
        { "name": "Web Hosting", "price": 1300 },
        { "name": "Domain Registration", "price": 1950 }
      ],
      "totalPrice": 70250
    }
  }
}
```

### 2. Get Service Information

```bash
curl -X GET http://localhost:3001/api/services/Web%20Development
```

### 3. Calculate Price Estimate

```bash
curl -X POST "http://localhost:3001/api/services/calculate-price?service=Web%20Development&complexity=intermediate&currency=KES&addons=hosting,domain"
```

### 4. Admin: Get All Quotes

```bash
curl -X GET "http://localhost:3001/api/quotes?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
ExpressJSCustomerQuoteRequestRestAPI/
├── config/
│   └── env.js                 # Environment configuration
├── constants/
│   └── services.js            # Service definitions and pricing
├── controllers/
│   └── quote.js               # Quote business logic
├── database/
│   └── mongodb.js             # Database connection and utilities
├── middleware/
│   ├── auth.js                # Authentication middleware
│   ├── errorHandler.js        # Error handling middleware
│   ├── rateLimiter.js         # Rate limiting configuration
│   ├── security.js            # Security headers and sanitization
│   └── validation.js          # Input validation rules
├── models/
│   └── quote.js               # Quote data model (Mongoose schema)
├── routes/
│   ├── admin.js               # Admin management routes
│   ├── auth.js                # Authentication routes
│   ├── index.js               # Main API routes
│   ├── quotes.js              # Quote management routes
│   └── services.js            # Service information routes
├── utils/
│   └── nodemailer.js          # Email utilities and templates
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── app.js                     # Express application setup
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Environment Variables

| Variable        | Description               | Required | Default               |
| --------------- | ------------------------- | -------- | --------------------- |
| `PORT`          | Server port               | No       | 3001                  |
| `NODE_ENV`      | Environment mode          | No       | development           |
| `MONGODB_URI`   | MongoDB connection string | Yes      | -                     |
| `SMTP_HOST`     | SMTP server host          | Yes      | -                     |
| `SMTP_USER`     | SMTP username             | Yes      | -                     |
| `SMTP_PASSWORD` | SMTP password             | Yes      | -                     |
| `JWT_SECRET`    | JWT signing secret        | Yes      | -                     |
| `CORS_ORIGIN`   | Allowed CORS origin       | No       | http://localhost:3000 |

## API Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Detailed error information (for validation errors)
  ]
}
```

## Rate Limiting

| Endpoint Type    | Limit        | Window     |
| ---------------- | ------------ | ---------- |
| General API      | 100 requests | 15 minutes |
| Quote Creation   | 5 requests   | 1 hour     |
| Admin Operations | 200 requests | 15 minutes |
| Authentication   | 10 requests  | 15 minutes |

## Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing protection
- **Rate Limiting** - Request throttling
- **Input Sanitization** - XSS protection
- **JWT Authentication** - Secure token-based auth
- **Request Validation** - Comprehensive input validation
- **Error Handling** - Secure error responses

## Testing

### Health Check

```bash
curl http://localhost:3001/api/health
```

### API Information

```bash
curl http://localhost:3001/api
```

### Connectivity Test

```bash
curl http://localhost:3001/api/ping
```

## Monitoring

The API provides several monitoring endpoints:

- `/api/health` - System health status
- `/api/admin/system-status` - Detailed system information
- `/api/admin/dashboard` - Business metrics and analytics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and inquiries:

- **Email**: omytechkenya@gmail.com
- **Website**: [omytech.co.ke](https://omytech.vercel.app)
- **GitHub**: [github.com/omytech-kenya](https://github.com/omytech)

## Acknowledgments

- Built with Express.js and MongoDB
- Email templates powered by Nodemailer
- Security enhanced with Helmet.js
- Authentication using JSON Web Tokens

---

**OmyTech** - Professional Web Development & Digital Solutions
