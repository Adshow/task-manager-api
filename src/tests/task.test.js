const request = require("supertest");
const { expect } = require("@jest/globals");
const app = require("../index");
const User = require("../models/User");
const Task = require("../models/Task");
const sequelizeTest = require("../config/databaseTest");

// Create a test user
const testUserTechnician = {
  email: "test@example.com",
  password: "testpassword",
};

// Create a test task
const testTask = {
  summary: "Test task summary",
  datePerformed: new Date(),
};

let authToken; // Store the authentication token for the technician user
let managerAuthToken; // Store the authentication token for the manager user
let taskId; // Store the ID of the task created in the "Delete a Task" section

beforeAll(async () => {
  // Connect to the database
  await sequelizeTest.sync({ force: true }); // Use { force: true } to drop existing tables

  await Task.destroy({
    where: {},
    truncate: true,
  });

  await User.destroy({
    where: {},
    truncate: { cascade: true },
  });
  // Create a test manager user
  await User.create({
    name: "UserManager",
    email: "manager@example.com",
    password: "managerpassword",
    role: "manager",
  });

  // Create a test technician user
  await User.create({
    name: "UserTechnician",
    email: testUserTechnician.email,
    password: testUserTechnician.password,
    role: "technician",
  });
});

afterAll(async () => {
  await app.close();

  // Disconnect from the database
  await sequelizeTest.close();
});

describe("Task Management", () => {
  // Login as a technician before running the tests
  beforeAll(async () => {
    const response = await request(app).post("/login").send(testUserTechnician);
    authToken = response.body.token;

    const loginResponse = await request(app)
      .post("/login")
      .send({ email: "manager@example.com", password: "managerpassword" });
    managerAuthToken = loginResponse.body.token;
  });

  describe("Create a Task", () => {
    it("should create a new task for the logged-in technician", async () => {
      const response = await request(app)
        .post("/tasks")
        .set("Authorization", authToken)
        .send(testTask);

      expect(response.status).toBe(201);
      expect(response.body.summary).toBe(testTask.summary);
      expect(response.body.datePerformed).toBe(
        testTask.datePerformed.toISOString()
      );
      expect(response.body.userId).toBeDefined();
    });

    it("should create a new task for the logged-in manager", async () => {
      const response = await request(app)
        .post("/tasks")
        .set("Authorization", managerAuthToken)
        .send(testTask);

      expect(response.status).toBe(201);
      expect(response.body.summary).toBe(testTask.summary);
      expect(response.body.datePerformed).toBe(
        testTask.datePerformed.toISOString()
      );
      expect(response.body.userId).toBeDefined();
    });

    it("should return an error if no authentication token is provided", async () => {
      const response = await request(app).post("/tasks").send(testTask);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token not found");
    });
  });

  describe("Get All Tasks", () => {
    it("should get all tasks for the manager", async () => {
      const response = await request(app)
        .get("/tasks")
        .set("Authorization", managerAuthToken);
      expect(response.status).toBe(200);
    });

    it("should get tasks for the logged-in technician", async () => {
      const response = await request(app)
        .get("/tasks")
        .set("Authorization", authToken);

      expect(response.status).toBe(200);
    });

    it("should return an error if no authentication token is provided", async () => {
      const response = await request(app).get("/tasks");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token not found");
    });
  });

  describe("Update a Task", () => {
    let technicianTaskId; // To store the ID of the created task
    beforeEach(async () => {
      // Create a technician task before each delete test
      const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", authToken)
        .send(testTask);
      technicianTaskId = taskResponse.body.id;

      const managerTaskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", managerAuthToken)
        .send(testTask);
      managerTaskId = managerTaskResponse.body.id;
    });

    it("should update a task for the logged-in technician", async () => {
      const response = await request(app)
        .put(`/tasks/${technicianTaskId}`)
        .set("Authorization", authToken)
        .send({ summary: "Updated task summary" });
      expect(response.status).toBe(200);
      expect(response.body.task.summary).toBe("Updated task summary");
    });

    it("should update a task for the logged-in manager", async () => {
      const response = await request(app)
        .put(`/tasks/${technicianTaskId}`)
        .set("Authorization", managerAuthToken)
        .send({ summary: "Updated task summary" });
      expect(response.status).toBe(200);
      expect(response.body.task.summary).toBe("Updated task summary");
    });

    it("should return an error when updating a task that does not belong to the logged-in technician", async () => {
      // Create a new technician user
      const anotherTechnician = {
        name: "AnotherTechnician",
        email: "another@example.com",
        password: "anotherpassword",
        role: "technician",
      };

      await User.create(anotherTechnician);

      // Login as the new technician
      const anotherTechnicianLoginResponse = await request(app)
        .post("/login")
        .send(anotherTechnician);

      const anotherTechnicianAuthToken =
        anotherTechnicianLoginResponse.body.token;

      // Try to update the task created by the first technician
      const response = await request(app)
        .put(`/tasks/${technicianTaskId}`)
        .set("Authorization", anotherTechnicianAuthToken)
        .send({ summary: "Attempted update" });
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "User doesn't have access to the task"
      );
    });

    it("should return an error if no authentication token is provided", async () => {
      const response = await request(app).put(`/tasks/${technicianTaskId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token not found");
    });
  });

  describe("Delete a Task", () => {
    beforeEach(async () => {
      // Create a task before each delete test
      const taskResponse = await request(app)
        .post("/tasks")
        .set("Authorization", managerAuthToken)
        .send(testTask);
      taskId = taskResponse.body.id;
    });

    it("should delete a task for the manager", async () => {
      const loginResponse = await request(app)
        .post("/login")
        .send({ email: "manager@example.com", password: "managerpassword" });

      const managerAuthToken = loginResponse.body.token;

      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", managerAuthToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Task deleted successfully.");
    });

    it("should return an error when deleting a task that does not belong to the logged-in technician", async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set("Authorization", authToken);
      expect(response.status).toBe(403);
      expect(response.body.message).toBe(
        "User doesn't have access to the task"
      );
    });

    it("should return an error if no authentication token is provided", async () => {
      const response = await request(app).delete(`/tasks/${taskId}`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Authorization token not found");
    });
  });
});
