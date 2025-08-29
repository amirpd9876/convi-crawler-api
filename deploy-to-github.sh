#!/bin/bash

echo "🚀 Deploying Convi Crawler to GitHub..."
echo ""
echo "📝 STEP 1: Create a GitHub Repository"
echo "========================================="
echo ""
echo "1. Open this link in your browser:"
echo "   👉 https://github.com/new"
echo ""
echo "2. Fill in:"
echo "   - Repository name: convi-crawler-api"
echo "   - Description: Web crawler API for Shopify stores"
echo "   - Keep it PUBLIC"
echo "   - DON'T initialize with README"
echo ""
echo "3. Click 'Create repository'"
echo ""
echo "Press ENTER when you've created the repository..."
read

echo ""
echo "📦 STEP 2: What's your GitHub username?"
echo "========================================="
read -p "Enter your GitHub username: " GITHUB_USERNAME

echo ""
echo "🔗 Connecting to GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USERNAME/convi-crawler-api.git
git branch -M main

echo "📤 Pushing code to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 STEP 3: Deploy to Vercel"
echo "========================================="
echo ""
echo "1. Open this link:"
echo "   👉 https://vercel.com/new/clone?repository-url=https://github.com/$GITHUB_USERNAME/convi-crawler-api"
echo ""
echo "2. Click 'Deploy'"
echo "3. Sign in with GitHub (easier than email)"
echo "4. Wait for deployment (~2 minutes)"
echo ""
echo "🎉 Your API will be live at:"
echo "   https://convi-crawler-api.vercel.app/health"
echo "   https://convi-crawler-api.vercel.app/api/crawl"
echo ""
echo "📱 Update your n8n with the new URL!"
