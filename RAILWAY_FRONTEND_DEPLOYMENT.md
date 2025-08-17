# Railway Frontend Deployment Guide

This guide explains how to deploy the React frontend to Railway instead of Vercel.

## Prerequisites

- Railway account (https://railway.app)
- Railway CLI installed (`npm install -g @railway/cli`)
- Backend already deployed on Railway

## Deployment Steps

### 1. Login to Railway

```bash
railway login
```

### 2. Navigate to Frontend Directory

```bash
cd client
```

### 3. Initialize Railway Project

```bash
railway init
```

Select:
- Create a new project
- Choose a project name (e.g., "perfumes-plug-frontend")

### 4. Deploy to Railway

```bash
railway up
```

### 5. Set Environment Variables

In the Railway dashboard, set the following environment variables:

```
REACT_APP_API_URL=https://perfumesplugapp-production.up.railway.app
```

### 6. Configure Custom Domain (Optional)

In Railway dashboard:
1. Go to your frontend service
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed

## Files Created for Railway Deployment

### `Dockerfile`
- Multi-stage build with Node.js and Caddy
- Optimized for production serving
- Automatic gzip compression
- Security headers

### `Caddyfile`
- Caddy web server configuration
- SPA routing support (fallback to index.html)
- Static asset caching
- Security headers
- JSON logging

### `railway.json`
- Railway-specific configuration
- Dockerfile build specification
- Deployment settings

## Advantages of Railway over Vercel

✅ **Same Platform**: Both frontend and backend on Railway  
✅ **Simplified CORS**: No cross-origin issues  
✅ **Better Integration**: Easier environment management  
✅ **Cost Effective**: Single platform billing  
✅ **Performance**: Reduced latency between frontend and backend  

## Environment Configuration

The frontend is already configured to work with Railway backend:
- `.env.production` points to Railway backend URL
- CORS settings in backend allow Railway frontend domain
- Authentication flows work seamlessly

## Monitoring and Logs

View logs in Railway dashboard:
1. Go to your frontend service
2. Click "Deployments"
3. View build and runtime logs

## Rollback Strategy

If needed, you can easily rollback:
1. In Railway dashboard, go to "Deployments"
2. Select a previous successful deployment
3. Click "Redeploy"

## Custom Domain Setup

1. **Add Domain in Railway**:
   - Go to Settings → Domains
   - Add your domain (e.g., `perfumesplug.com`)

2. **Update DNS Records**:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: [railway-provided-domain]
   ```

3. **Update Environment Variables**:
   - Update backend CORS settings to include new domain
   - Update any hardcoded URLs

## Troubleshooting

### Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs in Railway dashboard

### Runtime Issues
- Verify environment variables are set
- Check Caddy configuration
- Review application logs

### CORS Issues
- Ensure backend allows Railway frontend domain
- Check CORS configuration in Django settings
- Verify API URLs in frontend

## Migration from Vercel

1. **Deploy to Railway** (following steps above)
2. **Test thoroughly** with Railway URLs
3. **Update DNS** to point to Railway
4. **Remove Vercel deployment** (optional)

## Support

For issues:
- Check Railway documentation: https://docs.railway.com
- Review deployment logs in Railway dashboard
- Test locally first with `npm run build` and serve the build folder