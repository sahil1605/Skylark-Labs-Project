import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Hono } from 'hono';
import { authRoutes } from '../routes/auth';

const app = new Hono();
app.route('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should return 400 for missing credentials', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid credentials format', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/login')
        .send({
          username: '',
          password: '',
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 for missing fields', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: '123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for short username', async () => {
      const response = await request(app.fetch)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });
});
