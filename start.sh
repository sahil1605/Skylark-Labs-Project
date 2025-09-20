#!/bin/bash

# Face Detection Dashboard Startup Script

echo "🚀 Starting Face Detection Dashboard..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
DATABASE_URL="postgresql://postgres:password@postgres:5432/face_detection?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
BACKEND_PORT=8000
WORKER_URL="http://worker:8080"
VITE_API_URL="http://localhost:8000"
VITE_WS_URL="ws://localhost:8000"
WORKER_PORT=8080
BACKEND_URL="http://backend:8000"
MEDIAMTX_PORT=8888
EOF
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "❌ PostgreSQL is not ready"
fi

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

# Check MediaMTX
if curl -s http://localhost:8888 > /dev/null; then
    echo "✅ MediaMTX is ready"
else
    echo "❌ MediaMTX is not ready"
fi

echo ""
echo "🎉 Face Detection Dashboard is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "⚙️  Worker: http://localhost:8080"
echo "📺 MediaMTX: http://localhost:8888"
echo ""
echo "🔑 Test Credentials:"
echo "   Username: admin"
echo "   Password: password"
echo ""
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"
echo ""
