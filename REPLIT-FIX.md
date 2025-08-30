# 🔧 Replit Puppeteer Fix Guide

## 🚨 Current Issue
Puppeteer Chrome missing system libraries on Replit

## ✅ Solution Applied
1. **Added `replit.nix`** - Installs system dependencies
2. **Updated Puppeteer config** - Uses system Chromium
3. **Skip Chrome download** - Uses Replit's Chromium

## 📋 Instructions for Replit

### Option 1: Reimport from GitHub (Recommended)
```bash
1. Delete your current Repl
2. Create new Repl → Import from GitHub
3. Use: https://github.com/amirpd9876/convi-crawler-api
4. Wait for auto-setup
```

### Option 2: Update Existing Repl
In Shell:
```bash
# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Kill any running servers
pkill -f node

# Start fresh
npm run start
```

### Option 3: If Still Having Issues
In Shell:
```bash
# Install Chromium manually
nix-env -iA nixpkgs.chromium

# Find Chromium path
which chromium

# Set environment variable
export PUPPETEER_EXECUTABLE_PATH=$(which chromium)

# Restart
npm run start
```

## 🎯 Expected Output
```
🌐 Detected Replit environment, using system Chromium...
✅ Found Chromium at: /usr/bin/chromium
✅ Browser initialized successfully
```

## 📝 Test Command
```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://bearshop-product.myshopify.com"}'
```

## ✨ What Changed
- No more Chrome download errors
- Uses Replit's system Chromium
- Faster startup
- More stable on Replit
