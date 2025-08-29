# 🚀 Quick Vercel Deployment

## ✅ Everything is Ready!

Your project is fully configured for Vercel deployment. All files are created and tested.

## 📋 Two Ways to Deploy

### Option 1: Browser Login (Easiest)
```bash
# 1. Login to Vercel
vercel login
# Enter email: a.p.derakhshan98@gmail.com
# Check email and click verification link

# 2. Deploy to production
vercel --prod
# Accept all defaults (just press Enter)
```

### Option 2: Using Token (No Browser)
```bash
# 1. Get token from: https://vercel.com/account/tokens
# 2. Deploy with token
VERCEL_TOKEN=your-token-here vercel --prod --token $VERCEL_TOKEN
```

## 🎯 Your API URLs (After Deploy)

Replace `your-project-name` with actual URL from Vercel:

- **Health:** `https://your-project-name.vercel.app/health`
- **API:** `https://your-project-name.vercel.app/api/crawl`

## 🧪 Test Your Deployed API

```bash
# Test bearshop-product.myshopify.com
curl -X POST https://your-project-name.vercel.app/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://bearshop-product.myshopify.com",
    "options": {
      "buttonSelector": ".storechat-button",
      "zoomSelector": "#storechat-container",
      "zoomLevel": 0.9,
      "customCSS": "#storechat-container .storechat-header{background-color: #FF0000 !important;}"
    }
  }'
```

## 📱 Update n8n

After deployment, update your n8n HTTP Request nodes:
- Change URL from `https://ngrok-url.app/api/crawl`
- To: `https://your-vercel-url.vercel.app/api/crawl`

## ✨ Benefits

- ✅ **Always Online** - No need to keep local server running
- ✅ **No VPN Needed** - Vercel handles everything
- ✅ **Auto-scaling** - Handles multiple requests
- ✅ **Global CDN** - Fast from anywhere
- ✅ **Free Tier** - 100GB bandwidth/month

## 🔧 Troubleshooting

If deployment fails:
1. Run `npm run build` to check for errors
2. Check `vercel logs` for details
3. Ensure you're in the `/Users/amir/Downloads/crawler` directory

## 🎉 Success!

Your API is production-ready and will work perfectly with n8n!
