# Compawss AI - Grounded Backend Implementation

## Overview

This is the **fully grounded** version of the Compawss AI backend that uses **REAL data sources** and **REAL AI models** instead of hardcoded fake responses.

## Key Differences from Original Backend

### ❌ Original Backend (`main.py`)
- Hardcoded fake responder data
- Demo AI fallback responses with "(DEMO AI)" labels
- No real data retrieval from external sources
- Fake tactical jargon in responses

### ✅ Grounded Backend (`main_grounded.py`)
- Real data from Google Places API (vets)
- Real data from Supabase (NGOs, rescue cases)
- Real AI reasoning via Gemini API
- Proper error handling when APIs unavailable
- No fake responses - returns errors if data missing

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Request                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (main_grounded.py)              │
├─────────────────────────────────────────────────────────────┤
│  1. Identify user intent                                     │
│  2. Fetch relevant data from sources                         │
│  3. Ground AI with real context                              │
│  4. Generate response using Gemini                           │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────┐ ┌──────────────┐
│ Google Places  │ │ Supabase │ │  Gemini API  │
│  (Vets/NGOs)   │ │ (Cases)  │ │ (AI Reason)  │
└────────────────┘ └──────────┘ └──────────────┘
```

## Data Retrieval Functions

### 1. `get_nearby_vets_from_google(lat, lng, radius)`
**Purpose:** Fetch real veterinary clinics from Google Places API

**Returns:**
```python
[
  {
    "id": "place_id_from_google",
    "name": "Real Clinic Name",
    "address": "Real Address",
    "rating": 4.5,
    "latitude": 19.0544,
    "longitude": 72.8402,
    "is_open": true
  }
]
```

**Requires:** `GOOGLE_PLACES_API_KEY` environment variable

**Behavior if missing:** Returns empty list, logs warning

---

### 2. `get_nearby_ngos_from_supabase(lat, lng, city)`
**Purpose:** Fetch real NGO data from Supabase database

**Returns:**
```python
[
  {
    "id": "ngo-123",
    "name": "Real NGO Name",
    "address": "Real Address",
    "contact": "+91 XXXXXXXXXX",
    "city": "Mumbai"
  }
]
```

**Requires:** `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables

**Behavior if missing:** Returns empty list, logs warning

---

### 3. `get_rescue_case_from_supabase(case_id)`
**Purpose:** Fetch specific rescue case details

**Returns:**
```python
{
  "id": "case-456",
  "animal_name": "Stray Dog",
  "species": "Dog",
  "status": "Reported",
  "location": "Bandra West",
  "latitude": 19.0544,
  "longitude": 72.8402
}
```

**Requires:** `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**Behavior if missing:** Returns None

---

### 4. `call_gemini_api(prompt, system_instruction, temperature)`
**Purpose:** Generic function to call Gemini API for text generation

**Returns:** String response or None if failed

**Requires:** `GEMINI_API_KEY` environment variable

**Behavior if missing:** Returns None, logs warning

---

## Endpoint Changes

### `/ai/analyze-image` ✅ Already Grounded
- Uses real Gemini Vision API
- Returns error if `GEMINI_API_KEY` missing
- No fake fallback responses
- Analyzes ONLY visible content

**Example Response:**
```json
{
  "species": "Canine / Dog",
  "confidence": 87.5,
  "severity": "Moderate",
  "anomalies": "Dog resting calmly on grass, no visible injuries",
  "tags": ["resting", "conscious", "outdoor"],
  "directives": [
    "Approach slowly and calmly",
    "Offer water if conscious",
    "Monitor for signs of distress"
  ],
  "is_hotspot": false
}
```

---

### `/ai/classify-report` ✅ Now Grounded
- **Primary:** Uses Gemini API for classification
- **Fallback:** Rule-based classification if API unavailable
- No hardcoded fake responses

**Example Request:**
```json
{
  "text": "Found injured dog near Salt Lake, bleeding from leg",
  "species_hint": "dog"
}
```

**Example Response:**
```json
{
  "classification": "Critical Trauma",
  "severity": "Critical",
  "tags": ["injury", "bleeding", "accident"],
  "confidence": 92.0,
  "estimated_count": 1
}
```

---

### `/ai/match-responders` ✅ Now Grounded
- **Primary:** Fetches real vets from Google Places API
- **Secondary:** Fetches real NGOs from Supabase
- Returns error if no data sources configured
- No fake hardcoded responders

**Example Request:**
```json
{
  "latitude": 19.0544,
  "longitude": 72.8402,
  "severity": "Critical",
  "species": "dog"
}
```

**Example Response (with real data):**
```json
{
  "incident_coordinates": {"lat": 19.0544, "lng": 72.8402},
  "matched_responders": [
    {
      "id": "ChIJ...",
      "name": "Pet Care Veterinary Clinic",
      "type": "Veterinary Hospital",
      "phone": "Contact via Google Maps",
      "distance_km": 1.2,
      "status": "Available",
      "estimated_arrival_minutes": 10
    }
  ],
  "ambulance_allocated": true
}
```

**Example Response (no data sources):**
```json
{
  "detail": "No data sources configured. Please set GOOGLE_PLACES_API_KEY or SUPABASE_URL."
}
```

---

### `/ai/chat` ✅ Now Fully Grounded
- **NO hardcoded fake responses**
- Uses Gemini API with real context
- Grounded with actual vet/NGO data from context
- Returns error if `GEMINI_API_KEY` missing

**System Instruction:**
```
You are Compawss AI, an animal rescue assistant for India.

