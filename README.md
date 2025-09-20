# Real-Time Multi-Camera Face Detection Dashboard

A comprehensive microservices-based dashboard application for real-time face detection across multiple camera streams using WebRTC technology.

## 🏗️ Architecture

### Microservices
- **Frontend**: React + TypeScript + Vite + MUI (Material-UI)
- **Backend API**: TypeScript + Hono + Prisma + PostgreSQL
- **Worker**: Golang + Gin + FFmpeg + OpenCV + go-face
- **MediaMTX**: WebRTC streaming server
- **Database**: PostgreSQL

### Key Features
- 🔐 JWT Authentication with secure login
- 📹 Camera Management (Create, Read, Update, Delete)
- 🎥 Real-time WebRTC video streaming
- 👤 Face detection with bounding box overlays
- 🔔 Live alerts via WebSocket
- 📱 Responsive UI for desktop and mobile
- ⚡ Multi-camera concurrent processing (4+ streams)
- 🐳 Docker containerization

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd face-detection-dashboard
   ```

2. **Start all services**
   ```bash
   ./start.sh
   ```
   
   Or manually:
   ```bash
   docker-compose up --build -d
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Worker: http://localhost:8080
   - MediaMTX: http://localhost:8888

### Test Credentials
- **Username**: `admin`
- **Password**: `password`

## 📋 Usage Guide

### Adding Cameras
1. Login to the dashboard
2. Click the "+" button to add a new camera
3. Enter camera details:
   - **Name**: Descriptive name (e.g., "Front Door")
   - **RTSP URL**: Camera stream URL (e.g., `rtsp://username:password@192.168.1.100:554/stream`)
   - **Location**: Optional location description
4. Click "Add Camera"

### Starting Camera Streams
1. Click the "Start" button on any camera tile
2. The worker will begin processing the RTSP stream
3. Face detection will start automatically
4. Alerts will appear in real-time via WebSocket

### Viewing Alerts
- Recent alerts appear in the right sidebar
- Alerts include confidence scores and timestamps
- Face detection bounding boxes are overlaid on video streams

## 🛠️ Development

### Running Services Individually

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

#### Backend Development
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

#### Worker Development
```bash
cd worker
go mod download
go run main.go
```

### Database Management
```bash
# Generate Prisma client
cd backend
npx prisma generate

# Push schema changes
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/face_detection?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Service URLs
BACKEND_URL="http://localhost:8000"
WORKER_URL="http://localhost:8080"
VITE_API_URL="http://localhost:8000"
VITE_WS_URL="ws://localhost:8000"
```

### RTSP Camera Setup
The system supports standard RTSP cameras. Example URLs:
- `rtsp://username:password@192.168.1.100:554/stream`
- `rtsp://admin:password@192.168.1.101:554/h264Preview_01_main`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Cameras
- `GET /api/cameras` - List all cameras
- `POST /api/cameras` - Create camera
- `PUT /api/cameras/:id` - Update camera
- `DELETE /api/cameras/:id` - Delete camera
- `POST /api/cameras/:id/start` - Start camera stream
- `POST /api/cameras/:id/stop` - Stop camera stream

### Alerts
- `GET /api/alerts` - List alerts with pagination
- `GET /api/alerts/camera/:cameraId` - Get alerts for specific camera
- `POST /api/alerts` - Create alert (used by worker)

### WebSocket
- `ws://localhost:8000/ws?token=<jwt_token>` - Real-time alerts

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Worker tests
cd worker
go test ./...
```

### Test Data
The system includes sample data for testing:
- Default admin user
- Sample camera configurations
- Mock RTSP streams for development

## 🐳 Docker Services

### Service Ports
- **Frontend**: 3000
- **Backend**: 8000
- **Worker**: 8080
- **PostgreSQL**: 5432
- **MediaMTX**: 8888 (HTTP), 8889 (RTSP), 8890 (WebRTC), 8891 (HLS)

### Docker Commands
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build -d

# Clean up
docker-compose down -v
```

## 🔍 Monitoring & Debugging

### Health Checks
- Backend: `GET http://localhost:8000/health`
- Worker: `GET http://localhost:8080/health`
- MediaMTX: `GET http://localhost:8888/`

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f worker
docker-compose logs -f frontend
```

## 🚨 Known Limitations

1. **Face Detection Accuracy**: Depends on camera quality, lighting, and angle
2. **WebRTC Performance**: May vary based on network conditions and browser support
3. **RTSP Compatibility**: Some cameras may require specific codec configurations
4. **Resource Usage**: Processing multiple high-resolution streams requires significant CPU/memory
5. **Network Requirements**: RTSP streams require stable network connectivity

## 🔮 Future Improvements

- [ ] Face recognition (not just detection)
- [ ] Motion detection capabilities
- [ ] Cloud storage integration for snapshots
- [ ] Mobile app development
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] Horizontal scaling for worker services
- [ ] GPU acceleration for face detection

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact: rocio.novo@skylarklabs.ai

---

**Note**: This is a technical demonstration project. For production use, additional security measures, error handling, and performance optimizations should be implemented.
