import path from 'path';
import express from 'express';

import swaggerUi from 'swagger-ui-express';

import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import specs from './config/swagger';

import AppError from './utils/appError';
import globalErrorHandler from './utils/error';

import tourRouter from './routes/tourRoutes';
import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import reviewRouter from './routes/reviewRoutes';
import bookingRouter from './routes/bookingRoutes';

// import { swaggerUi, specs } from './config/swagger';

import config from './config/envValidation';

const app = express();

// 1️⃣ CORS Configuration
app.use(cors({ origin: '*', optionsSuccessStatus: 200 }));

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui.css',
    customJs: [
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui-bundle.js',
      'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js',
    ],
    customSiteTitle: 'Natours API Documentation',
  }),
);

// 2️⃣ Serve static files
app.use(express.static(path.join(process.cwd(), 'public')));

// 3️⃣ Limiters, middleware, etc.
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!.',
});
app.use('/api', limiter);

// 4️⃣ Conditional Helmet CSP
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

// Morgan HTTP logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

app.use((req, res, next) => {
  req.created_at = new Date().toISOString();
  next();
});

// API Documentation

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error logging middleware (must be before global error handler)

app.use(globalErrorHandler);

export default app;
