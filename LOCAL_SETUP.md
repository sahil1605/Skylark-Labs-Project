# 🏠 Local Development Setup

## Quick Start (All Services Locally)

### Prerequisites

1. **Node.js 18+**: [Download here](https://nodejs.org/)
2. **Go 1.21+**: [Download here](https://golang.org/dl/)
3. **PostgreSQL**: [Download here](https://www.postgresql.org/download/)
4. **FFmpeg**: [Download here](https://ffmpeg.org/download.html)
5. **OpenCV**: [Installation guide](https://opencv.org/install/)

### Option 1: Automated Setup

```bash
# Run the automated setup script
./start-local.sh
```

### Option 2: Manual Setup

#### Step 1: Database Setup

```bash
# Start PostgreSQL
brew services start postgresql  # macOS
# or
sudo service postgresql start   # Linux

# Create database
createdb face_detection

# Or using psql
psql -c "CREATE DATABASE face_detection;"
```

#### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Setup database schema
npx prisma db push

# Seed database
npm run db:seed

# Start backend (Terminal 1)
npm run dev
```

#### Step 3: Worker Setup

```bash
cd worker

# Install Go dependencies
go mod download

# Start worker (Terminal 2)
go run main.go
```

#### Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start frontend (Terminal 3)
npm run dev
```

### Step 5: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Worker**: http://localhost:8080

**Login Credentials**: `admin` / `password`

## 🔧 Service Details

### Backend API (Port 8000)
- **Framework**: Hono + TypeScript
- **Database**: PostgreSQL with Prisma
- **Features**: JWT auth, camera management, alerts
- **Health Check**: http://localhost:8000/health

### Worker Service (Port 8080)
- **Language**: Go
- **Features**: RTSP processing, face detection
- **Dependencies**: OpenCV, FFmpeg, go-face
- **Health Check**: http://localhost:8080/health

### Frontend (Port 3000)
- **Framework**: React + TypeScript + Vite
- **UI**: Material-UI
- **Features**: Camera dashboard, real-time alerts
- **WebSocket**: Real-time communication

## 🐛 Troubleshooting

### Common Issues

1. **PostgreSQL Connection Error**:
   ```bash
   # Check if PostgreSQL is running
   pg_isready
   
   # Start PostgreSQL
   brew services start postgresql  # macOS
   sudo service postgresql start   # Linux
   ```

2. **Port Already in Use**:
   ```bash
   # Find process using port
   lsof -i :8000
   lsof -i :3000
   lsof -i :8080
   
   # Kill process
   kill -9 <PID>
   ```

3. **OpenCV/FFmpeg Not Found**:
   ```bash
   # macOS
   brew install opencv ffmpeg
   
   # Ubuntu/Debian
   sudo apt-get install libopencv-dev ffmpeg
   
   # Windows
   # Download from official websites
   ```

4. **Go Module Issues**:
   ```bash
   cd worker
   go mod tidy
   go mod download
   ```

5. **Node.js Dependencies**:
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Database Issues

```bash
# Reset database
cd backend
npx prisma db push --force-reset
npm run db:seed

# Or recreate database
dropdb face_detection
createdb face_detection
npx prisma db push
npm run db:seed
```

### Service Health Checks

```bash
# Check backend
curl http://localhost:8000/health

# Check worker
curl http://localhost:8080/health

# Check frontend
curl http://localhost:3000
```

## 📊 Development Workflow

### 1. Start All Services
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Worker
cd worker && go run main.go

# Terminal 3: Frontend
cd frontend && npm run dev
```

### 2. Make Changes
- **Frontend**: Changes auto-reload
- **Backend**: Restart with `npm run dev`
- **Worker**: Restart with `go run main.go`

### 3. Test Features
- Login with `admin` / `password`
- Add cameras with RTSP URLs
- Test face detection
- Check real-time alerts

## 🔍 Debugging

### Backend Logs
```bash
# Check backend logs
cd backend
npm run dev
# Look for error messages in terminal
```

### Worker Logs
```bash
# Check worker logs
cd worker
go run main.go
# Look for OpenCV/FFmpeg errors
```

### Frontend Logs
```bash
# Check browser console
# Open Developer Tools (F12)
# Look for network errors or console errors
```

### Database Logs
```bash
# Check PostgreSQL logs
tail -f /usr/local/var/log/postgres.log  # macOS
tail -f /var/log/postgresql/postgresql.log  # Linux
```

## 🚀 Production vs Development

### Development
- Hot reload enabled
- Debug logging
- Local database
- CORS enabled for localhost

### Production
- Optimized builds
- Environment variables
- Production database
- CORS restricted to domain

## 📝 Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/face_detection?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Service URLs
BACKEND_URL="http://localhost:8000"
WORKER_URL="http://localhost:8080"
VITE_API_URL="http://localhost:8000"
VITE_WS_URL="ws://localhost:8000"
```

## 🎯 Next Steps

1. **Start Services**: Use the setup script or manual steps
2. **Test Application**: Login and test all features
3. **Add Cameras**: Use sample RTSP URLs for testing
4. **Monitor Logs**: Check for any errors
5. **Develop Features**: Make changes and test

---

**Ready to start?** Run `./start-local.sh` or follow the manual setup steps! 🚀
