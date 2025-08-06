#!/bin/bash

# PerfumesPlugApp Deployment Script
# This script helps prepare the application for deployment

echo "🚀 PerfumesPlugApp Deployment Preparation"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Checking project structure..."

# Check if client directory exists
if [ ! -d "client" ]; then
    echo "❌ Error: Client directory not found"
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "client/vercel.json" ]; then
    echo "❌ Error: vercel.json not found in client directory"
    exit 1
fi

echo "✅ Project structure looks good"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
echo "🔨 Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: Frontend build failed"
    exit 1
fi

echo "✅ Frontend build successful"

# Go back to root
cd ..

# Check backend dependencies
echo "🐍 Checking backend dependencies..."
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found"
    exit 1
fi

echo "✅ Backend dependencies file found"

# Check for environment files
echo "🔧 Checking environment configuration..."
if [ ! -f "client/.env.example" ]; then
    echo "⚠️  Warning: .env.example not found in client directory"
else
    echo "✅ Environment example file found"
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Deploy backend to Railway/Heroku"
echo "3. Deploy frontend to Vercel"
echo "4. Update environment variables"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"