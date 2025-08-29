# 📤 Push to GitHub - Simple Commands

## After creating your GitHub repository, run these commands:

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```bash
# Set your GitHub username
GITHUB_USERNAME="YOUR_GITHUB_USERNAME"

# Connect to GitHub
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USERNAME/convi-crawler-api.git
git branch -M main

# Push your code
git push -u origin main
```

## Example:
If your GitHub username is `amir123`, run:
```bash
GITHUB_USERNAME="amir123"
git remote remove origin 2>/dev/null
git remote add origin https://github.com/$GITHUB_USERNAME/convi-crawler-api.git
git branch -M main
git push -u origin main
```

## After pushing, deploy to Vercel:
1. Go to: https://vercel.com/new
2. Click "Continue with GitHub"
3. Import your `convi-crawler-api` repository
4. Click "Deploy"

Your API will be live in 2 minutes!
