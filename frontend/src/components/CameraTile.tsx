import React, { useRef, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Videocam as CameraIcon,
  VideocamOff as CameraOffIcon,
} from '@mui/icons-material';

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

interface CameraTileProps {
  camera: Camera;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CameraTile: React.FC<CameraTileProps> = ({
  camera,
  onStart,
  onStop,
  onEdit,
  onDelete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [streamError, setStreamError] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    onEdit();
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete();
    handleMenuClose();
  };

  // WebRTC setup would go here
  // For now, we'll show a placeholder
  useEffect(() => {
    if (camera.isStreaming && videoRef.current) {
      // TODO: Implement WebRTC connection
      // This would connect to the MediaMTX server or direct WebRTC
      console.log(`Starting stream for camera ${camera.id}`);
    }
  }, [camera.isStreaming, camera.id]);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ position: 'relative' }}>
        {/* Video Stream Area */}
        <Box
          sx={{
            height: 200,
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {camera.isStreaming ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {streamError && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    padding: 1,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  {streamError}
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <CameraOffIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">Camera Offline</Typography>
            </Box>
          )}
        </Box>

        {/* Camera Status Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            gap: 1,
          }}
        >
          <Chip
            icon={camera.isStreaming ? <CameraIcon /> : <CameraOffIcon />}
            label={camera.isStreaming ? 'Live' : 'Offline'}
            color={camera.isStreaming ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {camera.name}
        </Typography>
        {camera.location && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📍 {camera.location}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" noWrap>
          {camera.rtspUrl}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Box>
          <Button
            variant={camera.isStreaming ? 'outlined' : 'contained'}
            color={camera.isStreaming ? 'error' : 'primary'}
            startIcon={camera.isStreaming ? <StopIcon /> : <PlayIcon />}
            onClick={camera.isStreaming ? onStop : onStart}
            size="small"
          >
            {camera.isStreaming ? 'Stop' : 'Start'}
          </Button>
        </Box>

        <IconButton onClick={handleMenuOpen} size="small">
          <MoreIcon />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </CardActions>
    </Card>
  );
};

export default CameraTile;
