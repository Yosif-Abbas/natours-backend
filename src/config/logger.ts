import { Request, Response } from 'express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import config from './envValidation';
import { ILogger } from '../types/logger';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint(),
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  }),
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../..', 'logs');

// Create logger instance
const baseLogger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'natours-api' },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: config.env === 'development' ? consoleFormat : logFormat,
    }),

    // File transport for all logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: logFormat,
    }),

    // Separate file for error logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      format: logFormat,
    }),

    // Separate file for access logs
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      format: logFormat,
    }),
  ],

  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: logFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: logFormat,
    }),
  ],
});

const logger: ILogger = Object.assign(baseLogger, {
  logRequest(req: Request, res: Response, responseTime: number) {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user._id : null,
    };

    if (res.statusCode >= 400) {
      baseLogger.warn('HTTP Request', logData);
    } else {
      baseLogger.info('HTTP Request', logData);
    }
  },

  logError(error: Error, req?: Request) {
    const errorData: {
      message: string;
      stack: string | undefined;
      name: string;
      request?: Record<string, any>;
    } = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };

    if (req) {
      errorData.request = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user ? req.user._id : null,
      };
    }

    baseLogger.error('Application Error', errorData);
  },

  logSecurity: (event: string, details?: Record<string, any>) => {
    baseLogger.warn('Security Event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  logBusiness: (event: string, details?: Record<string, any>) => {
    baseLogger.info('Business Event', {
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  },

  stream: {
    write: (message: string) => {
      baseLogger.http?.(message.trim()) ?? baseLogger.info(message.trim());
    },
  },
});

// Add custom log levels
logger.add(
  new winston.transports.Console({
    level: 'http',
    format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
  }),
);

// Don't log in test environment
if (config.env === 'test') {
  logger.transports.forEach((transport: winston.transport) => {
    transport.silent = true;
  });
}

export default logger;
