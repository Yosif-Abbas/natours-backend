import logger from '../config/logger';
import { Request, Response, NextFunction } from 'express';

// Request logging middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log request start
  logger.debug('Request started', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user ? (req as any).user._id : null,
  });

  // Keep reference to the original end method
  const originalEnd = res.end;

  // Override res.end with a correctly typed function
  res.end = function (
    this: Response,
    chunk?: any,
    encodingOrCb?: BufferEncoding | (() => void),
    cb?: () => void,
  ): Response {
    const responseTime = Date.now() - startTime;

    // Log the request completion
    logger.logRequest(req, res, responseTime);

    // Call original .end() safely
    return originalEnd.call(this, chunk, encodingOrCb as any, cb);
  };

  next();
};

// Error logging middleware
const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.logError(error, req);
  next(error);
};

// Security event logging
const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log failed authentication attempts
  if (req.path.includes('/login') && req.method === 'POST') {
    const originalJson = res.json;
    res.json = function (data) {
      if (res.statusCode === 401) {
        logger.logSecurity('Failed login attempt', {
          email: req.body.email,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
        });
      } else if (res.statusCode === 200) {
        logger.logSecurity('Successful login', {
          email: req.body.email,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
        });
      }
      return originalJson.call(this, data);
    };
  }

  // Log password reset attempts
  if (req.path.includes('/forgotPassword') && req.method === 'POST') {
    const originalJson = res.json;
    res.json = function (data) {
      logger.logSecurity('Password reset requested', {
        email: req.body.email,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });
      return originalJson.call(this, data);
    };
  }

  // Log admin actions
  if (req.user && ['admin', 'lead-guide'].includes(req.user.role)) {
    const originalJson = res.json;
    res.json = function (data) {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        logger.logSecurity('Admin action performed', {
          action: `${req.method} ${req.originalUrl}`,
          userId: req.user!._id,
          userRole: req.user!.role,
          ip: req.ip || req.connection.remoteAddress,
        });
      }
      return originalJson.call(this, data);
    };
  }

  next();
};

// Business event logging
const businessLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log tour bookings
  if (req.path.includes('/bookings') && req.method === 'POST') {
    const originalJson = res.json;
    res.json = function (data: any) {
      if (res.statusCode === 201) {
        logger.logBusiness('Tour booking created', {
          tourId: req.body.tour,
          userId: req.user ? req.user._id : null,
          price: req.body.price,
        });
      }
      return originalJson.call(this, data);
    };
  }

  // Log tour creation
  if (req.path.includes('/tours') && req.method === 'POST') {
    const originalJson = res.json;
    res.json = function (data: any) {
      if (res.statusCode === 201) {
        logger.logBusiness('Tour created', {
          tourId: data.data ? data.data._id : null,
          tourName: req.body.name,
          createdBy: req.user ? req.user._id : null,
        });
      }
      return originalJson.call(this, data);
    };
  }

  // Log user registration
  if (req.path.includes('/signup') && req.method === 'POST') {
    const originalJson = res.json;
    res.json = function (data: any) {
      if (res.statusCode === 201) {
        logger.logBusiness('User registered', {
          userId: data.data ? data.data._id : null,
          email: req.body.email,
          role: req.body.role || 'user',
        });
      }
      return originalJson.call(this, data);
    };
  }

  next();
};

export { requestLogger, errorLogger, securityLogger, businessLogger };
