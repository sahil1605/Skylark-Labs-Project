#!/bin/bash

# Prerequisites Check Script for Face Detection Dashboard

echo "🔍 Checking prerequisites for local development..."

# Check Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ $NODE_VERSION"
else
    echo "❌ Not installed"
    echo "   Install from: https://nodejs.org/"
fi

# Check Go
echo -n "Go: "
if command -v go &> /dev/null; then
    GO_VERSION=$(go version | cut -d' ' -f3)
    echo "✅ $GO_VERSION"
else
    echo "❌ Not installed"
    echo "   Install from: https://golang.org/dl/"
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | cut -d' ' -f3)
    echo "✅ $PSQL_VERSION"
else
    echo "❌ Not installed"
    echo "   Install from: https://www.postgresql.org/download/"
fi

# Check FFmpeg
echo -n "FFmpeg: "
if command -v ffmpeg &> /dev/null; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1 | cut -d' ' -f3)
    echo "✅ $FFMPEG_VERSION"
else
    echo "❌ Not installed"
    echo "   Install from: https://ffmpeg.org/download.html"
fi

# Check OpenCV (this is harder to check, so we'll just mention it)
echo -n "OpenCV: "
if pkg-config --exists opencv4; then
    echo "✅ Installed"
elif pkg-config --exists opencv; then
    echo "✅ Installed"
else
    echo "⚠️  May not be installed"
    echo "   Install with: brew install opencv (macOS) or apt-get install libopencv-dev (Linux)"
fi

# Check if ports are available
echo ""
echo "🔌 Checking port availability..."

check_port() {
    if lsof -i :$1 &> /dev/null; then
        echo "❌ Port $1 is in use"
        return 1
    else
        echo "✅ Port $1 is available"
        return 0
    fi
}

check_port 3000
check_port 8000
check_port 8080

echo ""
echo "📋 Summary:"
echo "   - Node.js: Required for frontend and backend"
echo "   - Go: Required for worker service"
echo "   - PostgreSQL: Required for database"
echo "   - FFmpeg: Required for video processing"
echo "   - OpenCV: Required for face detection"
echo ""
echo "🚀 Ready to start? Run: ./start-local.sh"
