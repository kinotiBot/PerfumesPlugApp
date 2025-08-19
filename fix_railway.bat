@echo off
echo ========================================
echo Railway Database Fix Script
echo ========================================
echo.
echo This script will help you fix the Railway database issue.
echo.
echo IMPORTANT: Before running this script, you need to:
echo 1. Go to your Railway project dashboard
echo 2. Click on your PostgreSQL service
echo 3. Go to 'Connect' tab
echo 4. Copy the 'Database URL' (starts with postgresql://)
echo 5. Set it as environment variable below
echo.
echo Example:
echo set DATABASE_URL=postgresql://postgres:password@host:port/database
echo.
set /p DATABASE_URL="Enter your Railway DATABASE_URL: "
echo.
echo Setting DATABASE_URL...
set DATABASE_URL=%DATABASE_URL%
echo.
echo Running Railway database fix...
python fix_railway_database.py
echo.
echo Press any key to exit...
pause >nul