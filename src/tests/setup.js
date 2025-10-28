const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const dotenv = require("dotenv");

// Load test environment variables
dotenv.config({ path: "./config.env.test" });

let mongoServer;

// Setup test database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Global test utilities
global.testUtils = {
  createTestUser: async (User, userData = {}) => {
    const defaultUser = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      passwordConfirm: "password123",
      role: "user",
      ...userData,
    };

    return await User.create(defaultUser);
  },

  createTestTour: async (Tour, tourData = {}) => {
    const defaultTour = {
      name: "Test Tour",
      duration: 5,
      maxGroupSize: 25,
      difficulty: "easy",
      price: 100,
      summary: "A test tour",
      imageCover: "test-cover.jpg",
      ...tourData,
    };

    return await Tour.create(defaultTour);
  },

  getAuthToken: (user) => {
    const jwt = require("jsonwebtoken");
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  },
};
