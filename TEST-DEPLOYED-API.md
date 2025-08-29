# 🧪 Test Your Deployed API

## Once your Vercel deployment is complete, test with:

### Health Check
```bash
curl https://convi-crawler-api.vercel.app/health
```

### Test bearshop-product.myshopify.com
```bash
curl -X POST https://convi-crawler-api.vercel.app/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://bearshop-product.myshopify.com",
    "options": {
      "buttonSelector": ".storechat-button",
      "zoomSelector": "#storechat-container",
      "zoomLevel": 0.9,
      "removeModals": false,
      "customCSS": "#storechat-container .storechat-header{background-color: #FF0000 !important;}",
      "fullPageScreenshot": false,
      "waitAfterClick": 3000,
      "waitBeforeClick": 3000
    }
  }'
```

## Expected Response:
```json
{
  "success": true,
  "data": {
    "websiteUrl": "https://bearshop-product.myshopify.com",
    "beforeScreenshotUrl": "https://i.ibb.co/...",
    "afterScreenshotUrl": "https://i.ibb.co/...",
    "timestamp": "2025-08-29T..."
  }
}
```

## 📱 Update n8n Workflows:
Change your n8n HTTP Request URL to:
`https://convi-crawler-api.vercel.app/api/crawl`

## ✅ Benefits:
- Always online (no VPN needed!)
- Handles ImgBB uploads automatically
- Scales automatically
- Global CDN for fast responses
