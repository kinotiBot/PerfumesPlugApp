#!/bin/bash

# GitHub to Railway Deployment Setup Script
# This script helps prepare and push your frontend to GitHub for Railway deployment

echo "🚀 Setting up Frontend for GitHub → Railway Deployment"
echo "===================================================="

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the client directory"
    echo "   cd client"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install Git first."
    exit 1
fi

echo "📋 Choose deployment option:"
echo "1. Create separate frontend repository"
echo "2. Use existing repository with subfolder deployment"
read -p "Enter your choice (1 or 2): " choice

if [ "$choice" = "1" ]; then
    # Option 1: Separate repository
    echo "📝 Creating separate frontend repository..."
    
    # Initialize git if not already initialized
    if [ ! -d ".git" ]; then
        git init
        echo "✅ Git repository initialized"
    fi
    
    # Create .gitignore if it doesn't exist
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
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
EOF
        echo "✅ .gitignore created"
    fi
    
    # Add all files
    git add .
    git commit -m "Initial frontend commit for Railway deployment"
    
    echo "📋 Next steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run these commands:"
    echo "   git branch -M main"
    echo "   git remote add origin https://github.com/yourusername/perfumes-plug-frontend.git"
    echo "   git push -u origin main"
    
elif [ "$choice" = "2" ]; then
    # Option 2: Subfolder deployment
    echo "📝 Preparing for subfolder deployment..."
    
    # Go back to root directory
    cd ..
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        echo "❌ Not in a git repository. Please initialize git in the root directory first."
        exit 1
    fi
    
    # Add and commit changes
    git add client/
    git commit -m "Add Railway deployment configuration for frontend"
    
    echo "📋 Next steps:"
    echo "1. Push to your GitHub repository:"
    echo "   git push origin main"
    echo "2. In Railway, set Root Directory to: client"
    
else
    echo "❌ Invalid choice. Please run the script again and choose 1 or 2."
    exit 1
fi

echo ""
echo "🌐 Railway Deployment Steps:"
echo "1. Go to https://railway.app/dashboard"
echo "2. Click 'New Project'"
echo "3. Select 'Deploy from GitHub repo'"
echo "4. Choose your repository"
echo "5. Configure:"
echo "   - Root Directory: client (if using subfolder)"
echo "   - Build Command: npm run build"
echo "   - Start Command: (leave empty)"
echo "6. Add environment variable:"
echo "   REACT_APP_API_URL=https://perfumesplugapp-production.up.railway.app"

echo ""
echo "✅ Setup complete! Follow the Railway deployment steps above."