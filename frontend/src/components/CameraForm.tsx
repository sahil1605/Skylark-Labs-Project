import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Box,
  FormControl,
  FormControlLabel,
  Switch,
} from '@mui/material';

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

interface CameraFormProps {
  camera?: Camera | null;
  onSubmit: (data: Partial<Camera>) => void;
  onCancel: () => void;
}

const CameraForm: React.FC<CameraFormProps> = ({ camera, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    rtspUrl: '',
    location: '',
    isEnabled: true,
  });

  useEffect(() => {
    if (camera) {
      setFormData({
        name: camera.name,
        rtspUrl: camera.rtspUrl,
        location: camera.location || '',
        isEnabled: camera.isEnabled,
      });
    }
  }, [camera]);

  const handleChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'isEnabled' ? event.target.checked : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Please enter a camera name');
      return;
    }
    
    if (!formData.rtspUrl.trim()) {
      alert('Please enter an RTSP URL');
      return;
    }

    // Validate RTSP URL format
    try {
      new URL(formData.rtspUrl);
      if (!formData.rtspUrl.startsWith('rtsp://')) {
        throw new Error('URL must start with rtsp://');
      }
    } catch (error) {
      alert('Please enter a valid RTSP URL (e.g., rtsp://username:password@ip:port/path)');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Camera Name"
        value={formData.name}
        onChange={handleChange('name')}
        margin="normal"
        required
        placeholder="e.g., Front Door Camera"
      />
      
      <TextField
        fullWidth
        label="RTSP URL"
        value={formData.rtspUrl}
        onChange={handleChange('rtspUrl')}
        margin="normal"
        required
        placeholder="e.g., rtsp://username:password@192.168.1.100:554/stream"
        helperText="Enter the RTSP stream URL for this camera"
      />
      
      <TextField
        fullWidth
        label="Location (Optional)"
        value={formData.location}
        onChange={handleChange('location')}
        margin="normal"
        placeholder="e.g., Front Door, Living Room, Office"
      />
      
      <FormControl fullWidth margin="normal">
        <FormControlLabel
          control={
            <Switch
              checked={formData.isEnabled}
              onChange={handleChange('isEnabled')}
            />
          }
          label="Enable Camera"
        />
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {camera ? 'Update Camera' : 'Add Camera'}
        </Button>
      </Box>
    </Box>
  );
};

export default CameraForm;
