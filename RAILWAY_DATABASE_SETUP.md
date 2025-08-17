# Railway Database Setup Guide

## 🔍 Authentication Issue Analysis

The authentication failure on mobile devices is occurring because:

1. **Local vs Production Database**: Your local development uses SQLite with user data, while Railway uses PostgreSQL that only has the database schema (from migrations) but no user accounts.

2. **Missing User Data**: The user `kinoti.ke@gmail.com` exists in your local SQLite database but not in the Railway PostgreSQL database.

3. **Empty Production Database**: Railway automatically runs migrations on deployment, creating the database structure, but doesn't populate it with users or sample data.

## 🚀 Solution: Populate Railway Database

### Option 1: Run Setup Script Locally (Recommended)

**Step 1: Get Railway Database URL**
1. Go to your Railway project dashboard
2. Click on your PostgreSQL service
3. Go to "Connect" tab
4. Copy the "Database URL" (starts with `postgresql://`)

**Step 2: Set Environment Variable**
```powershell
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:password@host:port/database"

# Or create a .env file with:
# DATABASE_URL=postgresql://postgres:password@host:port/database
```

**Step 3: Run Database Setup**
```bash
# Full setup (admin + test user + sample data)
python setup_railway_database.py

# Or just create the specific user
python create_kinoti_user.py
```

### Option 2: Use Django Management Commands

**Create Admin User:**
```bash
# Set DATABASE_URL environment variable first
python manage.py create_production_admin
```

**Add Sample Perfumes:**
```bash
python manage.py add_arabic_perfumes
```

**Create Custom User via Django Shell:**
```bash
python manage.py shell
```

Then in the Django shell:
```python
from django.contrib.auth import get_user_model
User = get_user_model()

# Create the test user
user = User.objects.create_user(
    email='kinoti.ke@gmail.com',
    password='abc12345',
    first_name='Kinoti',
    last_name='User'
)
print(f"Created user: {user.email}")
```

### Option 3: Railway CLI (Advanced)

If you have Railway CLI installed:

```bash
# Login to Railway
railway login

# Connect to your project
railway link

# Run commands on Railway
railway run python setup_railway_database.py
```

## 🧪 Verification Steps

### 1. Test Database Connection
```python
python -c "
import os
os.environ['DATABASE_URL'] = 'your-railway-db-url'
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT current_database();')
    print(f'Connected to: {cursor.fetchone()[0]}')
"
```

### 2. Verify User Creation
```python
python -c "
import os
os.environ['DATABASE_URL'] = 'your-railway-db-url'
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'perfumes_project.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
user = User.objects.get(email='kinoti.ke@gmail.com')
print(f'User found: {user.email}, Active: {user.is_active}')
print(f'Password check: {user.check_password("abc12345")}')
"
```

### 3. Test API Authentication
```powershell
# Test login endpoint
$body = @{
    email = "kinoti.ke@gmail.com"
    password = "abc12345"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "User-Agent" = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
}

Invoke-RestMethod -Uri "https://perfumesplugapp-production.up.railway.app/api/users/login/" -Method POST -Body $body -Headers $headers
```

## 📋 User Accounts to Create

Based on your testing, create these accounts:

### Admin User
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: Admin/Staff

### Test User (Mobile App)
- **Email**: `kinoti.ke@gmail.com`
- **Password**: `abc12345`
- **Role**: Regular user

## 🔧 Troubleshooting

### Issue: "User does not exist"
**Solution**: Run the user creation script with the correct DATABASE_URL

### Issue: "Password authentication failed"
**Solution**: Ensure the password is set correctly using `user.set_password()`

### Issue: "Connection refused"
**Solution**: Verify the DATABASE_URL is correct and the PostgreSQL service is running

### Issue: "Still using SQLite"
**Solution**: Make sure DATABASE_URL environment variable is set before running Django

## 🎯 Quick Fix for Mobile Authentication

**Immediate Solution:**
1. Set your Railway DATABASE_URL as an environment variable
2. Run: `python create_kinoti_user.py`
3. Test mobile login again

**Expected Result:**
- Mobile app should successfully authenticate with `kinoti.ke@gmail.com` / `abc12345`
- User should be able to access the app features

## 📝 Notes

- **Database Separation**: Local SQLite and Railway PostgreSQL are completely separate
- **Migration vs Data**: Railway runs migrations (schema) but doesn't copy data
- **Environment Variables**: Always ensure DATABASE_URL points to Railway when populating production data
- **Security**: Change default passwords in production

## 🔄 Future Deployments

For future deployments, consider:
1. Creating a data migration to populate initial users
2. Using Django fixtures for sample data
3. Setting up a proper user registration flow
4. Implementing database seeding in your deployment pipeline

---

**Next Steps:**
1. Choose one of the setup options above
2. Populate the Railway database
3. Test mobile authentication
4. Verify all app functionality works