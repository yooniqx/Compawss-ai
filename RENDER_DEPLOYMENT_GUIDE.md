# Render Deployment Guide - Grounded Backend
**Date**: 2026-05-29  
**Objective**: Deploy the new grounded backend to Render

---

## 🚨 CRITICAL: Update Required

Your production backend is currently running the **OLD** `main.py` which has hardcoded fake responses. You need to switch to the **NEW** `main_grounded.py` which uses real AI and data retrieval.

---

## 📋 Step-by-Step Deployment Instructions

### Step 1: Update Start Command in Render

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `compawss-ai` service
3. Click **Settings** (left sidebar)
4. Scroll to **Build & Deploy** section
5. Find **Start Command** field
6. **Change from**: `python main.py` or `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. **Change to**: `python main_grounded.py`
8. Click **Save Changes**

---

### Step 2: Add Environment Variables in Render

Go to **Environment** section in Render dashboard and add these variables:

#### Required Variables (MUST HAVE)
```
GEMINI_API_KEY=AIzaSyA6AXIwVGXIZa_6kDHOZUzYXpN0AwACSQE
SUPABASE_URL=https://tyfjhhmeselaqfznvwjv.supabase.co
SUPABASE_ANON_KEY=sb_publishable_hf2BxqWkes3uNyp7UnBfNw_D7VVJcUh
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZmpoaG1lc2VsYXFmem52d2p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTgyNzAxOSwiZXhwIjoyMDk1NDAzMDE5fQ.t0KZOskRKvNLRN9od-xic0ZGuNRcg6K7dL5hXtveplY
```

#### Recommended Variables
```
GOOGLE_PLACES_API_KEY=AIzaSyDIaI97Nhzc77BrSiBEOxbGjsKUY3CFIts
NGO_DIRECTORY_API_URL=https://tyfjhhmeselaqfznvwjv.supabase.co/rest/v1/ngos
DEMO_MODE=false
PORT=8000
```

#### Optional Variables
```
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com
AI_MODEL_API_KEY=AIzaSyA6AXIwVGXIZa_6kDHOZUzYXpN0AwACSQE
```

---

### Step 3: Trigger Deployment

After updating the start command and environment variables:

1. Click **Manual Deploy** → **Deploy latest commit**
2. Or push a new commit to trigger auto-deploy
3. Wait for deployment to complete (usually 2-5 minutes)

---

### Step 4: Verify Deployment

Once deployed, test these endpoints:

#### 1. Health Check
```bash
curl https://compawss-ai.onrender.com/health
```
**Expected Response**:
```json
{
  "status": "healthy",
  "backend": "grounded",
  "gemini_configured": true,
  "supabase_configured": true
}
```

#### 2. Test Chat Endpoint
```bash
curl -X POST https://compawss-ai.onrender.com/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "history": []}'
```
**Expected**: Real AI response (not "(DEMO AI)" text)

#### 3. Test Image Analysis
```bash
curl -X POST https://compawss-ai.onrender.com/ai/analyze-image \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/dog.jpg", "species": "dog"}'
```
**Expected**: Real Gemini API analysis

---

## 🔍 Troubleshooting

### Issue: Deployment Fails

**Check Render Logs**:
1. Go to **Logs** tab in Render dashboard
2. Look for error messages
3. Common issues:
   - Missing `GEMINI_API_KEY` → Add in Environment section
   - Import errors → Check `requirements.txt` has all dependencies
   - Port binding errors → Ensure `PORT=8000` is set

### Issue: Backend Returns 503 Errors

**Cause**: Missing API keys

**Solution**:
1. Check Render Environment variables
2. Ensure `GEMINI_API_KEY` is set correctly
3. Redeploy after adding keys

### Issue: Chat Still Times Out

**Possible Causes**:
1. Old backend still running → Force redeploy
2. Frontend pointing to wrong URL → Check `.env.local` has correct `VITE_AI_BACKEND_URL`
3. CORS issues → Add your frontend domain to `CORS_ORIGINS`

---

## 📊 Comparison: Old vs New Backend

| Feature | Old (main.py) | New (main_grounded.py) |
|---------|---------------|------------------------|
| AI Responses | Hardcoded fake | Real Gemini API |
| Vet Data | Fake list | Google Places API |
| NGO Data | Fake list | Supabase database |
| Image Analysis | Fake analysis | Real Gemini Vision |
| Error Handling | Returns fake data | Returns proper errors |
| API Keys Required | None | GEMINI_API_KEY (required) |

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] Health endpoint returns `"backend": "grounded"`
- [ ] Chat endpoint returns real AI responses (no "(DEMO AI)" text)
- [ ] Image analysis uses real Gemini API
- [ ] Vet search uses Google Places API (if key provided)
- [ ] NGO search uses Supabase database
- [ ] Frontend connects successfully (no timeout errors)
- [ ] All environment variables are set in Render
- [ ] Logs show no API key errors

---

## 🚀 Quick Deploy Commands

If you prefer command-line deployment:

```bash
# 1. Ensure you're in the project root
cd c:/DEBOPRIYA/Compawss-ai

# 2. Commit the new backend
git add backend/main_grounded.py backend/.env.example
git commit -m "Deploy grounded backend with real AI"

# 3. Push to trigger auto-deploy
git push origin main
```

---

## 📝 Important Notes

1. **Start Command**: MUST be `python main_grounded.py` (not `main.py`)
2. **GEMINI_API_KEY**: REQUIRED - backend won't work without it
3. **CORS**: Add your frontend domain to `CORS_ORIGINS` if deployed
4. **Logs**: Monitor Render logs during first deployment
5. **Testing**: Test all endpoints after deployment before using in production

---

## 🆘 Need Help?

If deployment fails:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure `requirements.txt` includes all dependencies
4. Test backend locally first: `cd backend && python main_grounded.py`

---

**Deployment Guide Created**: 2026-05-29  
**Status**: Ready for deployment  
**Next Step**: Update Render start command to `python main_grounded.py`