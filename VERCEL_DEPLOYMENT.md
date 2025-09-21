# 🚀 Vercel Backend Deployment Guide

## Deploy Backend API to Vercel

This guide will help you deploy the Face Detection Dashboard backend to Vercel. Note that Vercel is serverless, so some features like WebSocket and long-running processes need to be handled differently.

## ⚠️ Important Limitations

- **WebSocket**: Vercel doesn't support WebSocket in serverless functions
- **Worker Service**: Cannot be deployed to Vercel (needs separate hosting)
- **Database**: Use external database (PlanetScale, Neon, or Supabase)
- **File Processing**: Limited to 10-second execution time

## 🛠️ Setup Steps

### 1. Database Setup

Since Vercel doesn't support PostgreSQL directly, use one of these:

#### Option A: PlanetScale (Recommended)
```bash
# Install PlanetScale CLI
npm install -g @planetscale/cli

# Create database
pscale database create face-detection-db

# Get connection string
pscale connect face-detection-db main
```

#### Option B: Neon (PostgreSQL)
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string

#### Option C: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get database URL from settings

### 2. Deploy to Vercel

#### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add WORKER_URL
```

#### Option 2: GitHub Integration

1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Import project from GitHub
   - Select `sahil1605/Skylark-Labs-Project`
   - Set root directory to `backend`

2. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`

3. **Set Environment Variables**:
   ```
   DATABASE_URL=your-database-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   WORKER_URL=https://your-worker-service.herokuapp.com
   NODE_ENV=production
   ```

### 3. Database Migration

After deployment, run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma db push

# Or using Prisma Studio
npx prisma studio
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `WORKER_URL` | Worker service URL | `https://worker.herokuapp.com` |
| `NODE_ENV` | Environment | `production` |

### Vercel Configuration

The `vercel.json` file configures:
- Serverless function handler
- Route mapping
- Environment variables
- Function timeout (30 seconds)

## 🚨 Limitations & Workarounds

### 1. WebSocket Support
**Problem**: Vercel doesn't support WebSocket in serverless functions.

**Workarounds**:
- Use Pusher for real-time features
- Use Server-Sent Events (SSE)
- Deploy WebSocket server separately (Railway/Heroku)

### 2. Worker Service
**Problem**: Video processing worker cannot run on Vercel.

**Solution**: Deploy worker separately:
- Railway (recommended)
- Heroku
- VPS with Docker

### 3. File Uploads
**Problem**: Limited file storage in serverless.

**Solution**: Use external storage:
- AWS S3
- Cloudinary
- Vercel Blob Storage

## 📱 Frontend Configuration

Update your frontend environment variables:

```env
VITE_API_URL=https://your-backend.vercel.app
VITE_WS_URL=wss://your-websocket-server.herokuapp.com
```

## 🧪 Testing Deployment

1. **API Endpoints**:
   ```bash
   curl https://your-backend.vercel.app/health
   curl https://your-backend.vercel.app/api/cameras
   ```

2. **Database Connection**:
   - Check Vercel function logs
   - Test database operations

3. **Authentication**:
   - Test login endpoint
   - Verify JWT token generation

## 🔄 Alternative Architecture

For full functionality, consider this architecture:

```
Frontend (Netlify) → Backend API (Vercel) → Database (PlanetScale)
                  → WebSocket Server (Railway) → Worker (Railway)
```

### Services:
- **Frontend**: Netlify
- **Backend API**: Vercel
- **WebSocket**: Railway (separate service)
- **Worker**: Railway
- **Database**: PlanetScale/Neon

## 📊 Cost Estimation

### Vercel
- **Hobby**: Free (100GB bandwidth, 100 serverless functions)
- **Pro**: $20/month (1TB bandwidth, unlimited functions)

### Database
- **PlanetScale**: Free tier available
- **Neon**: Free tier available
- **Supabase**: Free tier available

## 🚀 Quick Deploy Script

```bash
#!/bin/bash
# deploy-vercel.sh

echo "🚀 Deploying Backend to Vercel..."

cd backend

# Install dependencies
npm install

# Deploy to Vercel
vercel --prod

echo "✅ Backend deployed to Vercel!"
echo "🌐 API URL: https://your-backend.vercel.app"
echo "📊 Dashboard: https://vercel.com/dashboard"
```

## 🔍 Monitoring

- **Vercel Dashboard**: Monitor function performance
- **Function Logs**: Check for errors
- **Database**: Monitor connection and queries
- **Uptime**: Use external monitoring service

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**:
   - Check connection string format
   - Verify database is accessible
   - Check Prisma schema

2. **Build Failures**:
   - Check TypeScript errors
   - Verify all dependencies
   - Check Vercel build logs

3. **Function Timeouts**:
   - Optimize database queries
   - Use connection pooling
   - Consider caching

4. **CORS Issues**:
   - Update CORS origins
   - Check frontend URL

## 📚 Next Steps

1. **Deploy Backend**: Follow steps above
2. **Deploy Worker**: Use Railway/Heroku
3. **Deploy WebSocket**: Separate service
4. **Update Frontend**: Point to Vercel API
5. **Test**: Verify full functionality

---

**Note**: This setup provides a serverless backend API. For full real-time functionality, you'll need additional services for WebSocket and video processing.
