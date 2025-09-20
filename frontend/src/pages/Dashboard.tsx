import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Videocam as CameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useWebSocket } from '../contexts/WebSocketContext';
import CameraTile from '../components/CameraTile';
import CameraForm from '../components/CameraForm';

interface Camera {
  id: string;
  name: string;
  rtspUrl: string;
  location?: string;
  isEnabled: boolean;
  isStreaming: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Alert {
  id: string;
  cameraId: string;
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  imageUrl?: string;
  createdAt: string;
  camera: {
    id: string;
    name: string;
    location?: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { isConnected } = useWebSocket();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Camera | null>(null);

  useEffect(() => {
    fetchCameras();
    fetchAlerts();
  }, []);

  const fetchCameras = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cameras', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cameras');
      }

      const data = await response.json();
      setCameras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cameras');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/alerts?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const data = await response.json();
      setAlerts(data.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const handleCreateCamera = async (cameraData: Partial<Camera>) => {
    try {
      const response = await fetch('http://localhost:8000/api/cameras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cameraData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create camera');
      }

      const newCamera = await response.json();
      setCameras([newCamera, ...cameras]);
      setOpenDialog(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create camera');
    }
  };

  const handleUpdateCamera = async (id: string, cameraData: Partial<Camera>) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cameras/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cameraData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update camera');
      }

      const updatedCamera = await response.json();
      setCameras(cameras.map(cam => cam.id === id ? updatedCamera : cam));
      setOpenDialog(false);
      setEditingCamera(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update camera');
    }
  };

  const handleDeleteCamera = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cameras/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete camera');
      }

      setCameras(cameras.filter(cam => cam.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete camera');
    }
  };

  const handleStartCamera = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cameras/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start camera');
      }

      const updatedCamera = await response.json();
      setCameras(cameras.map(cam => cam.id === id ? updatedCamera : cam));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start camera');
    }
  };

  const handleStopCamera = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/cameras/${id}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to stop camera');
      }

      const updatedCamera = await response.json();
      setCameras(cameras.map(cam => cam.id === id ? updatedCamera : cam));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop camera');
    }
  };

  const handleEditCamera = (camera: Camera) => {
    setEditingCamera(camera);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCamera(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Camera Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={isConnected ? 'Connected' : 'Disconnected'}
            color={isConnected ? 'success' : 'error'}
            size="small"
          />
          <Typography variant="body2" color="text.secondary">
            Welcome, {user?.username}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Cameras Grid */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Cameras ({cameras.length})
          </Typography>
          <Grid container spacing={2}>
            {cameras.map((camera) => (
              <Grid item xs={12} sm={6} md={4} key={camera.id}>
                <CameraTile
                  camera={camera}
                  onStart={() => handleStartCamera(camera.id)}
                  onStop={() => handleStopCamera(camera.id)}
                  onEdit={() => handleEditCamera(camera)}
                  onDelete={() => handleDeleteCamera(camera.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>
            Recent Alerts
          </Typography>
          <Card>
            <CardContent>
              <List>
                {alerts.slice(0, 5).map((alert) => (
                  <ListItem key={alert.id} divider>
                    <ListItemText
                      primary={`${alert.camera.name} - ${(alert.confidence * 100).toFixed(1)}% confidence`}
                      secondary={new Date(alert.createdAt).toLocaleString()}
                    />
                  </ListItem>
                ))}
                {alerts.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No recent alerts" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Camera FAB */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenDialog(true)}
      >
        <AddIcon />
      </Fab>

      {/* Camera Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCamera ? 'Edit Camera' : 'Add New Camera'}
        </DialogTitle>
        <DialogContent>
          <CameraForm
            camera={editingCamera}
            onSubmit={editingCamera ? 
              (data) => handleUpdateCamera(editingCamera.id, data) :
              handleCreateCamera
            }
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
