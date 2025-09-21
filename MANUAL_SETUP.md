# 🛠️ Manual Local Setup Guide

## Step-by-Step Setup (No Docker Required)

### Step 1: Check Prerequisites

```bash
# Run the prerequisites check
./check-prerequisites.sh
```

### Step 2: Install Missing Dependencies

#### macOS (using Homebrew)
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node postgresql go ffmpeg opencv
```

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install dependencies
sudo apt install nodejs npm postgresql postgresql-contrib golang-go ffmpeg libopencv-dev
```

#### Windows
- Download and install from official websites:
  - [Node.js](https://nodejs.org/)
  - [PostgreSQL](https://www.postgresql.org/download/)
  - [Go](https://golang.org/dl/)
  - [FFmpeg](https://ffmpeg.org/download.html)
  - [OpenCV](https://opencv.org/install/)

### Step 3: Start PostgreSQL

```bash
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Start PostgreSQL service from Services or use pgAdmin
```

### Step 4: Create Database

```bash
# Create database
createdb face_detection

# Or using psql
psql -c "CREATE DATABASE face_detection;"
```

### Step 5: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Setup database schema
npx prisma db push

# Seed database with sample data
npm run db:seed

# Start backend (keep this terminal open)
npm run dev
```

### Step 6: Setup Worker (New Terminal)

```bash
cd worker

# Install Go dependencies
go mod download

# Start worker (keep this terminal open)
go run main.go
```

### Step 7: Setup Frontend (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Start frontend (keep this terminal open)
npm run dev
```

### Step 8: Access the Application

Open your browser and go to: **http://localhost:3000**

**Login with:**
- Username: `admin`
- Password: `password`

## 🎯 What You Should See

1. **Login Page**: Clean Material-UI login form
2. **Dashboard**: Camera management interface
3. **Add Camera**: Form to add new cameras
4. **Real-time Alerts**: WebSocket-powered alerts
5. **Camera Tiles**: Live video streams (when cameras are added)

## 🔧 Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check backend logs
cd backend
npm run dev
```

### Worker Issues
```bash
# Check if worker is running
curl http://localhost:8080/health

# Check worker logs
cd worker
go run main.go
```

### Frontend Issues
```bash
# Check if frontend is running
curl http://localhost:3000

# Check browser console for errors
# Open Developer Tools (F12)
```

### Database Issues
```bash
# Check PostgreSQL status
pg_isready

# Reset database
cd backend
npx prisma db push --force-reset
npm run db:seed
```

## 📊 Service Status

| Service | URL | Status Check |
|---------|-----|--------------|
| Frontend | http://localhost:3000 | Open in browser |
| Backend | http://localhost:8000 | `curl http://localhost:8000/health` |
| Worker | http://localhost:8080 | `curl http://localhost:8080/health` |

## 🚀 Quick Commands

```bash
# Start all services (if you have the script)
./start-local.sh

# Check prerequisites
./check-prerequisites.sh

# Reset everything
cd backend && npx prisma db push --force-reset && npm run db:seed
```

## 💡 Tips

1. **Keep terminals open**: Each service needs its own terminal
2. **Check logs**: Look for error messages in terminal output
3. **Test step by step**: Start with backend, then worker, then frontend
4. **Use sample data**: The database is seeded with sample cameras
5. **Check ports**: Make sure ports 3000, 8000, 8080 are available

---

**Ready to start?** Follow the steps above and you'll have the complete Face Detection Dashboard running locally! 🎉
