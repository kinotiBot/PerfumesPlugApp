# Deploy Frontend to Railway from GitHub

This guide shows how to deploy your React frontend to Railway directly from GitHub, which provides automatic deployments and better CI/CD integration.

## 🚀 Quick GitHub to Railway Deployment

### Step 1: Push Frontend to GitHub Repository

1. **Create a new GitHub repository** (or use existing one)
2. **Push your client folder** to the repository:

```bash
# If creating a new repo for just the frontend
cd client
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/yourusername/perfumes-plug-frontend.git
git push -u origin main
```

**OR** if you want to deploy from a subfolder in your existing repo:
- Keep the client folder in your main repository
- Railway can deploy from subfolders

### Step 2: Deploy to Railway from GitHub

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Choose your repository**
5. **Configure deployment settings**:
   - **Root Directory**: `client` (if deploying from subfolder)
   - **Build Command**: `npm run build`
   - **Start Command**: Leave empty (Dockerfile will handle this)

### Step 3: Configure Environment Variables

In Railway dashboard, add these environment variables:

```env
REACT_APP_API_URL=https://perfumesplugapp-production.up.railway.app
```

### Step 4: Update Backend CORS Settings

After deployment, get your Railway frontend URL and add it to backend CORS:

```python
# In perfumes_project/settings.py
CORS_ALLOWED_ORIGINS.extend([
    "https://your-frontend-app.up.railway.app",
])
```

## 📁 Repository Structure Options

### Option A: Separate Frontend Repository
```
perfumes-plug-frontend/
├── Dockerfile
├── Caddyfile
├── railway.json
├── package.json
├── src/
├── public/
└── ...
```

### Option B: Monorepo with Subfolder Deployment
```
perfumes-plug-app/
├── client/          # Frontend (deploy this folder)
│   ├── Dockerfile
│   ├── Caddyfile
│   ├── railway.json
│   └── ...
├── backend/         # Backend
└── ...
```

## 🔧 Railway Configuration Files

Ensure these files are in your frontend directory:

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE"
  }
}
```

### `Dockerfile`
```dockerfile
# Multi-stage build for React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage with Caddy
FROM caddy:2-alpine
COPY --from=builder /app/build /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80
```

### `Caddyfile`
```
:80 {
    root * /usr/share/caddy
    try_files {path} /index.html
    file_server
    encode gzip
    
    header {
        X-Content-Type-Options nosniff
        X-Frame-Options DENY
        X-XSS-Protection "1; mode=block"
        Referrer-Policy strict-origin-when-cross-origin
    }
    
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"
    
    log {
        output stdout
        format json
    }
}
```

## 🔄 Automatic Deployments

Once connected to GitHub, Railway will automatically:
- **Deploy on every push** to the main branch
- **Show build logs** in the dashboard
- **Provide deployment URLs** for each build
- **Enable rollbacks** to previous deployments

## 🌍 Custom Domain Setup

1. **In Railway Dashboard**:
   - Go to your frontend service
   - Click "Settings" → "Domains"
   - Add your custom domain

2. **Update DNS Records**:
   ```
   Type: CNAME
   Name: @ (or www)
   Value: [railway-provided-domain]
   ```

3. **Update Backend CORS**:
   ```python
   CORS_ALLOWED_ORIGINS.extend([
       "https://yourdomain.com",
   ])
   ```

## 📊 Monitoring & Management

### View Deployments
- **Build Logs**: Railway Dashboard → Deployments
- **Runtime Logs**: Railway Dashboard → Logs
- **Metrics**: Railway Dashboard → Metrics

### Rollback Strategy
1. Go to "Deployments" in Railway dashboard
2. Select a previous successful deployment
3. Click "Redeploy"

## 🔧 Advanced Configuration

### Environment-Specific Builds

Create different branches for different environments:

```bash
# Production branch
git checkout -b production
git push origin production

# Staging branch
git checkout -b staging
git push origin staging
```

Then create separate Railway services for each branch.

### Build Optimization

Optimize your `package.json` for Railway:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "railway-build": "npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

## 🚨 Troubleshooting

### Build Failures
- **Check Node.js version** in `package.json` engines
- **Verify dependencies** are in `package.json`, not `package-lock.json` only
- **Review build logs** in Railway dashboard

### Runtime Issues
- **Check environment variables** in Railway dashboard
- **Verify Dockerfile** and Caddyfile syntax
- **Test locally** with `docker build .`

### CORS Issues
- **Ensure backend allows Railway domain**
- **Check API URLs** in frontend code
- **Verify environment variables** are set correctly

## ✅ Advantages of GitHub Integration

✅ **Automatic Deployments** - Deploy on every push  
✅ **Version Control** - Full deployment history  
✅ **Collaboration** - Team can deploy from same repo  
✅ **Rollbacks** - Easy rollback to previous versions  
✅ **Branch Deployments** - Deploy different branches to different environments  
✅ **Build Logs** - Detailed build and deployment logs  

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.com)
- [Railway GitHub Integration](https://docs.railway.com/deploy/github)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/dockerfile_best-practices/)
- [Caddy Documentation](https://caddyserver.com/docs/)

---

**Next Steps After Deployment:**
1. Get your Railway frontend URL from the dashboard
2. Add it to backend CORS settings
3. Test the full application flow
4. Configure custom domain if needed
5. Set up monitoring and alerts