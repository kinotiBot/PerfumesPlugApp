#!/bin/bash

# Railway Frontend Deployment Script
# This script helps deploy the React frontend to Railway

echo "🚀 Deploying Perfumes Plug Frontend to Railway"
echo "================================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Check if logged in to Railway
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway first:"
    railway login
fi

# Build the React app locally to check for errors
echo "🔨 Building React app locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

echo "✅ Local build successful!"

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Check your Railway dashboard for the deployment URL"
    echo "2. Add the Railway frontend URL to backend CORS settings"
    echo "3. Test the deployed application"
    echo "4. Configure custom domain if needed"
    echo ""
    echo "🔗 Railway Dashboard: https://railway.app/dashboard"
else
    echo "❌ Deployment failed. Check the logs above for details."
    exit 1
fi