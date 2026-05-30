# Fix Gemini API Key Issue

## Current Error
```
"models/gemini-1.5-flash is not found for API version v1, or is not supported for generateContent"
```

This means either:
1. Your API key doesn't have access to this model
2. The API key is invalid/expired
3. Need to use a different model name

## Solution: Create New Gemini API Key

### Step 1: Go to Google AI Studio
https://aistudio.google.com/app/apikey

### Step 2: Create New API Key
1. Click **"Create API Key"**
2. Select your Google Cloud project (or create new one)
3. Click **"Create API key in existing project"**
4. **Copy the new API key**

### Step 3: Update Render Environment Variables
1. Go to Render Dashboard: https://dashboard.render.com
2. Click your "Compawss-ai" service
3. Go to **Environment** tab
4. Find `GEMINI_API_KEY`
5. Click **Edit**
6. Paste your NEW API key
7. Click **Save Changes**

### Step 4: Redeploy
Render will automatically redeploy with the new key.

### Step 5: Test
Wait 5 minutes, then test:
```bash
curl https://compawss-ai.onrender.com/health
```

## Alternative: Try Different Model Name

If new API key doesn't work, we can try using `gemini-1.5-pro` or `gemini-pro` instead of `gemini-1.5-flash`.

Let me know if you want to try that!

## Current API Key Location
Your current key is in:
- Render Environment Variables: `GEMINI_API_KEY`
- Local `.env.local`: Line 12
- Local `backend/.env`: (if exists)

**DO NOT commit API keys to GitHub!**