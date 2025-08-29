# 🚀 Vercel Deployment Guide

## Prerequisites Completed ✅
- Vercel CLI installed
- Project configured with vercel.json
- All dependencies in package.json
- API endpoint created in /api/index.ts

## 🔐 Manual Deployment Steps

### Step 1: Login to Vercel
```bash
vercel login
```
- Choose "Continue with Email"
- Enter your email: a.p.derakhshan98@gmail.com
- Check your email and click the verification link
- Make sure the security code matches what's shown in terminal

### Step 2: Deploy to Production
```bash
vercel --prod
```

When prompted:
- Set up and deploy: Y
- Which scope: Select your account
- Link to existing project?: N
- Project name: convi-crawler-api (or press enter for default)
- Directory: ./ (press enter)
- Override settings?: N

## 🎯 Your API Endpoints Will Be:

After deployment, your API will be available at:
- **Health Check:** `https://your-project.vercel.app/health`
- **Crawl API:** `https://your-project.vercel.app/api/crawl`
- **Batch API:** `https://your-project.vercel.app/api/crawl-batch`

## 📝 Test Your Deployed API

```bash
# Test health endpoint
curl https://your-project.vercel.app/health

# Test crawl endpoint
curl -X POST https://your-project.vercel.app/api/crawl \
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

## 🔧 Environment Variables

Already configured in vercel.json:
- `IMGBB_API_KEY`: 9c4c485b1b1a33b4fff5eabe1cfc64e0

## 📊 Monitoring

View logs and metrics:
```bash
vercel logs
vercel inspect
```

## 🆘 Troubleshooting

If deployment fails:
1. Check build logs: `vercel logs`
2. Ensure TypeScript compiles: `npm run build`
3. Test locally first: `npm run dev:api`
4. Check Vercel dashboard for errors

## 🎉 Success!

Once deployed, update your n8n workflows to use the new Vercel URL instead of localhost!
