# 🚀 Quick Netlify Deployment Guide

## Frontend Deployment to Netlify

Your Face Detection Dashboard is now ready for Netlify deployment! Here's how to deploy it:

### Option 1: Deploy from GitHub (Recommended)

1. **Go to Netlify**:
   - Visit [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "New site from Git"

2. **Connect Repository**:
   - Select: `sahil1605/Skylark-Labs-Project`
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

3. **Set Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-api.herokuapp.com
   VITE_WS_URL=wss://your-backend-api.herokuapp.com
   ```

4. **Deploy**:
   - Click "Deploy site"
   - Your frontend will be live at `https://your-app-name.netlify.app`

### Option 2: Manual Deploy

```bash
# Run the deployment script
./deploy-netlify.sh
```

### Option 3: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
cd frontend
netlify deploy --prod --dir=dist
```

## 🔧 Configuration

### Environment Variables (Set in Netlify Dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-api.herokuapp.com` |
| `VITE_WS_URL` | WebSocket URL | `wss://your-api.herokuapp.com` |

### Build Settings

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Node version**: 18

## 🌐 Backend Deployment Options

Since Netlify only hosts static sites, you'll need to deploy the backend separately:

### Option 1: Railway (Recommended)
- Deploy backend API to Railway
- Deploy worker service to Railway
- Use Railway's PostgreSQL database

### Option 2: Heroku
- Deploy backend API to Heroku
- Deploy worker service to Heroku
- Use Heroku Postgres addon

### Option 3: VPS with Docker
- Deploy entire stack using Docker Compose
- Use your own server or cloud provider

## 📱 Testing Your Deployment

1. **Frontend**: Visit your Netlify URL
2. **Login**: Use `admin` / `password`
3. **API**: Test camera management features
4. **WebSocket**: Check real-time alerts

## 🚨 Important Notes

- **Backend Required**: Frontend needs a running backend API
- **WebSocket**: Requires WebSocket support for real-time features
- **CORS**: Backend must allow your Netlify domain
- **HTTPS**: Use HTTPS URLs for production

## 🔗 Quick Links

- **Repository**: https://github.com/sahil1605/Skylark-Labs-Project
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Netlify**: https://netlify.com
- **Railway**: https://railway.app (for backend)

## ✅ Deployment Checklist

- [ ] Frontend deployed to Netlify
- [ ] Backend API deployed (Railway/Heroku)
- [ ] Worker service deployed
- [ ] Database configured
- [ ] Environment variables set
- [ ] CORS configured
- [ ] WebSocket working
- [ ] Full application tested

---

**Your app will be live at**: `https://your-app-name.netlify.app` 🎉
