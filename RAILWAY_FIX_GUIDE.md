# Railway Database Fix Guide

## Problem Description

The Railway production API is returning empty data, causing:
- Missing images in the mobile app
- Login functionality not working
- No perfumes, categories, or brands showing up

This happens because the Railway PostgreSQL database is empty or not properly configured.

## Solution Overview

We've created automated scripts to fix the Railway database issue by:
1. Connecting to your Railway PostgreSQL database
2. Running necessary migrations
3. Populating the database with required data (users, perfumes, categories, brands)
4. Verifying the fix worked

## Quick Fix (Recommended)

### Step 1: Get Your Railway Database URL

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Click on your **PostgreSQL** service (not your app service)
4. Go to the **"Connect"** tab
5. Copy the **"Database URL"** (starts with `postgresql://`)

   Example: `postgresql://postgres:password@host.railway.app:5432/railway`

### Step 2: Run the Fix Script

**Option A: PowerShell (Recommended for Windows)**
```powershell
# Run this in PowerShell (right-click -> Run as Administrator)
.\fix_railway.ps1
```

**Option B: Command Prompt**
```cmd
# Run this in Command Prompt
fix_railway.bat
```

**Option C: Manual Python Script**
```powershell
# Set the DATABASE_URL environment variable
$env:DATABASE_URL="postgresql://your-database-url-here"

# Run the fix script
python fix_railway_database.py
```

### Step 3: Update Frontend Configuration

After the database is fixed, update your frontend to use Railway:

```powershell
# Update the frontend environment file
echo "REACT_APP_API_URL=https://perfumesplugapp-production.up.railway.app" > client\.env.local

# Restart the React development server
cd client
npm start
```

## What the Fix Script Does

### 1. Database Connection
- Verifies your DATABASE_URL is set correctly
- Tests connection to Railway PostgreSQL
- Checks database version and status

### 2. Database Setup
- Runs Django migrations to create tables
- Ensures all required database schema is in place

### 3. Data Population
- **Admin User**: `admin@example.com` / `admin123`
- **Test User**: `kinoti.ke@gmail.com` / `abc12345`
- **Categories**: Men, Women, Unisex
- **Brands**: Tom Ford, Chanel
- **Sample Perfumes**: 
  - Tom Ford Black Orchid (Featured)
  - Chanel No. 5 (Featured)
  - Tom Ford Oud Wood

### 4. Verification
- Confirms all data was created successfully
- Provides counts of users, perfumes, categories, and brands

## Troubleshooting

### Common Issues

**1. "DATABASE_URL not set" Error**
- Make sure you copied the correct URL from Railway
- URL should start with `postgresql://`
- Don't include quotes when setting the environment variable

**2. "Connection failed" Error**
- Check if your Railway PostgreSQL service is running
- Verify the DATABASE_URL is correct
- Try refreshing the database URL from Railway dashboard

**3. "Migration failed" Error**
- Your database might be corrupted
- Try creating a new PostgreSQL service in Railway
- Update your DATABASE_URL to the new service

**4. "Python not found" Error**
- Make sure Python is installed: `python --version`
- Install Python from [python.org](https://python.org) if needed
- Make sure you're in the project directory

### Manual Verification

After running the fix, you can verify it worked:

```powershell
# Test the API directly
Invoke-WebRequest -Uri "https://perfumesplugapp-production.up.railway.app/api/perfumes/featured/" -Headers @{"Accept"="application/json"}
```

You should see JSON data with perfumes, not an empty array `[]`.

## Alternative: Railway CLI Method

If the scripts don't work, you can use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run the setup script
railway run python setup_railway_database.py
```

## Post-Fix Checklist

- [ ] Railway API returns data: `https://perfumesplugapp-production.up.railway.app/api/perfumes/featured/`
- [ ] Frontend uses Railway URL in `.env.local`
- [ ] Mobile app shows images and perfumes
- [ ] Login functionality works
- [ ] Admin panel accessible at Railway URL + `/admin/`

## Support

If you're still having issues:

1. Check the Railway service logs in your dashboard
2. Verify your PostgreSQL service is running
3. Try creating a fresh PostgreSQL service
4. Run the fix script again with the new DATABASE_URL

## Files Created

- `fix_railway_database.py` - Main Python fix script
- `fix_railway.ps1` - PowerShell wrapper script
- `fix_railway.bat` - Batch file wrapper script
- `RAILWAY_FIX_GUIDE.md` - This guide

These files are safe to delete after the fix is complete.