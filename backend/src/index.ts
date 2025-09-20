import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { PrismaClient } from '@prisma/client';
import { createServer } from 'http';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { cameraRoutes } from './routes/cameras';
import { alertRoutes } from './routes/alerts';
import { websocketHandler, initializeWebSocket } from './websocket';

const app = new Hono();
const prisma = new PrismaClient();

// CORS middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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

// WebSocket endpoint
app.get('/ws', websocketHandler);

// Error handling
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Create HTTP server
const server = createServer();

// Initialize WebSocket
initializeWebSocket(server);

// Start server
const port = config.port;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  server,
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma };
