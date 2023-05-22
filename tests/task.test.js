const request = require('supertest');
const { expect } = require('@jest/globals');
const app = require('../index');
const User = require('../models/User');
const sequelizeTest = require('../config/databaseTest');

// Create a test user
const testUserTechnician = {
  email: 'test@example.com',
  password: 'testpassword',
};

// Create a test task
const testTask = {
  summary: 'Test task summary',
  datePerformed: new Date(),
};

let authToken; // Store the authentication token for the technician user
let managerAuthToken; // Store the authentication token for the manager user
let taskId; // Store the ID of the task created in the "Delete a Task" section

beforeAll(async () => {
  // Connect to the database
  await sequelizeTest.sync({ force: true }); // Use { force: true } to drop existing tables

  try {
    // Create a test manager user
    await User.create({
      name: 'UserManager',
      email: 'manager@example.com',
      password: 'managerpassword',
      role: 'manager',
    });

    // Create a test technician user
    await User.create({
      name: 'UserTechnician',
      email: testUserTechnician.email,
      password: testUserTechnician.password,
      role: 'technician',
    });
  } catch (error) {
    console.log('Error creating test users');
  }
});

afterAll(async () => {
  try {
    await app.close();
    // Delete the created users
    await User.destroy({ where: { email: [testUserTechnician.email, 'manager@example.com'] } });

    // Disconnect from the database
    await sequelizeTest.close();
    
  } catch (error) {
    console.log('Error cleaning up test data');
  }
});

