import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

// Define the schema for environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(8000),

  // Database
  DATABASE: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('10m'),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  JWT_COOKIE_EXPIRES_IN: Joi.number().default(7),

  // Email
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
  EMAIL_USERNAME: Joi.string().required(),
  EMAIL_PASSWORD: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),

  // SendGrid
  SENDGRID_USERNAME: Joi.string().required(),
  SENDGRID_PASSWORD: Joi.string().required(),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),

  // Redis (optional)
  REDIS_URL: Joi.string().optional(),

  // Client URL
  CLIENT_URL: Joi.string().uri().default('http://localhost:3000'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

interface IConfig {
  env: string;
  port: number;
  database: {
    url: string;
  };
  jwt: {
    accessSecret: string;
    accessExpiresIn: string;

    refreshSecret: string;
    refreshExpiresIn: string;

    cookieExpiresIn: number;
  };
  email: {
    host: string;
    port: number;
    username: string;
    password: string;
    from: string;
  };
  sendgrid: {
    username: string;
    password: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret?: string;
  };
  redis: {
    url?: string;
  };
  client: {
    url: string;
  };
}

// Export validated environment variables
const config: IConfig = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    url: envVars.DATABASE.replace('<PASSWORD>', envVars.DATABASE_PASSWORD || ''),
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    accessExpiresIn: envVars.JWT_ACCESS_EXPIRES_IN,

    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,

    cookieExpiresIn: envVars.JWT_COOKIE_EXPIRES_IN,
  },
  email: {
    host: envVars.EMAIL_HOST,
    port: envVars.EMAIL_PORT,
    username: envVars.EMAIL_USERNAME,
    password: envVars.EMAIL_PASSWORD,
    from: envVars.EMAIL_FROM,
  },
  sendgrid: {
    username: envVars.SENDGRID_USERNAME,
    password: envVars.SENDGRID_PASSWORD,
  },
  stripe: {
    secretKey: envVars.STRIPE_SECRET_KEY,
    webhookSecret: envVars.STRIPE_WEBHOOK_SECRET,
  },
  redis: {
    url: envVars.REDIS_URL,
  },
  client: {
    url: envVars.CLIENT_URL,
  },
};

export default config;