CRITICAL RULES:
1. Keep responses CONCISE (2-4 sentences max)
2. Use ONLY the data provided in context
3. DO NOT invent clinic names, phone numbers, or addresses
4. If data is missing, clearly state 'Data not available'
5. No fake tactical jargon

CURRENT CONTEXT:
Location: Bandra West, Mumbai
Active Case: case-123 (Dog, Reported)
Nearby Vets:
• Pet Care Clinic - 1.2 km, Phone: +91 XXXXXXXXXX
Nearby NGOs:
• Animal Rescue Mumbai - Address: XYZ, Phone: +91 XXXXXXXXXX
```

**Example User Query:**
```
"What should I do for injured dog with bleeding leg?"
```

**Example Response:**
```
For a dog with leg bleeding:
1. Apply clean gauze with gentle pressure to stop bleeding
2. Keep the dog calm and warm
3. Contact Pet Care Clinic (1.2 km away, +91 XXXXXXXXXX) immediately for emergency care

Do not force-feed or give water if the dog is unconscious.
```

---

### `/ai/recommend-action` ✅ Now Grounded
- **Primary:** Uses Gemini API for recommendations
- **Fallback:** Rule-based recommendations if API unavailable
- No fake tactical jargon

---

### `/ai/translate-guidance` ✅ Now Grounded
- **Primary:** Uses Gemini API for translation
- **Fallback:** Simple language tag if API unavailable
- Supports: Hindi, Bengali, Tamil, Telugu

---

## Environment Variables Required

### Essential (Backend won't work without these)
```bash
# Gemini API Key - Required for ALL AI features
GEMINI_API_KEY="your_actual_gemini_api_key_here"
```

### Optional (Features degrade gracefully if missing)
```bash
# Google Places API - For real vet/clinic data
GOOGLE_PLACES_API_KEY="your_google_places_api_key"

# Supabase - For NGO and rescue case data
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"

# Demo Mode - Set to "true" to allow fallback responses
DEMO_MODE="false"
```

---

## Guardrails

### 1. Missing API Keys
```python
if not GEMINI_API_KEY or GEMINI_API_KEY == "MY_GEMINI_API_KEY":
    raise HTTPException(
        status_code=503,
        detail="AI model not configured. Please set GEMINI_API_KEY."
    )
```

### 2. No Data Sources
```python
if not matched_responders:
    if not GOOGLE_PLACES_API_KEY and not SUPABASE_URL:
        raise HTTPException(
            status_code=503,
            detail="No data sources configured."
        )
```

### 3. API Failures
```python
try:
    response = await call_gemini_api(prompt)
    if not response:
        return ChatResponse(
            response="AI service temporarily unavailable.",
            is_live=False
        )
except Exception as e:
    print(f"API error: {e}")
    raise HTTPException(status_code=502, detail="AI service error")
```

### 4. Demo Mode
```python
# Only allowed when explicitly enabled
if DEMO_MODE:
    # Allow fallback responses
else:
    # Strict mode: return errors if real data unavailable
```

---

## Testing Locally

### 1. Set up environment variables
```bash
# Create .env file in backend directory
cp .env.example .env

