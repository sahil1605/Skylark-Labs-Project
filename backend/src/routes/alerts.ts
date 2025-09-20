import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../index';
import { verifyToken } from './auth';
import { getWebSocketManager } from '../websocket';

const alertRoutes = new Hono();

// Validation schemas
const createAlertSchema = z.object({
  cameraId: z.string(),
  confidence: z.number().min(0).max(1),
  boundingBox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  imageUrl: z.string().url().optional(),
});

const getAlertsSchema = z.object({
  cameraId: z.string().optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

// Apply auth middleware to all routes
alertRoutes.use('*', verifyToken);

// Get alerts with pagination
alertRoutes.get('/', async (c) => {
  try {
    const query = c.req.query();
    const { cameraId, page, limit } = getAlertsSchema.parse(query);
    
    const skip = (page - 1) * limit;
    
    const where = cameraId ? { cameraId } : {};
    
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        include: {
          camera: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where }),
    ]);

    return c.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    return c.json({ error: 'Failed to fetch alerts' }, 500);
  }
});

// Get alerts for specific camera
alertRoutes.get('/camera/:cameraId', async (c) => {
  try {
    const cameraId = c.req.param('cameraId');
    const query = c.req.query();
    const { page, limit } = getAlertsSchema.parse(query);
    
    const skip = (page - 1) * limit;
    
    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where: { cameraId },
        include: {
          camera: {
            select: {
              id: true,
              name: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.alert.count({ where: { cameraId } }),
    ]);

    return c.json({
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get camera alerts error:', error);
    return c.json({ error: 'Failed to fetch camera alerts' }, 500);
  }
});

// Create alert (used by worker)
alertRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const data = createAlertSchema.parse(body);

    const alert = await prisma.alert.create({
      data: {
        cameraId: data.cameraId,
        confidence: data.confidence,
        boundingBox: data.boundingBox,
        imageUrl: data.imageUrl,
      },
      include: {
        camera: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    // Broadcast alert to WebSocket clients
    try {
      const wsManager = getWebSocketManager();
      wsManager.broadcastAlert(alert);
    } catch (error) {
      console.error('Failed to broadcast alert:', error);
    }

    return c.json(alert, 201);
  } catch (error) {
    console.error('Create alert error:', error);
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation error', details: error.errors }, 400);
    }
    return c.json({ error: 'Failed to create alert' }, 500);
  }
});

// Delete alert
alertRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    await prisma.alert.delete({
      where: { id },
    });

    return c.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Delete alert error:', error);
    return c.json({ error: 'Failed to delete alert' }, 500);
  }
});

export { alertRoutes };