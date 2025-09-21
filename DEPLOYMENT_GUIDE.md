# Deployment Guide - Face Detection Dashboard

## 🌐 Netlify Deployment (Frontend Only)

Since this is a full-stack application with multiple services, we'll deploy the frontend to Netlify and provide instructions for deploying the backend services separately.

### Frontend Deployment to Netlify

#### Option 1: Deploy from GitHub (Recommended)

1. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"
   - Connect your GitHub account
   - Select repository: `sahil1605/Skylark-Labs-Project`

2. **Configure Build Settings**:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
   - **Node version**: 18

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-api.herokuapp.com
   VITE_WS_URL=wss://your-backend-api.herokuapp.com
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

#### Option 2: Manual Deploy

1. **Build the frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `frontend/dist` folder to Netlify
   - Or use Netlify CLI: `netlify deploy --prod --dir=frontend/dist`

### Backend Services Deployment

The backend services need to be deployed separately since Netlify only hosts static sites.

#### Option 1: Railway (Recommended for Full Stack)

1. **Deploy Backend**:
   - Go to [railway.app](https://railway.app)
   - Connect GitHub repository
   - Deploy backend service
   - Set environment variables

2. **Deploy Worker**:
   - Deploy worker service separately
   - Configure environment variables

3. **Database**:
   - Use Railway's PostgreSQL service
   - Update connection strings

#### Option 2: Heroku

1. **Backend API**:
   ```bash
   # Create Heroku app
   heroku create your-backend-api
   
   # Add PostgreSQL addon
   heroku addons:create heroku-postgresql:hobby-dev
   
   # Deploy
   git subtree push --prefix backend heroku main
   ```

2. **Worker Service**:
   ```bash
   # Create separate Heroku app for worker
   heroku create your-worker-service
   
   # Deploy worker
   git subtree push --prefix worker heroku main
   ```

#### Option 3: Docker Compose (VPS)

1. **Deploy to VPS**:
   ```bash
   # Clone repository
   git clone https://github.com/sahil1605/Skylark-Labs-Project.git
   cd Skylark-Labs-Project
   
   # Start services
   docker-compose up -d
   ```

2. **Configure Domain**:
   - Point domain to VPS IP
   - Configure reverse proxy (nginx)
   - Set up SSL certificates

### Environment Configuration

#### Frontend (Netlify)
```env
VITE_API_URL=https://your-backend-api.herokuapp.com
VITE_WS_URL=wss://your-backend-api.herokuapp.com
```

#### Backend (Railway/Heroku)
```env
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your-super-secret-jwt-key
WORKER_URL=https://your-worker-service.herokuapp.com
PORT=8000
```

#### Worker (Railway/Heroku)
```env
BACKEND_URL=https://your-backend-api.herokuapp.com
PORT=8080
```

### Quick Deploy Script

Create a deployment script for easy setup:

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying Face Detection Dashboard..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Deploy to Netlify (if using CLI)
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=frontend/dist

echo "✅ Deployment complete!"
echo "Frontend: https://your-app.netlify.app"
echo "Backend: https://your-backend-api.herokuapp.com"
```

### Testing Deployment

1. **Frontend**: Visit your Netlify URL
2. **Backend**: Test API endpoints
3. **WebSocket**: Test real-time features
4. **Database**: Verify data persistence

### Troubleshooting

#### Common Issues

1. **CORS Errors**:
   - Update backend CORS settings
   - Add Netlify domain to allowed origins

2. **WebSocket Issues**:
   - Ensure WebSocket URL is correct
   - Check if backend supports WebSocket

3. **API Connection**:
   - Verify API URL in environment variables
   - Check if backend is running

4. **Build Failures**:
   - Check Node.js version (should be 18)
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Production Considerations

1. **Security**:
   - Use HTTPS for all services
   - Set strong JWT secrets
   - Configure CORS properly

2. **Performance**:
   - Enable gzip compression
   - Use CDN for static assets
   - Optimize images and assets

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Monitor API performance
   - Set up uptime monitoring

4. **Backup**:
   - Regular database backups
   - Environment variable backup
   - Code repository backup

### Cost Estimation

#### Netlify (Frontend)
- **Free Tier**: 100GB bandwidth, 300 build minutes
- **Pro**: $19/month for more bandwidth and features

#### Railway (Backend + Worker)
- **Free Tier**: $5 credit monthly
- **Pro**: Pay per usage

#### Heroku (Alternative)
- **Free Tier**: Discontinued
- **Basic**: $7/month per dyno

### Support

For deployment issues:
- Check Netlify build logs
- Verify environment variables
- Test API endpoints manually
- Check service health endpoints

---

**Note**: This deployment guide covers the most common deployment scenarios. Choose the option that best fits your needs and budget.
