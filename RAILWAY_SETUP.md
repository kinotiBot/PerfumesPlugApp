# Railway Deployment Setup Guide

## Database Configuration

Your Django app is configured to use PostgreSQL in production via the `DATABASE_URL` environment variable.

### Steps to Configure PostgreSQL on Railway:

1. **Add PostgreSQL Service:**
   - In your Railway project dashboard
   - Click "+ New Service"
   - Select "Database" → "PostgreSQL"
   - Railway will create a PostgreSQL instance

2. **Get Database Connection String:**
   - Go to your PostgreSQL service
   - Navigate to "Connect" tab
   - Copy the "Database URL" (starts with `postgresql://`)

3. **Set Environment Variable:**
   - Go to your Django service (web app)
   - Navigate to "Variables" tab
   - Add new variable:
     - **Name:** `DATABASE_URL`
     - **Value:** The PostgreSQL URL you copied (e.g., `postgresql://postgres:password@host:port/database`)

4. **Additional Required Environment Variables:**
   ```
   DEBUG=False
   SECRET_KEY=your-super-secret-production-key
   ALLOWED_HOSTS=your-app-name.railway.app
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

5. **Redeploy:**
   - After setting the `DATABASE_URL`, redeploy your service
   - Django will automatically use PostgreSQL instead of SQLite
   - Migrations will run automatically on startup

## Verification

Once deployed with `DATABASE_URL` set, your app will:
- Connect to PostgreSQL instead of SQLite
- Run migrations automatically on startup
- Serve static files via WhiteNoise

## Troubleshooting

- If you see SQLite errors, ensure `DATABASE_URL` is properly set
- Check Railway logs for connection issues
- Verify PostgreSQL service is running