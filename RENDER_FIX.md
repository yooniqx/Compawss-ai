# Render Deployment Fix - URGENT

## Error Found
```
python: can't open file '/opt/render/project/src/backend/main_grounded.py'
```

## Root Cause
The start command is trying to run `python main_grounded.py` but Render's working directory is `/opt/render/project/src/`, not `/opt/render/project/src/backend/`.

## Solution

### Option 1: Update Start Command (RECOMMENDED)
Go to Render Dashboard → Settings → Start Command

**Change to**:
```bash
cd backend && python main_grounded.py
```

OR

```bash
python backend/main_grounded.py
```

### Option 2: Use Uvicorn with Module Path
```bash
cd backend && uvicorn main_grounded:app --host 0.0.0.0 --port $PORT
```

OR

```bash
uvicorn backend.main_grounded:app --host 0.0.0.0 --port $PORT
```

## Step-by-Step Fix

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select**: compawss-ai service
3. **Click**: Settings (left sidebar)
4. **Scroll to**: Build & Deploy section
5. **Find**: Start Command field
6. **Enter ONE of these**:
   - `cd backend && python main_grounded.py` (simplest)
   - `python backend/main_grounded.py` (alternative)
   - `cd backend && uvicorn main_grounded:app --host 0.0.0.0 --port $PORT` (production-ready)
7. **Click**: Save Changes
8. **Click**: Manual Deploy → Deploy latest commit

## Verify After Deployment

Test the health endpoint:
```bash
curl https://compawss-ai.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "backend": "grounded",
  "gemini_configured": true
}
```

## If Still Fails

Check these in Render:
1. **Environment Variables**: Ensure `GEMINI_API_KEY` is set
2. **Build Command**: Should be `pip install -r backend/requirements.txt`
3. **Root Directory**: Should be `.` (project root)
4. **Logs**: Check for other errors after fixing start command

## Quick Reference

| Setting | Value |
|---------|-------|
| Build Command | `pip install -r backend/requirements.txt` |
| Start Command | `cd backend && python main_grounded.py` |
| Root Directory | `.` |
| Environment | Add all keys from backend/.env |