# Edit .env and add your API keys
GEMINI_API_KEY="your_key_here"
GOOGLE_PLACES_API_KEY="your_key_here"
SUPABASE_URL="your_url_here"
SUPABASE_ANON_KEY="your_key_here"
```

### 2. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Run the grounded backend
```bash
# Replace main.py with main_grounded.py
mv main.py main_old.py
mv main_grounded.py main.py

# Run the server
python main.py
```

### 4. Test endpoints

#### Test health check
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "api_keys_configured": {
    "gemini": true,
    "google_places": true,
    "supabase": true
  },
  "demo_mode": false
}
```

#### Test image analysis
```bash
curl -X POST http://localhost:8000/ai/analyze-image \
  -H "Content-Type: application/json" \
  -d '{
    "image_b64": "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
    "species_hint": "dog"
  }'
```

#### Test chat (with context)
```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"sender": "user", "text": "What should I do for injured stray cat?"}
    ],
    "context": {
      "userLocationName": "Bandra West, Mumbai"
    }
  }'
```

#### Test nearby vets
```bash
curl -X POST http://localhost:8000/ai/match-responders \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 19.0544,
    "longitude": 72.8402,
    "severity": "Critical",
    "species": "dog"
  }'
```

---

## Migration from Old Backend

### Step 1: Backup old backend
```bash
mv backend/main.py backend/main_old.py
```

### Step 2: Use grounded backend
```bash
mv backend/main_grounded.py backend/main.py
```

### Step 3: Update requirements.txt
```bash
# Add if not present
httpx>=0.24.0
```

### Step 4: Set environment variables
```bash
# Add to .env or Render environment
GEMINI_API_KEY="your_key"
GOOGLE_PLACES_API_KEY="your_key"
SUPABASE_URL="your_url"
SUPABASE_ANON_KEY="your_key"
```

### Step 5: Deploy
```bash
git add backend/main.py
git commit -m "feat: implement fully grounded AI backend with real data sources"
git push origin main
```

---

## What's Different?

| Feature | Old Backend | Grounded Backend |
|---------|-------------|------------------|
| **Chat Responses** | Hardcoded "(DEMO AI)" text | Real Gemini API with context |
| **Vet Data** | Fake hardcoded clinics | Real Google Places API |
| **NGO Data** | Fake hardcoded NGOs | Real Supabase database |
| **Image Analysis** | ✅ Already real | ✅ Still real |
| **Missing API Keys** | Silent fallback to fake data | Clear error messages |
| **No Data Found** | Returns fake data anyway | Returns empty or error |
| **Tactical Jargon** | Excessive fake military terms | Concise, professional language |

---

## API Keys Setup Guide

### 1. Gemini API Key (Required)
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key
4. Set as `GEMINI_API_KEY` environment variable

### 2. Google Places API Key (Optional)
1. Go to https://console.cloud.google.com/
2. Enable "Places API"
3. Create credentials → API Key
4. Set as `GOOGLE_PLACES_API_KEY` environment variable

### 3. Supabase (Optional)
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Go to Settings → API
4. Copy URL and anon key
5. Set as `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## Troubleshooting

### "AI model not configured" error
**Cause:** `GEMINI_API_KEY` is missing or invalid

**Solution:**
```bash
export GEMINI_API_KEY="your_actual_key_here"
```

### "No data sources configured" error
**Cause:** Neither Google Places nor Supabase is configured

**Solution:** Set at least one:
```bash
export GOOGLE_PLACES_API_KEY="your_key"
# OR
export SUPABASE_URL="your_url"
export SUPABASE_ANON_KEY="your_key"
```

### Empty responder list
**Cause:** APIs configured but no results found in area

**Solution:** This is expected behavior - no fake data returned

### Chat responses are generic
**Cause:** Context data (vets, NGOs) not being passed from frontend

**Solution:** Ensure frontend sends full context in chat requests

---

## Summary

✅ **Real AI grounding** - All responses use Gemini API with real context
✅ **Real data sources** - Google Places for vets, Supabase for NGOs/cases
✅ **No fake responses** - Returns errors when data unavailable
✅ **Proper guardrails** - Clear error messages for missing API keys
✅ **Concise responses** - No bloated tactical jargon
✅ **Graceful degradation** - Falls back to rule-based logic when AI unavailable

🚫 **No hardcoded fake data**
🚫 **No "(DEMO AI)" labels**
🚫 **No invented clinic names or phone numbers**
🚫 **No silent fallbacks to fake responses**