# Natours - Modern Tourism API

A comprehensive, production-ready tourism booking API built with Node.js, Express, and MongoDB. This application has been modernized with security best practices, caching, comprehensive testing, and proper logging.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with password reset functionality
- **Role-based Authorization**: User, Guide, Lead Guide, and Admin roles
- **Tour Management**: CRUD operations for tours with image uploads
- **Booking System**: Tour booking with Stripe payment integration
- **Review System**: User reviews and ratings for tours
- **Advanced Filtering**: Complex tour filtering, sorting, and pagination
- **Geospatial Queries**: Find tours within specific distances
- **Email Notifications**: Welcome emails and password reset functionality
- **Image Processing**: Automatic image resizing and optimization
- **Caching**: Redis-based caching for improved performance
- **API Documentation**: Comprehensive Swagger/OpenAPI documentation
- **Comprehensive Testing**: Unit and integration tests with Jest
- **Structured Logging**: Winston-based logging with rotation
- **Security**: Rate limiting, CORS, XSS protection, and more

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Sharp for image processing
- **Payments**: Stripe
- **Email**: Nodemailer with SendGrid
- **Caching**: Redis
- **Testing**: Jest with Supertest
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston with daily rotation
- **Security**: Helmet, CORS, Rate limiting, XSS protection

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Redis (for caching)
- Stripe account (for payments)
- SendGrid account (for emails)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd natours
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy the example environment file
   cp config/env.example .env

   # Edit the .env file with your actual values
   nano .env
   ```

4. **Required Environment Variables**

   ```env
   # Database
   NODE_ENV=development
   PORT=8000
   DATABASE=mongodb+srv://username:<PASSWORD>@cluster.mongodb.net/database
   DATABASE_PASSWORD=your_secure_password

   # JWT
   JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters_long
   JWT_EXPIRES_IN=90d
   JWT_COOKIE_EXPIRES_IN=90

   # Email (Mailtrap for development)
   EMAIL_HOST=sandbox.smtp.mailtrap.io
   EMAIL_PORT=25
   EMAIL_USERNAME=your_mailtrap_username
   EMAIL_PASSWORD=your_mailtrap_password
   EMAIL_FROM=your_email@domain.com

   # SendGrid (for production)
   SENDGRID_USERNAME=apikey
   SENDGRID_PASSWORD=your_sendgrid_api_key

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Redis (optional)
   REDIS_URL=redis://localhost:6379

   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

5. **Start Redis** (if using local Redis)

   ```bash
   redis-server
   ```

6. **Run the application**

   ```bash
   # Development
   npm start

   # Production
   npm run start:prod
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/api-docs`
- **API Base URL**: `http://localhost:8000/api/v1`

## 🔐 Security Features

- **Environment Validation**: All environment variables are validated on startup
- **Rate Limiting**: 100 requests per hour per IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **XSS Protection**: Cross-site scripting protection
- **MongoDB Sanitization**: NoSQL injection protection
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation

## 📊 Logging

Logs are stored in the `logs/` directory with daily rotation:

- `application-YYYY-MM-DD.log`: General application logs
- `error-YYYY-MM-DD.log`: Error logs only
- `access-YYYY-MM-DD.log`: HTTP access logs
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

## 🚀 Deployment

### Docker Deployment

1. **Build the Docker image**

   ```bash
   docker build -t natours-api .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

## 📁 Project Structure

```
natours-backend/
├── config/                 # Configuration files
│   ├── envValidation.ts    # Environment validation
│   ├── redis.ts           # Redis configuration
│   └── swagger.ts         # API documentation
├── controllers/           # Route controllers
├── models/               # Mongoose models
├── routes/               # Express routes
├── tests/                # Test files
├── utils/                # Utility functions
├── public/               # Static files
└── logs/                 # Log files (created at runtime)
```

## 🔄 API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `PATCH /api/v1/auth/reset-password/:token` - Password reset
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `PATCH /api/v1/auth/update-my-password` - Update current user's password

### Tours

- `GET /api/v1/tours` - Get all tours (with filtering, sorting, pagination)
- `GET /api/v1/tours/:id` - Get specific tour
- `POST /api/v1/tours` - Create tour (admin/lead-guide only)
- `PATCH /api/v1/tours/:id` - Update tour (admin/lead-guide only)
- `DELETE /api/v1/tours/:id` - Delete tour (admin/lead-guide only)
- `GET /api/v1/tours/top-5-cheap` - Get top 5 cheapest tours
- `GET /api/v1/tours/tour-stats` - Get tour statistics

### Reviews

- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get specific review
- `PATCH /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Bookings

- `GET /api/v1/bookings` - Get user bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get specific booking
- `PATCH /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Delete booking
