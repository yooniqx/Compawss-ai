# Render Configuration - Complete Fix Guide

## Current Configuration (WRONG)

Based on your screenshots, here's what's currently set:

| Setting | Current Value | Status |
|---------|---------------|--------|
| Root Directory | `backend` | ❌ WRONG |
| Build Command | `backend/ $ pip install -r requirements.txt` | ❌ WRONG |
| Start Command | `backend/ $ cd backend && python main_grounded.py` | ❌ WRONG |

## Problem

When Root Directory is set to `backend`, Render is already inside the backend folder. So:
- Build command tries to find `backend/requirements.txt` (doesn't exist)
- Start command tries to `cd backend` again (double nesting)

## Solution: TWO OPTIONS

### Option 1: Keep Root Directory as `backend` (RECOMMENDED)

**Settings to Change**:

1. **Root Directory**: `backend` (keep as-is)
2. **Build Command**: 
   ```bash
   pip install -r requirements.txt
   ```
   (Remove `backend/` prefix)

3. **Start Command**:
   ```bash
   python main_grounded.py
   ```
   (Remove `cd backend &&` since we're already in backend/)

### Option 2: Use Project Root

**Settings to Change**:

1. **Root Directory**: `.` (change from `backend` to `.`)
2. **Build Command**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Start Command**:
   ```bash
   cd backend && python main_grounded.py
   ```

---

## Step-by-Step Fix (Option 1 - Recommended)

### 1. Fix Build Command

1. Go to **Settings** → **Build** tab
2. Find **Build Command** field
3. **Change from**: `backend/ $ pip install -r requirements.txt`
4. **Change to**: `pip install -r requirements.txt`
5. Click **Save Changes**

### 2. Fix Start Command

1. Stay in **Settings** → Go to **Deploy** tab
2. Find **Start Command** field
3. **Change from**: `backend/ $ cd backend && python main_grounded.py`
4. **Change to**: `python main_grounded.py`
5. Click **Save Changes**

### 3. Verify Root Directory

1. Go to **Settings** → **Build** tab
2. Find **Root Directory** field
3. **Should be**: `backend`
4. If not, change it to `backend`

### 4. Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait 2-5 minutes
3. Check logs for success

---

## Expected Render Configuration (Final)

| Setting | Value |
|---------|-------|
| **Source** | https://github.com/yooniqx/Compawss-ai |
| **Branch** | main |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `python main_grounded.py` |
| **Auto-Deploy** | On Commit |

---

## Verify Deployment Success

After deployment completes, test:

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

**If you see `"backend": "grounded"`** → ✅ SUCCESS!

---

## Environment Variables Checklist

Make sure these are set in **Settings** → **Environment**:

### Required
- [x] `GEMINI_API_KEY`
- [x] `SUPABASE_URL`
- [x] `SUPABASE_ANON_KEY`

### Recommended
- [ ] `GOOGLE_PLACES_API_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NGO_DIRECTORY_API_URL`
- [ ] `DEMO_MODE=false`
- [ ] `PORT=8000`

---

## Common Errors & Solutions

### Error: "No module named 'fastapi'"
**Cause**: Build command not finding requirements.txt  
**Fix**: Ensure Build Command is `pip install -r requirements.txt` (no `backend/` prefix)

### Error: "can't open file 'main_grounded.py'"
**Cause**: Start command looking in wrong directory  
**Fix**: Ensure Start Command is `python main_grounded.py` (no `cd backend &&`)

### Error: "No such file or directory: requirements.txt"
**Cause**: Root Directory is wrong  
**Fix**: Set Root Directory to `backend`

---

## Quick Reference Card

```
┌─────────────────────────────────────────┐
│  RENDER CONFIGURATION (CORRECT)         │
├─────────────────────────────────────────┤
│  Root Directory:  backend               │
│  Build Command:   pip install -r        │
│                   requirements.txt      │
│  Start Command:   python                │
│                   main_grounded.py      │
└─────────────────────────────────────────┘
```

---

## After Successful Deployment

1. **Update Frontend** `.env.local`:
   ```
   VITE_AI_BACKEND_URL="https://compawss-ai.onrender.com"
   ```

2. **Test Production**:
   - Open http://localhost:3000
   - Try AI chat
   - Should work without timeout!

---

**Created**: 2026-05-29  
**Status**: Ready to apply  
**Priority**: HIGH - Fix these settings now!