const request = require("supertest");
const app = require("../../app");
const User = require("../../models/userModel");

describe("Auth Controller", () => {
  beforeEach(async () => {
    // Clean up users before each test
    await User.deleteMany({});
  });

  describe("POST /api/v1/users/signup", () => {
    it("should create a new user with valid data", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        passwordConfirm: "password123",
      };

      const response = await request(app)
        .post("/api/v1/users/signup")
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    it("should not create user with invalid email", async () => {
      const userData = {
        name: "John Doe",
        email: "invalid-email",
        password: "password123",
        passwordConfirm: "password123",
      };

      const response = await request(app)
        .post("/api/v1/users/signup")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should not create user with mismatched passwords", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        passwordConfirm: "differentpassword",
      };

      const response = await request(app)
        .post("/api/v1/users/signup")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("error");
    });

    it("should not create user with weak password", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "weak",
        passwordConfirm: "weak",
      };

      const response = await request(app)
        .post("/api/v1/users/signup")
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/v1/users/login", () => {
    let testUser;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser(User);
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/users/login")
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it("should not login with invalid email", async () => {
      const loginData = {
        email: "wrong@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe("error");
    });

    it("should not login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/v1/users/login")
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe("error");
    });

    it("should require email and password", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({})
        .expect(400);

      expect(response.body.status).toBe("error");
    });
  });

  describe("POST /api/v1/users/logout", () => {
    it("should logout successfully", async () => {
      const response = await request(app).post("/api/v1/users/logout").expect(200);

      expect(response.body.status).toBe("success");
    });
  });

  describe("Protect middleware", () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      testUser = await global.testUtils.createTestUser(User);
      authToken = global.testUtils.getAuthToken(testUser);
    });

    it("should protect routes without token", async () => {
      await request(app).get("/api/v1/users/me").expect(401);
    });

    it("should allow access with valid token", async () => {
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
      expect(response.body.data.user._id).toBe(testUser._id.toString());
    });

    it("should reject invalid token", async () => {
      const response = await request(app)
        .get("/api/v1/users/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body.status).toBe("error");
    });
  });

  describe("Restrict middleware", () => {
    let adminUser;
    let regularUser;
    let adminToken;
    let userToken;

    beforeEach(async () => {
      adminUser = await global.testUtils.createTestUser(User, { role: "admin" });
      regularUser = await global.testUtils.createTestUser(User, { role: "user" });

      adminToken = global.testUtils.getAuthToken(adminUser);
      userToken = global.testUtils.getAuthToken(regularUser);
    });

    it("should allow admin to access admin routes", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.status).toBe("success");
    });

    it("should deny regular user access to admin routes", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.status).toBe("error");
    });
  });
});
