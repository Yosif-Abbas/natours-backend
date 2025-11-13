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

### Manual Deployment

1. **Set production environment variables**
2. **Install PM2 for process management**

   ```bash
   npm install -g pm2
   pm2 start server.js --name natours-api
   ```

3. **Set up reverse proxy** (Nginx recommended)
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

## 📁 Project Structure

```
natours/
├── config/                 # Configuration files
│   ├── envValidation.js    # Environment validation
│   ├── redis.js           # Redis configuration
│   └── swagger.js         # API documentation
├── controllers/           # Route controllers
├── models/               # Mongoose models
├── routes/               # Express routes
├── tests/                # Test files
├── utils/                # Utility functions
├── views/                # Pug templates
├── public/               # Static files
└── logs/                 # Log files (created at runtime)
```

## 🔄 API Endpoints

### Authentication

- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login
- `POST /api/v1/users/logout` - User logout
- `POST /api/v1/users/forgotPassword` - Password reset request
- `PATCH /api/v1/users/resetPassword/:token` - Password reset

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@natours.com or create an issue in the repository.

## 🔄 Recent Updates

- ✅ Added environment variable validation
- ✅ Updated to Mongoose 8.x
- ✅ Implemented Redis caching
- ✅ Added comprehensive API documentation
- ✅ Set up Jest testing framework
- ✅ Implemented Winston logging
- ✅ Enhanced security configurations
- ✅ Added CORS support
- ✅ Created Docker configuration
