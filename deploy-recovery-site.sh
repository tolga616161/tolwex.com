#!/bin/bash
# TOLWEX Recovery Site - One-Click Deploy Script
# Run this AFTER authenticating to GitHub

set -e

echo "🚀 TOLWEX Recovery Site Deployment"
echo "===================================="
echo ""

cd /agent

# Check if we're on the right branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "app" ]; then
    echo "⚠️  Switching to branch 'app'..."
    git checkout app
fi

# Show what will be pushed
echo "📦 Commits to push:"
git log origin/app..app --oneline
echo ""

# Attempt push
echo "📤 Pushing to GitHub..."
if git push origin app; then
    echo "✅ Push successful!"
    echo ""
    echo "⏳ Waiting 5 seconds for Vercel to detect changes..."
    sleep 5
    
    echo ""
    echo "🔍 Checking deployment status..."
    echo "GitHub branch:"
    git log origin/app --oneline -1
    echo ""
    
    echo "Live site status:"
    curl -s https://tolwex.com | grep -o '<title>[^<]*</title>' || echo "Could not fetch title"
    echo ""
    
    echo "✅ Deployment initiated!"
    echo "Monitor at: https://vercel.com/tolwex/tolwex-com"
    echo "Live site: https://tolwex.com"
    echo ""
    echo "Note: Vercel may take 1-2 minutes to build and deploy."
else
    echo "❌ Push failed. Check authentication."
    exit 1
fi
