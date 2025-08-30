# 🚀 Replit Setup Guide for Convi Crawler API

## ✅ Quick Setup (2 minutes)

### 1. Import from GitHub
1. Open Replit.com
2. Click "Create Repl" → "Import from GitHub"
3. Paste: `https://github.com/amirpd9876/convi-crawler-api`
4. Click "Import"

### 2. Install Dependencies
Once imported, the server will automatically:
- Install all dependencies including Puppeteer
- Build the TypeScript code
- Start the API server

### 3. Test the API

#### Health Check:
```bash
curl http://localhost:3000/health
```

#### Test Crawl:
```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://bearshop-product.myshopify.com"}'
```

#### Test with Custom CSS:
```bash
curl -X POST http://localhost:3000/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://bearshop-product.myshopify.com",
    "options": {
      "buttonSelector": ".storechat-button",
      "zoomSelector": ".storechat-widget",
      "zoomLevel": 0.9,
      "customCSS": "#storechat-container .storechat-header{background-color: #FF0000 !important;}",
      "waitAfterClick": 3000
    }
  }'
```

## 📱 Browser Access
In the Webview, you can access:
- `/health` - Health check
- `/api/test` - API documentation

## 🔧 Troubleshooting

### If the server doesn't start:
1. Click "Stop" then "Run" again
2. Or in Shell: `npm run start`

### If you get port errors:
```bash
pkill -f node
npm run start
```

### To rebuild from scratch:
```bash
rm -rf dist/
npm run build
npm run start
```

## 🎯 Expected Success Response:
```json
{
  "success": true,
  "data": {
    "websiteUrl": "https://bearshop-product.myshopify.com",
    "beforeScreenshotUrl": "https://i.ibb.co/...",
    "afterScreenshotUrl": "https://i.ibb.co/...",
    "timestamp": "2025-08-30T...",
    "processingTime": "..."
  }
}
```

## 📝 Note
This project uses **Puppeteer** (not Playwright) for better Replit compatibility.
