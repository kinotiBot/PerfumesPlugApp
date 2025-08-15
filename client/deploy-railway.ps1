# Railway Frontend Deployment Script (PowerShell)
# This script helps deploy the React frontend to Railway

Write-Host "🚀 Deploying Perfumes Plug Frontend to Railway" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if Railway CLI is installed
try {
    railway --version | Out-Null
}
catch {
    Write-Host "❌ Railway CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Check if logged in to Railway
try {
    railway whoami | Out-Null
}
catch {
    Write-Host "🔐 Please login to Railway first:" -ForegroundColor Yellow
    railway login
}

# Build the React app locally to check for errors
Write-Host "🔨 Building React app locally..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Please fix the errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Local build successful!" -ForegroundColor Green

# Deploy to Railway
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Blue
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Check your Railway dashboard for the deployment URL" -ForegroundColor White
    Write-Host "2. Add the Railway frontend URL to backend CORS settings" -ForegroundColor White
    Write-Host "3. Test the deployed application" -ForegroundColor White
    Write-Host "4. Configure custom domain if needed" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Railway Dashboard: https://railway.app/dashboard" -ForegroundColor Blue
} else {
    Write-Host "❌ Deployment failed. Check the logs above for details." -ForegroundColor Red
    exit 1
}