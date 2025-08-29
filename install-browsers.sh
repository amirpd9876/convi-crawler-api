#!/bin/bash

echo "🎭 Installing Playwright browsers for Replit..."

# Create cache directory if it doesn't exist
mkdir -p ~/.cache/ms-playwright

# Install only chromium with dependencies
npx playwright install chromium
npx playwright install-deps chromium

echo "✅ Playwright browsers installed successfully!"
