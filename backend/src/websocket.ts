import { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { config } from './config';

interface WebSocketClient {
  ws: any;
  userId: string;
  isAlive: boolean;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();

  constructor(server: any) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: any, req: IncomingMessage) => {
      console.log('New WebSocket connection attempt');
      
      // Extract token from query params or headers
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        ws.close(1008, 'No authentication token provided');
        return;
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, config.jwtSecret) as any;
        const clientId = `${decoded.userId}_${Date.now()}`;
        
        const client: WebSocketClient = {
          ws,
          userId: decoded.userId,
          isAlive: true,
        };
        
        this.clients.set(clientId, client);
        console.log(`Client ${clientId} connected`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Connected to face detection alerts',
          clientId,
        }));

        // Handle ping/pong for connection health
        ws.on('pong', () => {
          client.isAlive = true;
        });

        // Handle client disconnect
        ws.on('close', () => {
          console.log(`Client ${clientId} disconnected`);
          this.clients.delete(clientId);
        });

        // Handle client errors
        ws.on('error', (error: Error) => {
          console.error(`WebSocket error for client ${clientId}:`, error);
          this.clients.delete(clientId);
        });

        // Handle incoming messages
        ws.on('message', (message: string) => {
          try {
            const data = JSON.parse(message);
            this.handleClientMessage(clientId, data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        });

      } catch (error) {
        console.error('WebSocket authentication error:', error);
        ws.close(1008, 'Invalid authentication token');
      }
    });

    // Ping clients every 30 seconds to check connection health
    setInterval(() => {
      this.clients.forEach((client, clientId) => {
        if (!client.isAlive) {
          console.log(`Terminating inactive client ${clientId}`);
          client.ws.terminate();
          this.clients.delete(clientId);
          return;
        }
        
        client.isAlive = false;
        client.ws.ping();
      });
    }, 30000);
  }

  private handleClientMessage(clientId: string, data: any) {
    console.log(`Message from client ${clientId}:`, data);
    
    // Handle different message types
    switch (data.type) {
      case 'ping':
        this.sendToClient(clientId, { type: 'pong' });
        break;
      case 'subscribe':
        // Client wants to subscribe to specific camera alerts
        this.sendToClient(clientId, { 
          type: 'subscribed', 
          cameraId: data.cameraId 
        });
        break;
      default:
        console.log(`Unknown message type: ${data.type}`);
    }
  }

  // Send message to specific client
  public sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === client.ws.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Broadcast message to all clients
  public broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.ws.readyState === client.ws.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  // Broadcast alert to all clients
  public broadcastAlert(alert: any) {
    this.broadcast({
      type: 'alert',
      data: alert,
    });
  }

  // Broadcast camera status update
  public broadcastCameraStatus(cameraId: string, status: any) {
    this.broadcast({
      type: 'camera_status',
      cameraId,
      data: status,
    });
  }

  // Get connected clients count
  public getClientCount(): number {
    return this.clients.size;
  }
}

let wsManager: WebSocketManager | null = null;

export const initializeWebSocket = (server: any) => {
  wsManager = new WebSocketManager(server);
  return wsManager;
};

export const getWebSocketManager = () => {
  if (!wsManager) {
    throw new Error('WebSocket manager not initialized');
  }
  return wsManager;
};

// WebSocket handler for Hono
export const websocketHandler = (c: any) => {
  // This is handled by the WebSocket server setup
  return c.text('WebSocket endpoint - use ws:// protocol');
};
