# Deployment Guide for PerfumesPlugApp

## Vercel Deployment (Frontend)

### Prerequisites
- Vercel account (free tier available)
- GitHub repository with your code
- Backend deployed separately (Railway, Heroku, etc.)

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Make sure the `client/vercel.json` configuration is in place
3. Create a `.env` file in the client directory based on `.env.example`

### Step 2: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Build Settings:**
   - **Framework Preset:** Create React App
   - **Root Directory:** `client`
   - **Build Command:** `npm run vercel-build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

3. **Set Environment Variables:**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.com`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Step 3: Backend Deployment Options

#### Option A: Railway (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### Option B: Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=your-app-name.herokuapp.com

# Deploy
git push heroku main
```

### Step 4: Configure CORS

Update your Django `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://your-vercel-app.vercel.app",
    "http://localhost:3000",  # for development
]

ALLOWED_HOSTS = [
    'your-backend-domain.com',
    'localhost',
    '127.0.0.1',
]
```

### Step 5: Custom Domain (Optional)

1. In Vercel dashboard, go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed

## Environment Variables Reference

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend
```
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.com
CORS_ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
DATABASE_URL=your-database-url
SECRET_KEY=your-secret-key
```

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure backend CORS settings include your Vercel domain
   - Check that API_URL environment variable is set correctly

2. **Build Failures:**
   - Check that all dependencies are in package.json
   - Ensure build command is set to `npm run vercel-build`

3. **404 on Refresh:**
   - Vercel.json routing configuration handles this automatically
   - Ensure vercel.json is in the client directory

4. **API Connection Issues:**
   - Verify REACT_APP_API_URL is set in Vercel environment variables
   - Check that backend is accessible from the internet

### Logs and Debugging

- **Vercel Logs:** Available in Vercel dashboard under Functions tab
- **Build Logs:** Available during deployment in Vercel dashboard
- **Runtime Logs:** Check browser console for frontend errors

## Performance Optimization

1. **Enable Vercel Analytics:**
   - Add `@vercel/analytics` to your React app
   - Monitor performance metrics

2. **Image Optimization:**
   - Use Vercel's Image Optimization API
   - Implement lazy loading for product images

3. **Caching:**
   - Vercel automatically handles static asset caching
   - Configure API response caching on backend

## Security Considerations

1. **Environment Variables:**
   - Never commit .env files to repository
   - Use Vercel's environment variable management

2. **HTTPS:**
   - Vercel provides HTTPS by default
   - Ensure backend also uses HTTPS

3. **API Security:**
   - Implement proper authentication
   - Use CORS restrictions
   - Rate limiting on backend

## Monitoring

1. **Vercel Analytics:** Built-in performance monitoring
2. **Error Tracking:** Consider integrating Sentry
3. **Uptime Monitoring:** Use services like UptimeRobot

---

**Next Steps:**
1. Deploy backend to Railway/Heroku
2. Update environment variables
3. Test the full application
4. Set up custom domain (optional)
5. Configure monitoring and analytics