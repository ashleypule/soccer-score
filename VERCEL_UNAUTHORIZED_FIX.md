# VERCEL UNAUTHORIZED ERROR - TROUBLESHOOTING GUIDE

## Current Error
```
Error: Failed to fetch matches: Unauthorized
Please check your API configuration in .env.local
```

## Root Cause
The `FOOTBALL_DATA_API_KEY` environment variable in Vercel is either:
- ❌ Not set at all
- ❌ Has extra quotes around it (e.g., `"695d5b47a90048f8914f15fb77b0600f"`)
- ❌ Has extra spaces
- ❌ Is set for wrong environments

## ✅ STEP-BY-STEP FIX

### Step 1: Access Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Find and click on your project (soccer-score or similar name)

### Step 2: Navigate to Environment Variables
1. Click on **"Settings"** tab at the top
2. Click on **"Environment Variables"** in the left sidebar

### Step 3: Check Existing Variable
Look for `FOOTBALL_DATA_API_KEY` in the list:

**If it exists:**
- Click the **"..."** (three dots) next to it
- Click **"Delete"**
- Confirm deletion

**If it doesn't exist:**
- Skip to Step 4

### Step 4: Add New Environment Variable

Click the **"Add New"** button and enter:

| Field | Value |
|-------|-------|
| **Name** | `FOOTBALL_DATA_API_KEY` |
| **Value** | `695d5b47a90048f8914f15fb77b0600f` |

⚠️ **CRITICAL**: 
- NO quotes around the value
- NO spaces before or after
- Copy-paste to avoid typos

**Select Environments:**
- ✅ Check **Production**
- ✅ Check **Preview**  
- ✅ Check **Development**

Click **"Save"**

### Step 5: Redeploy
Environment variables only take effect after redeployment:

1. Click **"Deployments"** tab at the top
2. Find the **latest deployment** (should be at the top)
3. Click the **"..."** (three dots) on the right
4. Click **"Redeploy"**
5. ✅ Optional: Check "Use existing Build Cache" for faster deployment
6. Click **"Redeploy"** button to confirm

### Step 6: Wait for Deployment
- Deployment usually takes 1-3 minutes
- Watch the progress in Vercel dashboard
- Wait for **"Ready"** status

### Step 7: Test Your Site
1. Once deployed, visit your Vercel URL
2. The page should load without errors
3. Matches should display correctly

## 🔍 Verify Environment Variable (Optional)

After redeployment, you can verify the variable is loaded by visiting:
```
https://your-vercel-url.vercel.app/api/test-api-key
```

You should see:
```json
{
  "apiKeyExists": true,
  "apiKeyLength": 32,
  "apiKeyPreview": "695d5b47...0600f",
  "envVarName": "FOOTBALL_DATA_API_KEY",
  "nodeEnv": "production"
}
```

## ⚠️ Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `"695d5b47a90048f8914f15fb77b0600f"` | `695d5b47a90048f8914f15fb77b0600f` |
| ` 695d5b47a90048f8914f15fb77b0600f ` (spaces) | `695d5b47a90048f8914f15fb77b0600f` |
| `'695d5b47a90048f8914f15fb77b0600f'` | `695d5b47a90048f8914f15fb77b0600f` |
| Only Production checked | All three environments checked ✅ |
| Saved but not redeployed | Saved AND redeployed ✅ |

## 🆘 Still Not Working?

If you still see the error after following all steps:

### 1. Check Vercel Logs
- Go to your deployment in Vercel
- Click on **"Functions"** tab
- Look for errors in `/api/matches` or `/api/team-stats`
- Share the error message for help

### 2. Verify API Key is Valid
Test the API key directly:
```bash
curl -H "X-Auth-Token: 695d5b47a90048f8914f15fb77b0600f" \
  https://api.football-data.org/v4/competitions
```

If this returns an error, the API key might be expired.

### 3. Get a New API Key
If the key is expired:
1. Go to: https://www.football-data.org/client/register
2. Register or login
3. Get a new API key
4. Update in Vercel (repeat steps above with new key)

## 📝 Checklist

Before asking for help, ensure:

- [ ] Environment variable name is exactly `FOOTBALL_DATA_API_KEY`
- [ ] Value has NO quotes, NO spaces
- [ ] All 3 environments are selected (Production, Preview, Development)
- [ ] Variable was saved in Vercel
- [ ] Project was redeployed after saving
- [ ] Waited for deployment to complete (Ready status)
- [ ] Cleared browser cache and refreshed page

## 🎯 Expected Result

After completing all steps:
- ✅ Page loads without errors
- ✅ Football matches display
- ✅ AI predictions work
- ✅ League filters work
- ✅ No "Unauthorized" errors

---

**Last Updated:** October 31, 2025  
**API Key:** `695d5b47a90048f8914f15fb77b0600f`  
**Verified:** ✅ Key tested and working with Football-Data.org API
