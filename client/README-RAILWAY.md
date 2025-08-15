# Perfumes Plug Frontend - Railway Deployment

This directory contains the React frontend for the Perfumes Plug application, configured for deployment on Railway.

## 🚀 Quick Deploy to Railway

### Option 1: Using Deployment Script (Recommended)

**Windows (PowerShell):**
```powershell
.\deploy-railway.ps1
```

**Linux/Mac (Bash):**
```bash
./deploy-railway.sh
```

### Option 2: Manual Deployment

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Railway Project:**
   ```bash
   railway init
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

## 📁 Railway Configuration Files

### `Dockerfile`
- **Multi-stage build** with Node.js 18 and Caddy
- **Production optimized** with static file serving
- **Automatic compression** and security headers
- **SPA routing support** for React Router

### `Caddyfile`
- **Web server configuration** for Caddy
- **Static asset caching** with proper headers
- **Security headers** (HSTS, CSP, etc.)
- **JSON logging** for better debugging

### `railway.json`
- **Build configuration** specifying Dockerfile usage
- **Railway-specific settings** for deployment

## 🔧 Environment Configuration

### Production Environment (`.env.production`)
```env
REACT_APP_API_URL=https://perfumesplugapp-production.up.railway.app
```

### Local Development (`.env.local`)
```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

## 🌐 CORS Configuration

The backend is already configured to accept requests from Railway domains. After deployment:

1. **Get your Railway frontend URL** from the dashboard
2. **Add it to backend CORS settings** in `settings.py`:
   ```python
   CORS_ALLOWED_ORIGINS.extend([
       "https://your-frontend-app.up.railway.app",
   ])
   ```

## 🔍 Monitoring & Debugging

### View Deployment Logs
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your frontend project
3. Click "Deployments" tab
4. View build and runtime logs

### Common Issues

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Review build logs in Railway dashboard

**Runtime Issues:**
- Verify environment variables are set
- Check Caddy configuration
- Test API connectivity

**CORS Errors:**
- Ensure backend allows Railway frontend domain
- Check network tab in browser dev tools
- Verify API URLs in frontend code

## 📊 Performance Features

✅ **Static Asset Caching** - 1 year cache for JS/CSS  
✅ **Gzip Compression** - Automatic compression  
✅ **Security Headers** - HSTS, CSP, X-Frame-Options  
✅ **SPA Routing** - Proper fallback to index.html  
✅ **Fast Builds** - Multi-stage Docker optimization  

## 🔄 Deployment Workflow

1. **Local Development:**
   ```bash
   npm start  # Runs on http://localhost:3000
   ```

2. **Test Build:**
   ```bash
   npm run build
   npx serve -s build  # Test production build locally
   ```

3. **Deploy to Railway:**
   ```bash
   railway up
   ```

4. **Verify Deployment:**
   - Check Railway dashboard for deployment URL
   - Test all functionality
   - Monitor logs for errors

## 🌍 Custom Domain Setup

1. **In Railway Dashboard:**
   - Go to Settings → Domains
   - Add your custom domain

2. **Update DNS:**
   ```
   Type: CNAME
   Name: @ (or www)
   Value: [railway-provided-domain]
   ```

3. **Update Backend CORS:**
   - Add custom domain to CORS_ALLOWED_ORIGINS
   - Redeploy backend if needed

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Test production build
npx serve -s build
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.com)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Docker Multi-stage Builds](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/#use-multi-stage-builds)

## 🆘 Support

For deployment issues:
1. Check Railway dashboard logs
2. Review this documentation
3. Test locally first
4. Check backend connectivity

---

**Note:** This frontend is designed to work seamlessly with the Railway-deployed backend. Both services can be hosted on the same Railway account for optimal performance and simplified management.