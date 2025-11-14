import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import config from './envValidation';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Natours API',
      version: '1.0.0',
      description: 'A comprehensive API for a tour booking application',
      contact: {
        name: 'API Support',
        email: 'support@natours.com',
      },
    },
    servers: [
      {
        url: 'https://natours-backend-two.vercel.app/api/v1',
        description: 'Production server',
      },
      {
        url: `http://127.0.0.1:${config.port}/api/v1`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'passwordConfirm'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john@example.com',
            },
            role: {
              type: 'string',
              enum: ['user', 'guide', 'lead-guide', 'admin'],
              description: 'User role',
              example: 'user',
            },
            photo: {
              type: 'string',
              description: 'User profile photo',
              example: 'user-1.jpg',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
          },
        },
        Tour: {
          type: 'object',
          required: [
            'name',
            'duration',
            'maxGroupSize',
            'difficulty',
            'price',
            'summary',
            'imageCover',
          ],
          properties: {
            _id: {
              type: 'string',
              description: 'Tour ID',
              example: '507f1f77bcf86cd799439011',
            },
            name: {
              type: 'string',
              description: 'Tour name',
              example: 'The Forest Hiker',
            },
            duration: {
              type: 'number',
              description: 'Tour duration in days',
              example: 5,
            },
            maxGroupSize: {
              type: 'number',
              description: 'Maximum group size',
              example: 25,
            },
            difficulty: {
              type: 'string',
              enum: ['easy', 'medium', 'difficult'],
              description: 'Tour difficulty level',
              example: 'easy',
            },
            ratingsAverage: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Average rating',
              example: 4.7,
            },
            ratingsQuantity: {
              type: 'number',
              description: 'Number of ratings',
              example: 23,
            },
            price: {
              type: 'number',
              description: 'Tour price',
              example: 397,
            },
            priceDiscount: {
              type: 'number',
              description: 'Price discount',
              example: 50,
            },
            summary: {
              type: 'string',
              description: 'Tour summary',
              example: 'Breathtaking hike through the Canadian Banff National Park',
            },
            description: {
              type: 'string',
              description: 'Detailed tour description',
            },
            imageCover: {
              type: 'string',
              description: 'Cover image filename',
              example: 'tour-1-cover.jpg',
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tour images',
              example: ['tour-1-1.jpg', 'tour-1-2.jpg'],
            },
            startDates: {
              type: 'array',
              items: {
                type: 'string',
                format: 'date',
              },
              description: 'Available start dates',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly tour name',
              example: 'the-forest-hiker',
            },
            secretTour: {
              type: 'boolean',
              description: 'Whether tour is secret',
              example: false,
            },
            startLocation: {
              type: 'object',
              description: 'Tour starting location',
              properties: {
                type: {
                  type: 'string',
                  example: 'Point',
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number',
                  },
                  example: [-74.0059, 40.7128],
                },
                address: {
                  type: 'string',
                  example: 'New York, NY, USA',
                },
                description: {
                  type: 'string',
                  example: 'Central Park, New York',
                },
              },
            },
            locations: {
              type: 'array',
              description: 'Tour locations',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    example: 'Point',
                  },
                  coordinates: {
                    type: 'array',
                    items: {
                      type: 'number',
                    },
                    example: [-74.0059, 40.7128],
                  },
                  address: {
                    type: 'string',
                    example: 'New York, NY, USA',
                  },
                  description: {
                    type: 'string',
                    example: 'Day 1: Central Park',
                  },
                  day: {
                    type: 'number',
                    example: 1,
                  },
                },
              },
            },
            guides: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Guide user IDs',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Tour creation date',
            },
          },
        },
        Review: {
          type: 'object',
          required: ['review', 'rating'],
          properties: {
            _id: {
              type: 'string',
              description: 'Review ID',
              example: '507f1f77bcf86cd799439011',
            },
            review: {
              type: 'string',
              description: 'Review text',
              example: 'Amazing tour! Highly recommended.',
            },
            rating: {
              type: 'number',
              minimum: 1,
              maximum: 5,
              description: 'Rating from 1 to 5',
              example: 5,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Review creation date',
            },
            tour: {
              type: 'string',
              description: 'Tour ID',
              example: '507f1f77bcf86cd799439011',
            },
            user: {
              type: 'string',
              description: 'User ID',
              example: '507f1f77bcf86cd799439011',
            },
          },
        },
        // Error: {
        //   type: 'object',
        //   properties: {
        //     status: {
        //       type: 'string',
        //       example: 'error',
        //     },
        //     message: {
        //       type: 'string',
        //       example: 'Something went wrong!',
        //     },
        //   },
        // },
      },
    },
  },
  apis: [path.join(__dirname, '../routes/*.js'), path.join(__dirname, '../api/*.js')],
};

const specs = swaggerJsdoc(options);

export default specs;
