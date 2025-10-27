#!/bin/bash

# Kaden & Adelynn Space Adventures - Deployment Script
# This script builds, commits, and deploys to both GitHub and Firebase

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Get current directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Build the project
echo "📦 Building project..."
npm run build

# Check if there are changes to commit
if [[ -n $(git status -s) ]]; then
    echo "📝 Staging changes..."
    git add -A
    
    # Create commit
    echo "💾 Committing changes..."
    git commit -m "Auto-deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
    
    # Push to GitHub main
    echo "🌐 Pushing to GitHub..."
    git push origin main || echo "Already up to date with GitHub"
else
    echo "✅ No changes to commit"
fi

# Deploy to Firebase
echo "🔥 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌍 Live at: https://kaden---adelynn-adventures.web.app"

