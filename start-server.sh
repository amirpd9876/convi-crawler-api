#!/bin/bash

echo "🎭 Checking Playwright browsers..."

# Check if chromium is installed
if [ ! -d "$HOME/.cache/ms-playwright/chromium"* ]; then
    echo "📦 Installing Playwright browsers..."
    npx playwright install chromium
else
    echo "✅ Playwright browsers already installed"
fi

echo "🚀 Starting API server..."
node dist/src/api-server.js