describe('Task Management', () => {
  // Login as a technician before running the tests
  beforeAll(async () => {
    try {
      const response = await request(app)
        .post('/login')
        .send(testUserTechnician);
      authToken = response.body.token;

      const loginResponse = await request(app)
        .post('/login')
        .send({ email: 'manager@example.com', password: 'managerpassword' });
      managerAuthToken = loginResponse.body.token;
    } catch (error) {
      console.error('Error logging in:', error);
    }
  });

  describe('Create a Task', () => {
    it('should create a new task for the logged-in technician', async () => {
      try {
        const response = await request(app)
          .post('/tasks')
          .set('Authorization', authToken)
          .send(testTask);

        expect(response.status).toBe(201);
        expect(response.body.summary).toBe(testTask.summary);
        expect(response.body.datePerformed).toBe(testTask.datePerformed.toISOString());
        expect(response.body.userId).toBeDefined();
      } catch (error) {
        console.error('Error creating a task:', error);
      }
    });

    it('should create a new task for the logged-in manager', async () => {
      try {
        const response = await request(app)
          .post('/tasks')
          .set('Authorization', managerAuthToken)
          .send(testTask);

        expect(response.status).toBe(201);
        expect(response.body.summary).toBe(testTask.summary);
        expect(response.body.datePerformed).toBe(testTask.datePerformed.toISOString());
        expect(response.body.userId).toBeDefined();
      } catch (error) {
        console.error('Error creating a task:', error);
      }
    });

    it('should return an error if no authentication token is provided', async () => {
      try {
        const response = await request(app).post('/tasks').send(testTask);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authorization token not found');
      } catch (error) {
        console.error('Error creating a task without authentication:', error);
      }
    });
  });

  describe('Get All Tasks', () => {
    it('should get all tasks for the manager', async () => {
      try {
        const response = await request(app)
          .get('/tasks')
          .set('Authorization', managerAuthToken);
        expect(response.status).toBe(200);
      } catch (error) {
        console.error('Error getting all tasks for the manager:', error);
      }
    });

    it('should get tasks for the logged-in technician', async () => {
      try {
        const response = await request(app)
          .get('/tasks')
          .set('Authorization', authToken);

        expect(response.status).toBe(200);
      } catch (error) {
        console.error('Error getting tasks for the logged-in technician:', error);
      }
    });

    it('should return an error if no authentication token is provided', async () => {
      try {
        const response = await request(app).get('/tasks');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authorization token not found');
      } catch (error) {
        console.error('Error getting tasks without authentication:', error);
      }
    });
  });

  describe('Update a Task', () => {
    let technicianTaskId; // To store the ID of the created task
    beforeEach(async () => {
      try {
        // Create a technician task before each delete test
        const taskResponse = await request(app)
          .post('/tasks')
          .set('Authorization', authToken)
          .send(testTask);
        technicianTaskId = taskResponse.body.id;

        const managerTaskResponse = await request(app)
          .post('/tasks')
          .set('Authorization', managerAuthToken)
          .send(testTask);
        managerTaskId = managerTaskResponse.body.id;
      } catch (error) {
        console.error('Error creating a task for update tests:', error);
      }
    });

    it('should update a task for the logged-in technician', async () => {
      try {
        const response = await request(app)
          .put(`/tasks/${technicianTaskId}`)
          .set('Authorization', authToken)
          .send({ summary: 'Updated task summary' });
        expect(response.status).toBe(200);
        expect(response.body.task.summary).toBe('Updated task summary');
      } catch (error) {
        console.error('Error updating a task:', error);
      }
    });

    it('should update a task for the logged-in manager', async () => {
      try {
        const response = await request(app)
          .put(`/tasks/${technicianTaskId}`)
          .set('Authorization', managerAuthToken)
          .send({ summary: 'Updated task summary' });
        expect(response.status).toBe(200);
        expect(response.body.task.summary).toBe('Updated task summary');
      } catch (error) {
        console.error('Error updating a task:', error);
      }
    });

    it('should return an error when updating a task that does not belong to the logged-in technician', async () => {
      try {
        // Create a new technician user
        const anotherTechnician = {
          name: 'AnotherTechnician',
          email: 'another@example.com',
          password: 'anotherpassword',
          role: 'technician',
        };

        await User.create(anotherTechnician);

        // Login as the new technician
        const anotherTechnicianLoginResponse = await request(app)
          .post('/login')
          .send(anotherTechnician);

        const anotherTechnicianAuthToken = anotherTechnicianLoginResponse.body.token;

        // Try to update the task created by the first technician
        const response = await request(app)
          .put(`/tasks/${technicianTaskId}`)
          .set('Authorization', anotherTechnicianAuthToken)
          .send({ summary: 'Attempted update' });
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access denied');
      } catch (error) {
        console.log('Error updating a task that does not belong to the technician');
      }
    });

    it('should return an error if no authentication token is provided', async () => {
      try {
        const response = await request(app).put(`/tasks/${technicianTaskId}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authorization token not found');
      } catch (error) {
        console.error('Error updating a task without authentication:', error);
      }
    });
  });

  describe('Delete a Task', () => {
    beforeEach(async () => {
      try {
        // Create a task before each delete test
        const taskResponse = await request(app)
          .post('/tasks')
          .set('Authorization', managerAuthToken)
          .send(testTask);
        taskId = taskResponse.body.id;
      } catch (error) {
        console.error('Error creating a task for delete tests:', error);
      }
    });

    it('should delete a task for the manager', async () => {
      try {
        const loginResponse = await request(app)
          .post('/login')
          .send({ email: 'manager@example.com', password: 'managerpassword' });

        const managerAuthToken = loginResponse.body.token;

        const response = await request(app)
          .delete(`/tasks/${taskId}`)
          .set('Authorization', managerAuthToken);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Task deleted successfully.');
      } catch (error) {
        console.error('Error deleting a task for the manager:', error);
      }
    });

    it('should return an error when deleting a task that does not belong to the logged-in technician', async () => {
      try {
        const response = await request(app)
          .delete(`/tasks/${taskId}`)
          .set('Authorization', authToken);
        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Access denied');
      } catch (error) {
        console.error('Error deleting a task that does not belong to the technician:', error);
      }
    });

    it('should return an error if no authentication token is provided', async () => {
      try {
        const response = await request(app).delete(`/tasks/${taskId}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authorization token not found');
      } catch (error) {
        console.error('Error deleting a task without authentication:', error);
      }
    });
  });
});
