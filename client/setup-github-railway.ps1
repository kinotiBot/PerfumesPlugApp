# GitHub to Railway Deployment Setup Script
# This script helps prepare and push your frontend to GitHub for Railway deployment

Write-Host "Setting up Frontend for GitHub to Railway Deployment" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Check if we're in the client directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Please run this script from the client directory" -ForegroundColor Red
    Write-Host "   cd client" -ForegroundColor Yellow
    exit 1
}

# Check if git is installed
try {
    git --version | Out-Null
}
catch {
    Write-Host "Error: Git not found. Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Create separate frontend repository" -ForegroundColor White
Write-Host "2. Use existing repository with subfolder deployment" -ForegroundColor White
$choice = Read-Host "Enter your choice (1 or 2)"

if ($choice -eq "1") {
    # Option 1: Separate repository
    Write-Host "Creating separate frontend repository..." -ForegroundColor Blue
    
    # Initialize git if not already initialized
    if (-not (Test-Path ".git")) {
        git init
        Write-Host "Git repository initialized" -ForegroundColor Green
    }
    
    # Create .gitignore if it doesn't exist
    if (-not (Test-Path ".gitignore")) {
        $gitignoreContent = @'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
build/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
'@
        $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Host ".gitignore created" -ForegroundColor Green
    }
    
    # Add all files
    git add .
    git commit -m "Initial frontend commit for Railway deployment"
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Create a new repository on GitHub" -ForegroundColor White
    Write-Host "2. Run these commands:" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/yourusername/perfumes-plug-frontend.git" -ForegroundColor Yellow
    Write-Host "   git push -u origin main" -ForegroundColor Yellow
    
} elseif ($choice -eq "2") {
    # Option 2: Subfolder deployment
    Write-Host "Preparing for subfolder deployment..." -ForegroundColor Blue
    
    # Go back to root directory
    Set-Location ..
    
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-Host "Error: Not in a git repository. Please initialize git in the root directory first." -ForegroundColor Red
        exit 1
    }
    
    # Add and commit changes
    git add client/
    git commit -m "Add Railway deployment configuration for frontend"
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Push to your GitHub repository:" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor Yellow
    Write-Host "2. In Railway, set Root Directory to: client" -ForegroundColor White
    
} else {
    Write-Host "Error: Invalid choice. Please run the script again and choose 1 or 2." -ForegroundColor Red
    exit 1
}

Write-Host "" 
Write-Host "Railway Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://railway.app/dashboard" -ForegroundColor White
Write-Host "2. Click 'New Project'" -ForegroundColor White
Write-Host "3. Select 'Deploy from GitHub repo'" -ForegroundColor White
Write-Host "4. Choose your repository" -ForegroundColor White
Write-Host "5. Configure:" -ForegroundColor White
Write-Host "   - Root Directory: client (if using subfolder)" -ForegroundColor Yellow
Write-Host "   - Build Command: npm run build" -ForegroundColor Yellow
Write-Host "   - Start Command: (leave empty)" -ForegroundColor Yellow
Write-Host "6. Add environment variable:" -ForegroundColor White
Write-Host "   REACT_APP_API_URL=https://perfumesplugapp-production.up.railway.app" -ForegroundColor Yellow

Write-Host "" 
Write-Host "Setup complete! Follow the Railway deployment steps above." -ForegroundColor Green