# 🧪 Compawss AI - Local Testing Guide

## Prerequisites

Before testing, ensure you have:
- ✅ Python 3.8+ installed
- ✅ Node.js 16+ installed
- ✅ Gemini API key (get from https://aistudio.google.com/app/apikey)

---

## Step 1: Set Up Backend Environment

### 1.1 Navigate to backend directory
```bash
cd backend
```

### 1.2 Create .env file
```bash
# Copy the example file
copy .env.example .env

# Or on Mac/Linux:
cp .env.example .env
```

### 1.3 Edit .env file and add your Gemini API key
Open `backend/.env` in a text editor and replace:
```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

With your actual key:
```
GEMINI_API_KEY="AIzaSyD..."
```

**IMPORTANT:** Keep the quotes around the key!

### 1.4 Install Python dependencies
```bash
pip install -r requirements.txt
```

Expected output:
```
Successfully installed fastapi-0.100.0 uvicorn-0.20.0 pydantic-2.0.0 httpx-0.24.0 ...
```

---

## Step 2: Replace Backend with Grounded Version

### 2.1 Backup original backend
```bash
# Windows
move main.py main_old.py
move main_grounded.py main.py

# Mac/Linux
mv main.py main_old.py
mv main_grounded.py main.py
```

### 2.2 Verify the replacement
```bash
# Check that main.py now has the grounded version
# Look for "get_nearby_vets_from_google" function
```

---

## Step 3: Start the Backend

### 3.1 Run the backend server
```bash
python main.py
```

Expected output:
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 3.2 Keep this terminal open
The backend must stay running for all tests.

---

## Step 4: Run Automated Tests

### 4.1 Open a NEW terminal (keep backend running)

### 4.2 Navigate to backend directory
```bash
cd backend
```

### 4.3 Run the test script
```bash
python test_grounded_backend.py
```

### 4.4 Review test results

Expected output if Gemini API key is configured:
```
================================================================================
  COMPAWSS AI - GROUNDED BACKEND TEST SUITE
================================================================================

Testing backend at: http://localhost:8000

================================================================================
  TEST 1: Health Check
================================================================================
Status: healthy
API Keys Configured: {
  "gemini": true,
  "google_places": false,
  "supabase": false
}
Demo Mode: false

✅ PASS - Health Check
  Details: Backend is healthy and Gemini API is configured

================================================================================
  TEST 2: Image Analysis (with API key)
================================================================================
Species: Canine / Dog
Confidence: 87.5
Severity: Moderate
Anomalies: Dog resting calmly on grass, no visible injuries...
Tags: ['resting', 'conscious', 'outdoor']

✅ PASS - Image Analysis
  Details: Real Gemini Vision analysis (no fake vitals)

... (more tests)

================================================================================
  TEST SUMMARY
================================================================================

Total Tests: 7
✅ Passed: 7
❌ Failed: 0
Pass Rate: 100.0%

🎉 ALL TESTS PASSED! Backend is working correctly.
```

---

## Step 5: Manual Testing with Frontend

### 5.1 Update frontend to use local backend

Edit `.env.local` in the root directory:
```bash
# Change from:
VITE_AI_BACKEND_URL="https://compawss-ai.onrender.com"

# To:
VITE_AI_BACKEND_URL="http://localhost:8000"
```

### 5.2 Restart frontend dev server
```bash
# Stop the current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### 5.3 Open the app in browser
```
http://localhost:5173
```

---

## Step 6: Test Frontend Features

### 6.1 Test Image Analysis
1. Navigate to "Report Incident" page
2. Upload a real animal photo
3. Click "Analyze Image"
4. **Verify:**
   - ✅ Analysis completes successfully
   - ✅ NO fake vitals (BPM, temperature) in results
   - ✅ Analysis describes only visible content
   - ✅ Severity is appropriate

### 6.2 Test Chat Assistant
1. Navigate to "AI Assistant" page
2. Ask: "What should I do for injured dog with bleeding leg?"
3. **Verify:**
   - ✅ Response is concise (2-4 sentences)
   - ✅ NO "(DEMO AI)" label in response
   - ✅ Response is actionable and helpful
   - ✅ NO fake tactical jargon

### 6.3 Test Voice Recording
1. Navigate to "Report Incident" page
2. Click microphone button
3. Grant microphone permission
4. Speak: "I found an injured dog near the park"
5. Stop recording
6. **Verify:**
   - ✅ Real audio is recorded
   - ✅ Transcription appears (or fallback message)
   - ✅ NO fake preset transcription

### 6.4 Test GPS Location
1. Navigate to "Report Incident" page
2. Click "Request GPS Permission"
3. Grant location permission
4. **Verify:**
   - ✅ Real coordinates appear
   - ✅ NO fake hardcoded coordinates
   - ✅ Location name is accurate

### 6.5 Test Map Page
1. Navigate to "Rescue Command" (map page)
2. **Verify:**
   - ✅ NO fake "Sector 7G" alert appears
   - ✅ Empty state shows clear message
   - ✅ NO infinite "Fetching..." loading

---

## Step 7: Test Error Handling

### 7.1 Test without Gemini API key

1. Stop the backend (Ctrl+C)
2. Edit `backend/.env` and remove the Gemini API key:
   ```
   GEMINI_API_KEY=""
   ```
3. Restart backend: `python main.py`
4. Try image analysis in frontend
5. **Verify:**
   - ✅ Clear error message: "AI model not configured"
   - ✅ NO fake fallback response
   - ✅ User is informed to set API key

### 7.2 Test with invalid API key

1. Edit `backend/.env` with fake key:
   ```
   GEMINI_API_KEY="invalid_key_12345"
   ```
2. Restart backend
3. Try image analysis
4. **Verify:**
   - ✅ Error message about API failure
   - ✅ NO fake fallback response

---

## Step 8: Test Real Data Sources (Optional)

### 8.1 Test Google Places API (if you have the key)

1. Get Google Places API key from https://console.cloud.google.com/
2. Add to `backend/.env`:
   ```
   GOOGLE_PLACES_API_KEY="your_google_places_key"
   ```
3. Restart backend
4. Test "Match Responders" endpoint:
   ```bash
   curl -X POST http://localhost:8000/ai/match-responders \
     -H "Content-Type: application/json" \
     -d '{"latitude": 19.0544, "longitude": 72.8402, "severity": "Critical"}'
   ```
5. **Verify:**
   - ✅ Returns real veterinary clinics from Google Places
   - ✅ NO fake "Crown Veterinary Emergency Surge Post"

### 8.2 Test Supabase (if you have it configured)

1. Get Supabase credentials from https://supabase.com/dashboard
2. Add to `backend/.env`:
   ```
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="your_anon_key"
   ```
3. Restart backend
4. Test NGO retrieval
5. **Verify:**
   - ✅ Returns real NGO data from database
   - ✅ NO fake hardcoded NGOs

---

## Common Issues & Solutions

### Issue 1: "Cannot connect to backend"
**Solution:**
- Make sure backend is running: `python main.py`
- Check if port 8000 is available
- Try: `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)

### Issue 2: "AI model not configured"
**Solution:**
- Check `backend/.env` file exists
- Verify `GEMINI_API_KEY` is set correctly
- Make sure quotes are around the key
- Restart backend after changing .env

### Issue 3: "Module not found" errors
**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Issue 4: Frontend still shows fake data
**Solution:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check `.env.local` has `VITE_AI_BACKEND_URL="http://localhost:8000"`
- Restart frontend dev server: `npm run dev`

### Issue 5: CORS errors in browser console
**Solution:**
- Backend already has CORS enabled for all origins
- If still seeing errors, restart backend

---

## Success Criteria Checklist

After testing, verify:

### Backend Tests
- [ ] ✅ Health check returns API key status
- [ ] ✅ Image analysis uses real Gemini Vision
- [ ] ✅ NO fake vitals (BPM, temperature) in responses
- [ ] ✅ Chat responses are concise (2-4 sentences)
- [ ] ✅ NO "(DEMO AI)" labels anywhere
- [ ] ✅ Error messages when API keys missing
- [ ] ✅ NO fake hardcoded responder data

### Frontend Tests
- [ ] ✅ Real microphone recording works
- [ ] ✅ Real GPS location works
- [ ] ✅ NO fake preset transcriptions
- [ ] ✅ NO fake default images
- [ ] ✅ NO fake "Sector 7G" alerts
- [ ] ✅ Clear empty states (no infinite loading)

### Integration Tests
- [ ] ✅ Frontend connects to local backend
- [ ] ✅ Image upload and analysis works end-to-end
- [ ] ✅ Chat assistant provides helpful responses
- [ ] ✅ All features handle missing API keys gracefully

---

## Next Steps After Testing

### If All Tests Pass ✅
1. Document any issues found
2. Prepare for production deployment
3. Update Render environment variables
4. Deploy grounded backend to production

### If Tests Fail ❌
1. Review error messages carefully
2. Check API key configuration
3. Verify all dependencies installed
4. Review backend logs for errors
5. Report issues with specific error messages

---

## Getting Help

If you encounter issues:

1. **Check backend logs** - Look for error messages in the terminal running `python main.py`
2. **Check browser console** - Press F12 and look for errors
3. **Review documentation** - See `backend/README_GROUNDED.md` for detailed info
4. **Test individual endpoints** - Use the test script to isolate issues

---

## Summary

This testing guide ensures:
- ✅ Backend uses real AI models (no fake responses)
- ✅ Frontend uses real user input (no fake data)
- ✅ Proper error handling when APIs unavailable
- ✅ All features work end-to-end
- ✅ No hardcoded fake data anywhere

**Ready for production deployment once all tests pass!**