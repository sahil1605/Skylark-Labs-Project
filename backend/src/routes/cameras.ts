import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../index';
import { verifyToken } from './auth';

const cameraRoutes = new Hono();

// Validation schemas
const createCameraSchema = z.object({
  name: z.string().min(1),
  rtspUrl: z.string().url(),
  location: z.string().optional(),
});

const updateCameraSchema = z.object({
  name: z.string().min(1).optional(),
  rtspUrl: z.string().url().optional(),
  location: z.string().optional(),
  isEnabled: z.boolean().optional(),
});

// Apply auth middleware to all routes
cameraRoutes.use('*', verifyToken);

// Get all cameras
cameraRoutes.get('/', async (c) => {
  try {
    const cameras = await prisma.camera.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return c.json(cameras);
  } catch (error) {
    console.error('Get cameras error:', error);
    return c.json({ error: 'Failed to fetch cameras' }, 500);
  }
});

// Get camera by ID
cameraRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const camera = await prisma.camera.findUnique({
      where: { id },
    });

    if (!camera) {
      return c.json({ error: 'Camera not found' }, 404);
    }

    return c.json(camera);
  } catch (error) {
    console.error('Get camera error:', error);
    return c.json({ error: 'Failed to fetch camera' }, 500);
  }
});

// Create camera
cameraRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = createCameraSchema.parse(body);

    const camera = await prisma.camera.create({
      data: {
        name: data.name,
        rtspUrl: data.rtspUrl,
        location: data.location,
      },
    });

    return c.json(camera, 201);
  } catch (error) {
    console.error('Create camera error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create camera' }, 500);
  }
});

// Update camera
cameraRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const data = updateCameraSchema.parse(body);

    const camera = await prisma.camera.update({
      where: { id },
      data,
    });

    return c.json(camera);
  } catch (error) {
    console.error('Update camera error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to update camera' }, 500);
  }
});

// Delete camera
cameraRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await prisma.camera.delete({
      where: { id },
    });

    return c.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Delete camera error:', error);
    return c.json({ error: 'Failed to delete camera' }, 500);
  }
});

// Start camera stream
cameraRoutes.post('/:id/start', async (c) => {
  try {
    const id = c.req.param('id');
    
    const camera = await prisma.camera.update({
      where: { id },
      data: { isStreaming: true },
    });

    // Trigger worker to start processing this camera
    try {
      const workerUrl = process.env.WORKER_URL || 'http://localhost:8080';
      const response = await fetch(`${workerUrl}/cameras/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        console.error('Failed to start camera in worker');
        // Revert database change
        await prisma.camera.update({
          where: { id },
          data: { isStreaming: false },
        });
        return c.json({ error: 'Failed to start camera processing' }, 500);
      }
    } catch (error) {
      console.error('Worker communication error:', error);
      // Revert database change
      await prisma.camera.update({
        where: { id },
        data: { isStreaming: false },
      });
      return c.json({ error: 'Failed to communicate with worker' }, 500);
    }

    return c.json(camera);
  } catch (error) {
    console.error('Start camera error:', error);
    return c.json({ error: 'Failed to start camera' }, 500);
  }
});

// Stop camera stream
cameraRoutes.post('/:id/stop', async (c) => {
  try {
    const id = c.req.param('id');
    
    const camera = await prisma.camera.update({
      where: { id },
      data: { isStreaming: false },
    });

    // Trigger worker to stop processing this camera
    try {
      const workerUrl = process.env.WORKER_URL || 'http://localhost:8080';
      const response = await fetch(`${workerUrl}/cameras/${id}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        console.error('Failed to stop camera in worker');
      }
    } catch (error) {
      console.error('Worker communication error:', error);
    }

    return c.json(camera);
  } catch (error) {
    console.error('Stop camera error:', error);
    return c.json({ error: 'Failed to stop camera' }, 500);
  }
});

export { cameraRoutes };
