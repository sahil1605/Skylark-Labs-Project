#!/bin/bash

# Local Development Setup for Face Detection Dashboard
# This script starts all services locally without Docker

echo "🚀 Starting Face Detection Dashboard locally..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@localhost:5432/face_detection?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
BACKEND_PORT=8000
WORKER_URL="http://localhost:8080"
VITE_API_URL="http://localhost:8000"
VITE_WS_URL="ws://localhost:8000"
WORKER_PORT=8080
BACKEND_URL="http://localhost:8000"
MEDIAMTX_PORT=8888
EOF
fi

echo "📋 Prerequisites:"
echo "1. PostgreSQL database running on localhost:5432"
echo "2. Node.js 18+ installed"
echo "3. Go 1.21+ installed"
echo "4. FFmpeg and OpenCV installed"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check Go
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+"
    exit 1
fi

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start PostgreSQL (if not running)
echo "🐘 Starting PostgreSQL..."
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first:"
    echo "   brew services start postgresql  # macOS"
    echo "   sudo service postgresql start   # Linux"
    echo "   net start postgresql-x64-13     # Windows"
    exit 1
fi

# Create database if it doesn't exist
echo "📊 Setting up database..."
createdb face_detection 2>/dev/null || echo "Database already exists"

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Setting up database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install worker dependencies
echo "📦 Installing worker dependencies..."
cd worker
go mod download
cd ..

echo ""
echo "🎉 Setup complete! Starting services..."
echo ""

# Start services in background
echo "🔧 Starting Backend API (port 8000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "⚙️ Starting Worker Service (port 8080)..."
cd worker
go run main.go &
WORKER_PID=$!
cd ..

echo "📱 Starting Frontend (port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 All services started!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "⚙️ Worker: http://localhost:8080"
echo ""
echo "🔑 Test Credentials:"
echo "   Username: admin"
echo "   Password: password"
echo ""
echo "📊 To view logs:"
echo "   Backend: tail -f backend/logs/*.log"
echo "   Worker: Check terminal output"
echo "   Frontend: Check terminal output"
echo ""
echo "🛑 To stop all services:"
echo "   kill $BACKEND_PID $WORKER_PID $FRONTEND_PID"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check service health
echo "🔍 Checking service health..."

# Check Backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend API is not ready"
fi

# Check Worker
if curl -s http://localhost:8080/health > /dev/null; then
    echo "✅ Worker is ready"
else
    echo "❌ Worker is not ready"
fi

# Check Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is ready"
else
    echo "❌ Frontend is not ready"
fi

echo ""
echo "🎉 Face Detection Dashboard is running locally!"
echo "📱 Open http://localhost:3000 in your browser"
echo ""
echo "💡 Tips:"
echo "   - Check the terminal for any error messages"
echo "   - Use Ctrl+C to stop individual services"
echo "   - Restart services if needed"
echo ""
