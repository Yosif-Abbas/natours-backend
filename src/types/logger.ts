import type { Request, Response } from 'express';
import winston from 'winston';

export interface ILogger {
  logRequest(req: Request, res: Response, responseTime: number): void;
  logError(error: Error, req?: Request): void;
  logSecurity(event: string, details?: Record<string, any>): void;
  logBusiness(event: string, details?: Record<string, any>): void;
  stream: { write(message: string): void };

  info(message: string, meta?: Record<string, any>): void;
  error(message: string, meta?: Record<string, any>): void;
  http(message: string, meta?: Record<string, any>): void;
  debug(message: string, meta?: Record<string, any>): void;
  add(transport: winston.transport): void;
  transports: winston.transport[];
}
