import request from 'supertest';
import { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from '../utils/testApp';
import { clearDatabase } from '../utils/database';

describe('Authentication API', () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    prisma = testApp.prisma;
  });

  beforeEach(async () => {
    await clearDatabase(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@sk.com',
        password: 'SecurePassword123!',
        name: 'Test User',
        department: 'IT',
        position: 'Manager'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'User registered successfully',
        user: {
          email: userData.email,
          name: userData.name,
          department: userData.department,
          position: userData.position
        }
      });

      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    it('should reject registration with invalid email domain', async () => {
      const userData = {
        email: 'test@invalid.com',
        password: 'SecurePassword123!',
        name: 'Test User',
        department: 'IT',
        position: 'Manager'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('domain');
    });

    it('should reject weak passwords', async () => {
      const userData = {
        email: 'test@sk.com',
        password: '123',
        name: 'Test User',
        department: 'IT',
        position: 'Manager'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.error).toContain('password');
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        email: 'test@sk.com',
        password: 'SecurePassword123!',
        name: 'Test User',
        department: 'IT',
        position: 'Manager'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Duplicate registration
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@sk.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          department: 'IT',
          position: 'Manager'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@sk.com',
          password: 'SecurePassword123!'
        })
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Login successful',
        user: {
          email: 'test@sk.com',
          name: 'Test User',
          department: 'IT',
          position: 'Manager'
        }
      });

      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@sk.com',
          password: 'SecurePassword123!'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@sk.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should be rate limited', async () => {
      // Attempt multiple failed logins
      const promises = Array(6).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@sk.com',
            password: 'WrongPassword'
          })
      );

      const responses = await Promise.all(promises);

      // Last request should be rate limited
      expect(responses[5].status).toBe(429);
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get token
      const loginResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@sk.com',
          password: 'SecurePassword123!',
          name: 'Test User',
          department: 'IT',
          position: 'Manager'
        });

      authToken = loginResponse.body.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: 'test@sk.com',
        name: 'Test User',
        department: 'IT',
        position: 'Manager'
      });

      expect(response.body.password).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.error).toContain('token');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.error).toContain('token');
    });
  });
});