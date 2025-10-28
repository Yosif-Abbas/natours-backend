const request = require("supertest");
const app = require("../../app");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");

describe("Tour Controller", () => {
  let testUser;
  let authToken;
  let testTour;

  beforeEach(async () => {
    // Create test user
    testUser = await global.testUtils.createTestUser(User);
    authToken = global.testUtils.getAuthToken(testUser);

    // Create test tour
    testTour = await global.testUtils.createTestTour(Tour);
  });

  describe("GET /api/v1/tours", () => {
    it("should get all tours", async () => {
      const response = await request(app).get("/api/v1/tours").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tours).toBeDefined();
      expect(Array.isArray(response.body.data.tours)).toBe(true);
    });

    it("should filter tours by difficulty", async () => {
      const response = await request(app)
        .get("/api/v1/tours?difficulty=easy")
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tours.every((tour) => tour.difficulty === "easy")).toBe(
        true,
      );
    });

    it("should sort tours by price", async () => {
      // Create tours with different prices
      await global.testUtils.createTestTour(Tour, { price: 200 });
      await global.testUtils.createTestTour(Tour, { price: 50 });

      const response = await request(app).get("/api/v1/tours?sort=price").expect(200);

      expect(response.body.status).toBe("success");
      const prices = response.body.data.tours.map((tour) => tour.price);
      expect(prices).toEqual(prices.slice().sort((a, b) => a - b));
    });

    it("should limit number of tours returned", async () => {
      // Create multiple tours
      for (let i = 0; i < 5; i++) {
        await global.testUtils.createTestTour(Tour, { name: `Tour ${i}` });
      }

      const response = await request(app).get("/api/v1/tours?limit=3").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tours.length).toBe(3);
    });
  });

  describe("GET /api/v1/tours/:id", () => {
    it("should get a specific tour", async () => {
      const response = await request(app)
        .get(`/api/v1/tours/${testTour._id}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tour._id.toString()).toBe(testTour._id.toString());
    });

    it("should return 404 for non-existent tour", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const response = await request(app).get(`/api/v1/tours/${fakeId}`).expect(404);

      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/v1/tours", () => {
    it("should create a new tour with valid data", async () => {
      const tourData = {
        name: "New Test Tour",
        duration: 7,
        maxGroupSize: 30,
        difficulty: "medium",
        price: 150,
        summary: "A new test tour",
        imageCover: "new-tour-cover.jpg",
      };

      const response = await request(app)
        .post("/api/v1/tours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(tourData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tour.name).toBe(tourData.name);
    });

    it("should require authentication", async () => {
      const tourData = {
        name: "New Test Tour",
        duration: 7,
        maxGroupSize: 30,
        difficulty: "medium",
        price: 150,
        summary: "A new test tour",
      };

      await request(app).post("/api/v1/tours").send(tourData).expect(401);
    });

    it("should validate required fields", async () => {
      const invalidTourData = {
        name: "Incomplete Tour",
        // Missing required fields
      };

      const response = await request(app)
        .post("/api/v1/tours")
        .set("Authorization", `Bearer ${authToken}`)
        .send(invalidTourData)
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });

  describe("PATCH /api/v1/tours/:id", () => {
    it("should update a tour", async () => {
      const updateData = {
        name: "Updated Tour Name",
        price: 200,
      };

      const response = await request(app)
        .patch(`/api/v1/tours/${testTour._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tour.name).toBe(updateData.name);
      expect(response.body.data.tour.price).toBe(updateData.price);
    });
  });

  describe("DELETE /api/v1/tours/:id", () => {
    it("should delete a tour", async () => {
      await request(app)
        .delete(`/api/v1/tours/${testTour._id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(204);

      // Verify tour is deleted
      const deletedTour = await Tour.findById(testTour._id);
      expect(deletedTour).toBeNull();
    });
  });

  describe("GET /api/v1/tours/top-5-cheap", () => {
    it("should get top 5 cheapest tours", async () => {
      // Create tours with different prices
      const prices = [50, 100, 150, 200, 250, 300];
      for (let i = 0; i < prices.length; i++) {
        await global.testUtils.createTestTour(Tour, {
          name: `Tour ${i}`,
          price: prices[i],
        });
      }

      const response = await request(app).get("/api/v1/tours/top-5-cheap").expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.tours.length).toBeLessThanOrEqual(5);
    });
  });
});
