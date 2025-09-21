#!/bin/bash

# Netlify Deployment Script for Face Detection Dashboard

echo "🚀 Deploying Face Detection Dashboard to Netlify..."

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found"
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build the project
echo "🔨 Building frontend for production..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Frontend built successfully!"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📥 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
echo "📝 Note: You'll need to configure environment variables in Netlify dashboard:"
echo "   VITE_API_URL=https://your-backend-api.herokuapp.com"
echo "   VITE_WS_URL=wss://your-backend-api.herokuapp.com"
echo ""

# Deploy
netlify deploy --prod --dir=dist

echo ""
echo "🎉 Deployment complete!"
echo "📱 Your app should be live at the URL shown above"
echo ""
echo "⚠️  Remember to:"
echo "   1. Deploy your backend API separately (Railway/Heroku)"
echo "   2. Update environment variables in Netlify dashboard"
echo "   3. Test the full application functionality"
echo ""
echo "📚 See DEPLOYMENT_GUIDE.md for detailed instructions"
