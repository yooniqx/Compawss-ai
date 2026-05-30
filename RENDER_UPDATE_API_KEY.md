# 🔑 Update Gemini API Key in Render

## New Gemini API Key
```
AIzaSyAQ.Ab8RN6J3GKUE-hGt93UcykLs3dOm2cUmxR1zSljRqR9znYg_rw
```

## Steps to Update in Render

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com/
   - Sign in to your account

2. **Select Your Service**
   - Find and click on your `compawss-ai` backend service
   - Or go directly to: https://dashboard.render.com/web/YOUR_SERVICE_ID

3. **Navigate to Environment Variables**
   - Click on "Environment" in the left sidebar
   - Or look for the "Environment" tab

4. **Update GEMINI_API_KEY**
   - Find the `GEMINI_API_KEY` variable
   - Click "Edit" or the pencil icon
   - Replace the old value with:
     ```
     AIzaSyAQ.Ab8RN6J3GKUE-hGt93UcykLs3dOm2cUmxR1zSljRqR9znYg_rw
     ```
   - Click "Save"

5. **Update AI_MODEL_API_KEY (if present)**
   - Find the `AI_MODEL_API_KEY` variable
   - Click "Edit" or the pencil icon
   - Replace with the same new key:
     ```
     AIzaSyAQ.Ab8RN6J3GKUE-hGt93UcykLs3dOm2cUmxR1zSljRqR9znYg_rw
     ```
   - Click "Save"

6. **Save Changes**
   - Click "Save Changes" button at the bottom
   - Render will automatically redeploy your service

7. **Wait for Deployment**
   - Wait 5-10 minutes for the deployment to complete
   - Watch the deployment logs for any errors

## Verify Deployment

After deployment completes, test the backend:

```bash
# Test health endpoint
curl https://compawss-ai.onrender.com/health

# Expected response:
# {"status":"healthy","backend":"grounded"}
```

## Local Environment Updated

✅ Your local `backend/.env` file has been updated with the new key
✅ The key is protected by `.gitignore` and will NOT be pushed to GitHub

## What Happens Next

1. Render will detect the environment variable change
2. It will automatically redeploy your backend service
3. The new deployment will use the updated Gemini API key
4. Previous API errors should be resolved

## Troubleshooting

If you still see errors after updating:

1. **Check Render Logs**
   - Go to your service → "Logs" tab
   - Look for any API key errors

2. **Verify Key Format**
   - Make sure there are no extra spaces
   - Key should start with `AIzaSyAQ.`
   - No quotes around the key in Render

3. **Manual Redeploy**
   - If auto-deploy doesn't trigger
   - Click "Manual Deploy" → "Deploy latest commit"

## Security Note

🔒 This new API key is:
- ✅ Updated in local `backend/.env` (protected by .gitignore)
- ⏳ Needs to be updated in Render Environment Variables (manual step)
- ✅ NOT in GitHub repository
- ✅ NOT in any committed files

The old exposed key should be deleted from Google AI Studio after confirming the new key works.