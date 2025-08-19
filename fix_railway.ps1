# Railway Database Fix PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Railway Database Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you fix the Railway database issue." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Before running this script, you need to:" -ForegroundColor Red
Write-Host "1. Go to your Railway project dashboard" -ForegroundColor White
Write-Host "2. Click on your PostgreSQL service" -ForegroundColor White
Write-Host "3. Go to 'Connect' tab" -ForegroundColor White
Write-Host "4. Copy the 'Database URL' (starts with postgresql://)" -ForegroundColor White
Write-Host "5. Enter it below when prompted" -ForegroundColor White
Write-Host ""
Write-Host "Example URL format:" -ForegroundColor Green
Write-Host "postgresql://postgres:password@host:port/database" -ForegroundColor Gray
Write-Host ""

# Prompt for DATABASE_URL
$databaseUrl = Read-Host "Enter your Railway DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "❌ No DATABASE_URL provided. Exiting..." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (-not $databaseUrl.StartsWith("postgresql://")) {
    Write-Host "⚠️  Warning: URL doesn't start with 'postgresql://'. Are you sure this is correct?" -ForegroundColor Yellow
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Exiting..." -ForegroundColor Yellow
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "Setting DATABASE_URL environment variable..." -ForegroundColor Green
$env:DATABASE_URL = $databaseUrl

Write-Host "✅ DATABASE_URL set successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Running Railway database fix script..." -ForegroundColor Cyan
Write-Host ""

try {
    # Run the Python script
    python fix_railway_database.py
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Railway database fix completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Update your frontend to use the Railway API URL" -ForegroundColor White
        Write-Host "2. Test the mobile app login functionality" -ForegroundColor White
        Write-Host "3. Verify that images and data are loading properly" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "❌ Railway database fix failed. Check the errors above." -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running the fix script: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Python is installed and in your PATH" -ForegroundColor White
    Write-Host "2. Make sure you're in the correct project directory" -ForegroundColor White
    Write-Host "3. Check that the DATABASE_URL is correct" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"