# 🔑 Deploy with Vercel Token (No Email Verification)

## Step 1: Get Your Token

1. **Go to:** https://vercel.com
2. **Sign up/Login with:** GitHub (easier) or Google
3. **Navigate to:** https://vercel.com/account/tokens
4. **Create:** New Token
5. **Copy:** The token (starts with `Bearer ...`)

## Step 2: Deploy with Token

```bash
# Set your token
export VERCEL_TOKEN="your-token-here"

# Deploy directly (no login needed!)
vercel --prod --token $VERCEL_TOKEN --yes

# Or in one line:
VERCEL_TOKEN="your-token-here" vercel --prod --token $VERCEL_TOKEN --yes
```

## Step 3: Answer Prompts

When deploying for first time:
- Set up and deploy? **Y**
- Which scope? **Your account name**
- Link to existing? **N**
- Project name? **convi-crawler-api** (or press Enter)
- Directory? **./** (press Enter)
- Override? **N**

## Your API will be at:
- `https://convi-crawler-api.vercel.app/health`
- `https://convi-crawler-api.vercel.app/api/crawl`
