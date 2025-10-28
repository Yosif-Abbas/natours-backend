import Redis from 'ioredis';
import config from './envValidation';

// Create Redis client
const redis = new Redis(config.redis.url || 'redis://localhost:6379', {
  lazyConnect: true,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000); // Exponential backoff, max 2 seconds
    return delay;
  },
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('close', () => {
  console.log('🔴 Redis connection closed');
});

// Cache utility functions
const cache = {
  // Set cache with TTL (Time To Live)
  async set(key: string, value: string | Record<string, any> | Array<any>, ttl = 3600) {
    try {
      const serializedValue = JSON.stringify(value);
      await redis.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  },

  // Get cache value
  async get(key: string) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  // Delete cache
  async del(key: string) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  },

  // Clear all cache
  async clear() {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  },

  // Check if key exists
  async exists(key: string) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  },

  // Set multiple keys
  async mset(keyValuePairs: Record<string, string | Record<string, any> | Array<any>>, ttl = 3600) {
    try {
      const pipeline = redis.pipeline();
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        pipeline.setex(key, ttl, JSON.stringify(value));
      });
      await pipeline.exec();
      return true;
    } catch (error) {
      console.error('Cache mset error:', error);
      return false;
    }
  },

  // Get multiple keys
  async mget(keys: string[]) {
    try {
      const values = await redis.mget(keys);
      return values.map((value: string | null) => (value ? JSON.parse(value) : null));
    } catch (error) {
      console.error('Cache mget error:', error);
      return [];
    }
  },
};

export { redis, cache };
