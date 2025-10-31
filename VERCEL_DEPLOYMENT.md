# Vercel Deployment Guide

## Setting Environment Variables in Vercel

To fix the "fetch failed. Please check your API configuration" error, you need to add the environment variable in Vercel:

### Step-by-Step Instructions:

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

3. **Add the Environment Variable**
   - **Name**: `FOOTBALL_DATA_API_KEY`
   - **Value**: `695d5b47a90048f8914f15fb77b0600f`
   - **Environment**: Select all three options:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Click "Save"**

5. **Redeploy Your Application**
   - Go to "Deployments" tab
   - Click the three dots (⋯) on the latest deployment
   - Click "Redeploy"
   - **IMPORTANT**: Check "Use existing Build Cache" checkbox to make it faster

### Alternative: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Set the environment variable
vercel env add FOOTBALL_DATA_API_KEY

# When prompted, paste: 695d5b47a90048f8914f15fb77b0600f
# Select: Production, Preview, Development (all three)

# Redeploy
vercel --prod
```

### Verify It's Working

After redeploying, your app should be able to:
- Fetch match data
- Generate AI predictions with real team statistics
- Display head-to-head data

### Troubleshooting

If you still see errors:

1. **Check Vercel Logs**:
   - Go to your deployment in Vercel
   - Click "Functions" tab
   - Look for any error messages in `/api/team-stats` or `/api/head-to-head`

2. **Verify Environment Variable**:
   - In Vercel Settings → Environment Variables
   - Make sure `FOOTBALL_DATA_API_KEY` is listed
   - Value should NOT be empty

3. **Common Issues**:
   - Missing environment variable → Add it in Vercel dashboard
   - Wrong variable name → Must be exactly `FOOTBALL_DATA_API_KEY`
   - Not redeployed after adding → Redeploy the project
   - API key expired → Get a new one from https://www.football-data.org/

### API Key Information

- **Current Key**: `695d5b47a90048f8914f15fb77b0600f`
- **Provider**: Football-Data.org
- **Free Tier Limits**: 10 requests per minute
- **Get Your Own Key**: https://www.football-data.org/client/register

### Security Note

✅ Your API key is safely stored on Vercel's servers
✅ It's NOT exposed in your frontend code
✅ It's only accessible in server-side API routes

---

**Need Help?** Check Vercel's documentation:
https://vercel.com/docs/projects/environment-variables
