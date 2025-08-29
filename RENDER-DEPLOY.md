# 🚀 Deploy to Render.com (Vercel Alternative)

## Why Render?
- ✅ **Free tier** with 750 hours/month
- ✅ **No complex login** - GitHub OAuth
- ✅ **Automatic deploys** from GitHub
- ✅ **Better for long-running tasks** (5 min timeout vs Vercel's 10s)

## Step 1: Prepare for Render

Create `render.yaml` in your project:

```yaml
services:
  - type: web
    name: convi-crawler-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:api
    envVars:
      - key: IMGBB_API_KEY
        value: 9c4c485b1b1a33b4fff5eabe1cfc64e0
      - key: NODE_ENV
        value: production
```

## Step 2: Deploy

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

2. **Go to:** https://render.com
3. **Sign in with:** GitHub
4. **Click:** New + > Web Service
5. **Connect:** Your GitHub repo
6. **Deploy!**

## Step 3: Your API URLs

After deployment:
- `https://convi-crawler-api.onrender.com/health`
- `https://convi-crawler-api.onrender.com/api/crawl`

## 🎯 Test Command

```bash
curl -X POST https://convi-crawler-api.onrender.com/api/crawl \
  -H "Content-Type: application/json" \
  -d '{
    "websiteUrl": "https://bearshop-product.myshopify.com",
    "options": {
      "buttonSelector": ".storechat-button",
      "zoomSelector": "#storechat-container",
      "zoomLevel": 0.9
    }
  }'
```
