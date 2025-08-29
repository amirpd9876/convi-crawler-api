# 🚀 Deploy to Vercel via GitHub (No Login Required!)

## Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Convi Crawler API"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/convi-crawler-api.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy via Vercel Website

1. **Go to:** https://vercel.com/new
2. **Click:** "Import Git Repository"
3. **Sign in with:** GitHub (easier than email)
4. **Select:** Your `convi-crawler-api` repository
5. **Configure:**
   - Framework Preset: **Other**
   - Root Directory: **./** 
   - Build Command: **npm run build**
   - Output Directory: **dist**
   - Install Command: **npm install**

6. **Environment Variables (Add these):**
   - `IMGBB_API_KEY` = `9c4c485b1b1a33b4fff5eabe1cfc64e0`

7. **Click:** Deploy

## Step 3: Your API URLs

After deployment, you'll get:
- `https://your-project.vercel.app/health`
- `https://your-project.vercel.app/api/crawl`

## ✅ Benefits

- No CLI login required
- Auto-deploys on every push
- Free SSL certificate
- Custom domain support
