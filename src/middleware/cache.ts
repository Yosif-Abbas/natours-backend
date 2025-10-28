import { Request, Response, NextFunction, RequestHandler } from 'express';
import { cache, redis } from '../config/redis';

// Cache middleware for GET requests
const cacheMiddleware = (ttl = 3600): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query parameters
    const cacheKey = `cache:${req.originalUrl}`;

    try {
      // Try to get cached data
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache hit for key: ${cacheKey}`);
        return res.status(200).json({
          status: 'success',
          data: cachedData,
          cached: true,
        });
      }

      // If no cache, continue to route handler
      console.log(`❌ Cache miss for key: ${cacheKey}`);
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache response middleware
const cacheResponse = (ttl = 3600): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to cache the response
    res.json = function (data) {
      // Only cache successful responses
      if (res.statusCode === 200 && data.status === 'success') {
        const cacheKey = `cache:${req.originalUrl}`;

        // Cache the data asynchronously (don't wait for it)
        cache.set(cacheKey, data.data || data, ttl).catch((error) => {
          console.error('Error caching response:', error);
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache for specific patterns
const clearCache = async (pattern: string): Promise<boolean> => {
  try {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Cleared ${keys.length} cache entries matching pattern: ${pattern}`);
    }

    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};

// Clear cache middleware for POST/PUT/DELETE requests
const clearCacheMiddleware = (patterns: string[] = []): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json method
    const originalJson = res.json;

    // Override res.json to clear cache after successful operations
    res.json = function (data) {
      // Only clear cache for successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Clear cache asynchronously
        patterns.forEach((pattern) => {
          clearCache(pattern).catch((error) => {
            console.error('Error clearing cache pattern:', pattern, error);
          });
        });
      }

      // Call original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

export { cacheMiddleware, cacheResponse, clearCache, clearCacheMiddleware };
