# Google Places API - REQUEST_DENIED Error Fix

## Problem Identified

**Error**: `REQUEST_DENIED: API keys with referer restrictions cannot be used with this API.`

**Root Cause**: The Google Places API key (`AIzaSyDIaI97Nhzc77BrSiBEOxbGjsKUY3CFIts`) has **HTTP referer restrictions** configured in Google Cloud Console. These restrictions only allow requests from specific domains (like `localhost:3000` or frontend domains).

Backend API calls from Python/FastAPI are **blocked** because:
1. Server-side requests don't have HTTP referer headers
2. The API key is configured to only accept requests with specific referer headers
3. Google Places API Text Search requires an unrestricted key for backend use

## Solution Options

### Option 1: Remove Referer Restrictions (Recommended for Development)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find the API key: `AIzaSyDIaI97Nhzc77BrSiBEOxbGjsKUY3CFIts`
3. Click "Edit"
4. Under "Application restrictions", select **"None"**
5. Click "Save"

**Note**: This makes the key less secure. For production, use Option 2 or 3.

### Option 2: Add IP Address Restrictions (Recommended for Production)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find the API key
3. Click "Edit"
4. Under "Application restrictions", select **"IP addresses"**
5. Add your Render backend IP address
6. Add your local development IP (for testing)
7. Click "Save"

### Option 3: Create Separate API Keys (Best Practice)
1. Create **two separate API keys**:
   - **Frontend Key**: With HTTP referer restrictions for browser use
   - **Backend Key**: With IP restrictions or no restrictions for server use

2. Update environment variables:
   ```env
   # Frontend key (with referer restrictions)
   GOOGLE_MAPS_PLATFORM_KEY=AIzaSy...frontend_key
   
   # Backend key (unrestricted or IP-restricted)
   GOOGLE_PLACES_API_KEY=AIzaSy...backend_key
   ```

## Current Status

- ✅ API key loading fixed in `places_service.py`
- ✅ Comprehensive logging added
- ✅ Error properly identified and logged
- ❌ API key restrictions prevent backend calls
- ⏳ Waiting for API key configuration update

## Testing After Fix

Once the API key is updated, test with:

```bash
# Test locally
curl "http://localhost:8000/debug/places?query=veterinary+clinic+Mumbai"

# Test on Render
curl "https://compawss-ai.onrender.com/debug/places?query=veterinary+clinic+Mumbai"
```

Expected response:
```json
{
  "status": "success",
  "results_count": 10,
  "results": [
    {
      "name": "ABC Veterinary Clinic",
      "address": "123 Main St, Mumbai...",
      "rating": 4.5
    }
  ]
}
```

## Files Modified

1. `backend/places_service.py` - Added `.env` loading with proper path resolution
2. `backend/main_grounded.py` - Enhanced logging in chat endpoint
3. `backend/main_grounded.py` - Added `/debug/google-status` endpoint

## Next Steps

1. Update Google Cloud Console API key restrictions
2. Test `/debug/places` endpoint
3. Test `/ai/chat` with location queries
4. Verify frontend receives real data