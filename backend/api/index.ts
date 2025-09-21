import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { PrismaClient } from '@prisma/client';
import { config } from '../src/config';
import { authRoutes } from '../src/routes/auth';
import { cameraRoutes } from '../src/routes/cameras';
import { alertRoutes } from '../src/routes/alerts';

const app = new Hono();
const prisma = new PrismaClient();

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://your-netlify-app.netlify.app'],
  credentials: true,
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/cameras', cameraRoutes);
app.route('/api/alerts', alertRoutes);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Vercel serverless handler
export default app;
