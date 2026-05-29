import os
import base64
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx

app = FastAPI(
    title="Compawss AI Emergency Dispatch Backend",
    description="Python microservice supplying advanced triage, computer vision, and linguistic services for stray animal rescue operations in India.",
    version="2.0.0"
)

# Enable CORS for direct front-end calls from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# CONFIGURATION & ENVIRONMENT VARIABLES
# =============================================================================

def get_env_var(key: str, default: str = "") -> str:
    """Get environment variable and clean it."""
    value = os.environ.get(key, default)
    return value.strip().replace('"', '').replace("'", "")

GEMINI_API_KEY = get_env_var("GEMINI_API_KEY")
GOOGLE_MAPS_API_KEY = get_env_var("GOOGLE_MAPS_PLATFORM_KEY")
GOOGLE_PLACES_API_KEY = get_env_var("GOOGLE_PLACES_API_KEY", GOOGLE_MAPS_API_KEY)
SUPABASE_URL = get_env_var("SUPABASE_URL")
SUPABASE_ANON_KEY = get_env_var("SUPABASE_ANON_KEY")
DEMO_MODE = get_env_var("DEMO_MODE", "false").lower() == "true"

# =============================================================================
# DATA RETRIEVAL FUNCTIONS
# =============================================================================

async def get_nearby_vets_from_google(latitude: float, longitude: float, radius_meters: int = 5000) -> List[Dict[str, Any]]:
    """
    Fetch real veterinary clinics from Google Places API.
    Returns empty list if API key is missing or request fails.
    """
    if not GOOGLE_PLACES_API_KEY or GOOGLE_PLACES_API_KEY == "MY_GOOGLE_PLACES_API_KEY":
        print("[get_nearby_vets_from_google] Google Places API key not configured")
        return []
    
    try:
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{latitude},{longitude}",
            "radius": radius_meters,
            "type": "veterinary_care",
            "key": GOOGLE_PLACES_API_KEY
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                
                vets = []
                for place in results[:10]:  # Limit to 10 results
                    vet = {
                        "id": place.get("place_id", ""),
                        "name": place.get("name", "Veterinary Clinic"),
                        "address": place.get("vicinity", "Address not available"),
                        "rating": place.get("rating", 0.0),
                        "latitude": place.get("geometry", {}).get("location", {}).get("lat", latitude),
                        "longitude": place.get("geometry", {}).get("location", {}).get("lng", longitude),
                        "is_open": place.get("opening_hours", {}).get("open_now", None)
                    }
                    vets.append(vet)
                
                print(f"[get_nearby_vets_from_google] Found {len(vets)} vets near ({latitude}, {longitude})")
                return vets
            else:
                print(f"[get_nearby_vets_from_google] Google Places API error: {response.status_code}")
                return []
                
    except Exception as e:
        print(f"[get_nearby_vets_from_google] Exception: {e}")
        return []

async def get_nearby_ngos_from_supabase(latitude: float, longitude: float, city: str = "") -> List[Dict[str, Any]]:
    """
    Fetch real NGO data from Supabase.
    Returns empty list if Supabase is not configured or request fails.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("[get_nearby_ngos_from_supabase] Supabase not configured")
        return []
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/ngos"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json"
        }
        
        # Query with optional city filter
        params = {"select": "*"}
        if city:
            params["city"] = f"eq.{city}"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=10.0)
            
            if response.status_code == 200:
                ngos = response.json()
                print(f"[get_nearby_ngos_from_supabase] Found {len(ngos)} NGOs")
                return ngos
            else:
                print(f"[get_nearby_ngos_from_supabase] Supabase error: {response.status_code}")
                return []
                
    except Exception as e:
        print(f"[get_nearby_ngos_from_supabase] Exception: {e}")
        return []

async def get_rescue_case_from_supabase(case_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch specific rescue case from Supabase.
    Returns None if not found or Supabase not configured.
    """
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("[get_rescue_case_from_supabase] Supabase not configured")
        return None
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/rescue_cases"
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json"
        }
        params = {"id": f"eq.{case_id}", "select": "*"}
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=10.0)
            
            if response.status_code == 200:
                cases = response.json()
                if cases and len(cases) > 0:
                    print(f"[get_rescue_case_from_supabase] Found case {case_id}")
                    return cases[0]
                else:
                    print(f"[get_rescue_case_from_supabase] Case {case_id} not found")
                    return None
            else:
                print(f"[get_rescue_case_from_supabase] Supabase error: {response.status_code}")
                return None
                
    except Exception as e:
        print(f"[get_rescue_case_from_supabase] Exception: {e}")
        return None

async def call_gemini_api(prompt: str, system_instruction: Optional[str] = None, temperature: float = 0.3) -> Optional[str]:
    """
    Generic function to call Gemini API with text prompt.
    Returns None if API key is missing or request fails.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "MY_GEMINI_API_KEY":
        print("[call_gemini_api] Gemini API key not configured")
        return None
    
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "compawss-ai-backend"
        }
        
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature
            }
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        text = parts[0].get("text", "")
                        return text
                return None
            else:
                print(f"[call_gemini_api] Gemini API error: {response.status_code} - {response.text}")
                return None
                
    except Exception as e:
        print(f"[call_gemini_api] Exception: {e}")
        return None

# =============================================================================
# REQUEST / RESPONSE SCHEMAS
# =============================================================================

class AnalyzeImageRequest(BaseModel):
    image_b64: str = Field(..., description="Base64 encoded string of the image")
    species_hint: Optional[str] = Field("Unidentified Stray Species", description="Optional text hint about the species")

class AnalyzeImageResponse(BaseModel):
    species: str
    confidence: float
    severity: str
    anomalies: str
    tags: List[str]
    directives: List[str]
    is_hotspot: bool

class ClassifyReportRequest(BaseModel):
    text: str = Field(..., description="Audio transcription text or manual notes text of the incident")
    species_hint: Optional[str] = Field(None, description="Optional species hint")

class ClassifyReportResponse(BaseModel):
    classification: str
    severity: str
    tags: List[str]
    confidence: float
    estimated_count: int

class SeverityScoreRequest(BaseModel):
    species: str
    tags: List[str]
    has_visible_bleeding: Optional[bool] = False
    mobility_restricted: Optional[bool] = False
    notes: Optional[str] = ""

class SeverityScoreResponse(BaseModel):
    severity: str
    score: float
    threat_factors: List[str]
    escalation_required: bool

class RecommendActionRequest(BaseModel):
    species: str
    severity: str
    tags: List[str]
    notes: Optional[str] = ""

class RecommendActionResponse(BaseModel):
    directives: List[str]
    contraindications: List[str]
    first_aid_kit_items: List[str]

class MatchRespondersRequest(BaseModel):
    latitude: float
    longitude: float
    severity: Optional[str] = "Critical"
    species: Optional[str] = "dog"

class ResponderMatch(BaseModel):
    id: str
    name: str
    type: str
    phone: str
    distance_km: float
    status: str
    estimated_arrival_minutes: int

class MatchRespondersResponse(BaseModel):
    incident_coordinates: Dict[str, float]
    matched_responders: List[ResponderMatch]
    ambulance_allocated: bool

class TranslateGuidanceRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    target_language: str = Field(..., description="Target language (e.g., 'hi' for Hindi, 'bn' for Bengali, 'en' for English)")

class TranslateGuidanceResponse(BaseModel):
    source_language: str
    target_language: str
    translated_text: str

class SimpleChatMessage(BaseModel):
    sender: str
    text: str

class ChatContext(BaseModel):
    userLocationName: Optional[str] = None
    vetsList: Optional[List[Dict[str, Any]]] = None
    ngosList: Optional[List[Dict[str, Any]]] = None
    activeCase: Optional[Dict[str, Any]] = None
    scanExplanation: Optional[str] = None
    coordinationDetails: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[SimpleChatMessage] = []
    context: Optional[ChatContext] = None
    threadId: str = "general"

class ChatResponse(BaseModel):
    response: str
    is_live: bool

# =============================================================================
# ENDPOINTS
# =============================================================================

@app.get("/health")
async def health_check():
    """Standard CORS-safe service health check."""
    return {
        "status": "healthy",
        "ready": True,
        "message": "Compawss Python AI Backend is fully operational",
        "environment": os.environ.get("ENV", "development"),
        "api_keys_configured": {
            "gemini": bool(GEMINI_API_KEY and GEMINI_API_KEY != "MY_GEMINI_API_KEY"),
            "google_places": bool(GOOGLE_PLACES_API_KEY and GOOGLE_PLACES_API_KEY != "MY_GOOGLE_PLACES_API_KEY"),
            "supabase": bool(SUPABASE_URL and SUPABASE_ANON_KEY)
        },
        "demo_mode": DEMO_MODE
    }

@app.post("/ai/analyze-image", response_model=AnalyzeImageResponse)
async def analyze_image(payload: AnalyzeImageRequest):
    """
    Analyze animal image using Gemini Vision API.
    Returns grounded analysis based ONLY on visible content.
    NO fake vitals, temperatures, or invented diagnoses.
    """
    img_len = len(payload.image_b64)
    if img_len < 20:
        raise HTTPException(status_code=400, detail="Invalid Base64 image payload (too short).")

    # Check if Gemini API is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == "MY_GEMINI_API_KEY":
        raise HTTPException(
            status_code=503,
            detail="AI model not configured. Please set GEMINI_API_KEY environment variable."
        )

    try:
        # Prepare image data
        image_str = payload.image_b64
        mime_type = "image/jpeg"
        b64_data = ""

        # Case A: External Web URL
        if image_str.startswith("http://") or image_str.startswith("https://"):
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get(image_str, timeout=10.0, follow_redirects=True)
                    if resp.status_code == 200:
                        content_type = resp.headers.get("content-type", "image/jpeg")
                        b64_data = base64.b64encode(resp.content).decode("utf-8")
                        mime_type = content_type
            except Exception as ex_fetch:
                print(f"Error fetching URL in image analysis: {ex_fetch}")
                raise HTTPException(status_code=400, detail="Failed to fetch image from URL")

        # Case B: Base64 data URL
        elif image_str.startswith("data:image/"):
            try:
                header, data_part = image_str.split(",", 1)
                mime_part = "image/jpeg"
                for p in header.split(";"):
                    if p.startswith("image/"):
                        mime_part = p
                        break
                b64_data = data_part
                mime_type = mime_part
            except Exception as ex_b64:
                print(f"Error parsing base64 data URL: {ex_b64}")
                raise HTTPException(status_code=400, detail="Invalid base64 data URL format")
        
        else:
            # Raw base64 data
            b64_data = image_str

        if not b64_data:
            raise HTTPException(status_code=400, detail="No valid image data provided")

        # Construct vision analysis prompt
        prompt_text = (
            "You are an expert veterinary triage assistant. "
            "Analyze this image and provide observations based STRICTLY on visible content only.\n\n"
            "CRITICAL RULES:\n"
            "- NEVER invent injuries, bandages, cones, or medical equipment if not clearly visible\n"
            "- NEVER fabricate clinical numbers (heart rate, temperature, BPM, etc.)\n"
            "- If image is blurry or unclear, return low confidence (10-50) and note 'AI confidence limited'\n"
            "- Be realistic, caring, and veterinary-grade in language\n\n"
            "Provide analysis in this exact JSON format:\n"
            "{\n"
            '  "species": "Short species name (e.g., Canine/Dog, Feline/Cat, Bovine/Cow)",\n'
            '  "confidence": <float 10.0-99.0>,\n'
            '  "severity": "Moderate|Urgent|Critical",\n'
            '  "anomalies": "Factual description of visible condition, posture, environment",\n'
            '  "tags": ["visible", "traits", "as", "list"],\n'
            '  "directives": ["2-3 actionable next steps for field rescuer"],\n'
            '  "is_hotspot": <boolean for severe visible bleeding/trauma>\n'
            "}"
        )

        gemini_payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_data
                            }
                        },
                        {
                            "text": prompt_text
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": {
                    "type": "OBJECT",
                    "properties": {
                        "species": {"type": "STRING"},
                        "confidence": {"type": "NUMBER"},
                        "severity": {"type": "STRING"},
                        "anomalies": {"type": "STRING"},
                        "tags": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "directives": {"type": "ARRAY", "items": {"type": "STRING"}},
                        "is_hotspot": {"type": "BOOLEAN"}
                    },
                    "required": ["species", "confidence", "severity", "anomalies", "tags", "directives", "is_hotspot"]
                }
            }
        }

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "compawss-ai-backend"
        }

        async with httpx.AsyncClient() as client:
            resp = await client.post(url, json=gemini_payload, headers=headers, timeout=20.0)
            
            if resp.status_code == 200:
                res_json = resp.json()
                parts = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])
                output_text = parts[0].get("text", "")
                
                if output_text:
                    parsed_res = json.loads(output_text.strip())
                    return AnalyzeImageResponse(
                        species=parsed_res.get("species", "Unidentified Animal"),
                        confidence=float(parsed_res.get("confidence", 50.0)),
                        severity=parsed_res.get("severity", "Moderate"),
                        anomalies=parsed_res.get("anomalies", "Analysis unavailable"),
                        tags=list(parsed_res.get("tags", [])),
                        directives=list(parsed_res.get("directives", [])),
                        is_hotspot=bool(parsed_res.get("is_hotspot", False))
                    )
            else:
                print(f"Gemini Vision API error: {resp.status_code} - {resp.text}")
                raise HTTPException(status_code=502, detail=f"Gemini API error: {resp.status_code}")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in image analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

@app.post("/ai/classify-report", response_model=ClassifyReportResponse)
async def classify_report(payload: ClassifyReportRequest):
    """
    Classify incident report using Gemini AI.
    Falls back to rule-based classification if API unavailable.
    """
    text = payload.text.lower()
    
    # If Gemini is configured, use it for classification
    if GEMINI_API_KEY and GEMINI_API_KEY != "MY_GEMINI_API_KEY":
        prompt = (
            f"Classify this animal rescue incident report:\n\n"
            f'"{payload.text}"\n\n'
            f"Provide classification in JSON format:\n"
            f"{{\n"
            f'  "classification": "Brief incident type",\n'
            f'  "severity": "Moderate|Urgent|Critical",\n'
            f'  "tags": ["relevant", "keywords"],\n'
            f'  "confidence": <float 0-100>,\n'
            f'  "estimated_count": <int number of animals>\n'
            f"}}"
        )
        
        result = await call_gemini_api(prompt, temperature=0.2)
        if result:
            try:
                parsed = json.loads(result)
                return ClassifyReportResponse(
                    classification=parsed.get("classification", "General Rescue"),
                    severity=parsed.get("severity", "Moderate"),
                    tags=parsed.get("tags", []),
                    confidence=float(parsed.get("confidence", 75.0)),
                    estimated_count=int(parsed.get("estimated_count", 1))
                )
            except:
                pass
    
    # Rule-based fallback
    severity = "Moderate"
    classification = "General Rescue"
    tags = []
    
    if any(k in text for k in ["kill", "die", "dead", "severed", "fracture", "bleeding heavily", "unconscious"]):
        severity = "Critical"
        classification = "Critical Trauma"
        tags.append("critical-injury")
    elif any(k in text for k in ["bleed", "hurt", "broke", "hit", "struck", "car", "accident", "wound"]):
        severity = "Critical"
        classification = "Trauma Incident"
        tags.extend(["injury", "accident"])
    elif any(k in text for k in ["trapped", "stuck", "drain", "well", "locked", "pipe"]):
        severity = "Urgent"
        classification = "Trapped Animal"
        tags.extend(["trapped", "rescue-needed"])
    elif any(k in text for k in ["dehydrated", "starving", "skin", "mange", "fever", "limp"]):
        severity = "Urgent"
        classification = "Medical Care Needed"
        tags.extend(["medical", "care-needed"])
    
    if not tags:
        tags = ["general-rescue"]
    
    count = 1
    if any(k in text for k in ["puppies", "kittens", "many", "multiple", "several"]):
        count = 3

    return ClassifyReportResponse(
        classification=classification,
        severity=severity,
        tags=tags,
        confidence=85.0 if tags else 60.0,
        estimated_count=count
    )

@app.post("/ai/severity-score", response_model=SeverityScoreResponse)
async def severity_score(payload: SeverityScoreRequest):
    """Compute severity score based on visible indicators."""
    base_score = 40.0
    threats = []
    
    if payload.has_visible_bleeding:
        base_score += 25.0
        threats.append("Visible bleeding detected")
    if payload.mobility_restricted:
        base_score += 20.0
        threats.append("Mobility restricted")
    
    for tag in payload.tags:
        t_low = tag.lower()
        if "hit by vehicle" in t_low or "struck" in t_low:
            base_score += 15.0
            threats.append("Vehicle trauma")
        elif "bleeding" in t_low and "Visible bleeding detected" not in threats:
            base_score += 10.0
            threats.append("Bleeding reported")
        elif "poison" in t_low:
            base_score += 20.0
            threats.append("Possible poisoning")
    
    base_score = min(100.0, max(10.0, base_score))
    
    severity = "Moderate"
    if base_score >= 80.0:
        severity = "Critical"
    elif base_score >= 60.0:
        severity = "Urgent"
    
    return SeverityScoreResponse(
        severity=severity,
        score=base_score,
        threat_factors=threats or ["General vulnerability"],
        escalation_required=(base_score >= 70.0)
    )

@app.post("/ai/recommend-action", response_model=RecommendActionResponse)
async def recommend_action(payload: RecommendActionRequest):
    """
    Get rescue recommendations using Gemini AI.
    Falls back to rule-based recommendations if API unavailable.
    """
    # Try Gemini first
    if GEMINI_API_KEY and GEMINI_API_KEY != "MY_GEMINI_API_KEY":
        prompt = (
            f"Provide first aid recommendations for:\n"
            f"Species: {payload.species}\n"
            f"Severity: {payload.severity}\n"
            f"Tags: {', '.join(payload.tags)}\n"
            f"Notes: {payload.notes}\n\n"
            f"Return JSON with:\n"
            f"{{\n"
            f'  "directives": ["2-3 actionable steps"],\n'
            f'  "contraindications": ["things to avoid"],\n'
            f'  "first_aid_kit_items": ["needed supplies"]\n'
            f"}}"
        )
        
        result = await call_gemini_api(prompt, temperature=0.2)
        if result:
            try:
                parsed = json.loads(result)
                return RecommendActionResponse(
                    directives=parsed.get("directives", []),
                    contraindications=parsed.get("contraindications", []),
                    first_aid_kit_items=parsed.get("first_aid_kit_items", [])
                )
            except:
                pass
    
    # Rule-based fallback
    sev_level = payload.severity.lower()
    species_type = payload.species.lower()
    
    directives = []
    contraindications = []
    first_aid_kit_items = []
    
    if "dog" in species_type or "canis" in species_type:
        first_aid_kit_items = ["Gauze", "Antiseptic", "Leash", "Blanket"]
        if "critical" in sev_level:
            directives = [
                "Apply clean gauze to visible wounds with gentle pressure",
                "Keep animal warm and calm",
                "Transport to nearest vet immediately"
            ]
            contraindications = [
                "Do not force-feed or give water if unconscious",
                "Do not move if spinal injury suspected"
            ]
        else:
            directives = [
                "Approach slowly and calmly",
                "Secure with loose collar if safe",
                "Provide water if conscious"
            ]
            contraindications = ["Do not chase or corner the animal"]
    elif "cat" in species_type or "kitten" in species_type:
        first_aid_kit_items = ["Soft carrier", "Gloves", "Towel", "Water"]
        directives = [
            "Use towel to gently secure if needed",
            "Place in dark, quiet carrier",
            "Minimize handling and stress"
        ]
        contraindications = [
            "Do not grab by scruff roughly",
            "Do not feed cow's milk"
        ]
    else:
        first_aid_kit_items = ["First aid kit", "Gloves", "Water"]
        directives = [
            "Maintain safe distance",
            "Call professional rescue",
            "Keep area clear of traffic"
        ]
        contraindications = ["Do not approach if animal is aggressive"]
    
    return RecommendActionResponse(
        directives=directives,
        contraindications=contraindications,
        first_aid_kit_items=first_aid_kit_items
    )

@app.post("/ai/match-responders", response_model=MatchRespondersResponse)
async def match_responders(payload: MatchRespondersRequest):
    """
    Match nearby responders using real data from Google Places and Supabase.
    Returns empty list if no data sources configured.
    """
    matched_responders = []
    
    # Try to get real vets from Google Places
    vets = await get_nearby_vets_from_google(payload.latitude, payload.longitude)
    for vet in vets[:3]:  # Top 3 vets
        matched_responders.append(ResponderMatch(
            id=vet.get("id", f"vet-{len(matched_responders)}"),
            name=vet.get("name", "Veterinary Clinic"),
            type="Veterinary Hospital",
            phone=vet.get("phone", "Contact via Google Maps"),
            distance_km=round(vet.get("distance_km", 0.0), 1) if "distance_km" in vet else 0.0,
            status="Available" if vet.get("is_open") else "Status Unknown",
            estimated_arrival_minutes=10
        ))
    
    # Try to get real NGOs from Supabase
    ngos = await get_nearby_ngos_from_supabase(payload.latitude, payload.longitude)
    for ngo in ngos[:2]:  # Top 2 NGOs
        matched_responders.append(ResponderMatch(
            id=ngo.get("id", f"ngo-{len(matched_responders)}"),
            name=ngo.get("name", "Animal Rescue NGO"),
            type="NGO Rescue Team",
            phone=ngo.get("contact", ngo.get("phone", "Contact unavailable")),
            distance_km=0.0,  # Calculate if lat/lng available
            status="Active",
            estimated_arrival_minutes=15
        ))
    
    # If no real data available, return error message
    if not matched_responders:
        if not GOOGLE_PLACES_API_KEY and not SUPABASE_URL:
            raise HTTPException(
                status_code=503,
                detail="No data sources configured. Please set GOOGLE_PLACES_API_KEY or SUPABASE_URL."
            )
        else:
            # Data sources configured but no results found
            return MatchRespondersResponse(
                incident_coordinates={"lat": payload.latitude, "lng": payload.longitude},
                matched_responders=[],
                ambulance_allocated=False
            )
    
    return MatchRespondersResponse(
        incident_coordinates={"lat": payload.latitude, "lng": payload.longitude},
        matched_responders=matched_responders,
        ambulance_allocated=(payload.severity == "Critical")
    )

@app.post("/ai/translate-guidance", response_model=TranslateGuidanceResponse)
async def translate_guidance(payload: TranslateGuidanceRequest):
    """
    Translate text using Gemini AI.
    Falls back to simple dictionary for common phrases.
    """
    dest = payload.target_language.lower()
    
    if dest == "en":
        return TranslateGuidanceResponse(
            source_language="en",
            target_language="en",
            translated_text=payload.text
        )
    
    # Try Gemini translation
    if GEMINI_API_KEY and GEMINI_API_KEY != "MY_GEMINI_API_KEY":
        lang_names = {"hi": "Hindi", "bn": "Bengali", "ta": "Tamil", "te": "Telugu"}
        lang_name = lang_names.get(dest, dest.upper())
        
        prompt = f"Translate this text to {lang_name}:\n\n{payload.text}\n\nProvide only the translation, no explanations."
        
        result = await call_gemini_api(prompt, temperature=0.1)
        if result:
            return TranslateGuidanceResponse(
                source_language="en",
                target_language=dest,
                translated_text=result.strip()
            )
    
    # Fallback: return with language tag
    return TranslateGuidanceResponse(
        source_language="en",
        target_language=dest,
        translated_text=f"[{dest.upper()}] {payload.text}"
    )

@app.post("/ai/chat", response_model=ChatResponse)
async def ai_chat(payload: ChatRequest):
    """
    AI chat assistant with real data grounding.
    Uses Gemini API with context from Supabase and Google Places.
    NO hardcoded fake responses.
    """
    # Check if Gemini is configured
    if not GEMINI_API_KEY or GEMINI_API_KEY == "MY_GEMINI_API_KEY":
        return ChatResponse(
            response="AI model not configured. Please set GEMINI_API_KEY environment variable to enable chat assistance.",
            is_live=False
        )
    
    # Extract user's last message
    last_user_msg = ""
    for m in reversed(payload.messages):
        if m.sender == "user":
            last_user_msg = m.text
            break
    
    if not last_user_msg:
        return ChatResponse(
            response="How can I assist you with animal rescue today?",
            is_live=True
        )
    
    # Build context from provided data
    loc_str = payload.context.userLocationName if payload.context and payload.context.userLocationName else "Location not provided"
    
    vets_info = "No veterinary data available"
    if payload.context and payload.context.vetsList:
        vets_list = []
        for v in payload.context.vetsList[:3]:
            vets_list.append(f"• {v.get('clinicName', v.get('name', 'Clinic'))} - {v.get('distance', 'Distance unknown')}, Phone: {v.get('contact', 'N/A')}")
        vets_info = "\n".join(vets_list) if vets_list else "No veterinary data available"
    
    ngos_info = "No NGO data available"
    if payload.context and payload.context.ngosList:
        ngos_list = []
        for n in payload.context.ngosList[:3]:
            ngos_list.append(f"• {n.get('name', 'NGO')} - {n.get('address', 'Address unknown')}, Phone: {n.get('contact', 'N/A')}")
        ngos_info = "\n".join(ngos_list) if ngos_list else "No NGO data available"
    
    case_info = "No active rescue case"
    if payload.context and payload.context.activeCase:
        ac = payload.context.activeCase
        profile = ac.get("animalProfile", {})
        case_info = (
            f"Case {ac.get('id', 'N/A')}: {profile.get('species', 'Animal')} "
            f"({ac.get('status', 'Status unknown')}) at {ac.get('location', 'Location unknown')}"
        )
    
    scan_info = payload.context.scanExplanation if payload.context and payload.context.scanExplanation else "No image scan data"
    
    # Build system instruction
    system_instruction = (
        "You are Compawss AI, an animal rescue assistant for India.\n\n"
        "CRITICAL RULES:\n"
        "1. Keep responses CONCISE (2-4 sentences max unless detailed medical info needed)\n"
        "2. Use ONLY the data provided in context - DO NOT invent clinic names, phone numbers, or addresses\n"
        "3. If data is missing, clearly state 'Data not available' and suggest alternatives\n"
        "4. Be direct, helpful, and action-oriented\n"
        "5. No fake tactical jargon or dramatic language\n\n"
        f"CURRENT CONTEXT:\n"
        f"Location: {loc_str}\n"
        f"Active Case: {case_info}\n"
        f"Image Scan: {scan_info}\n"
        f"Nearby Vets:\n{vets_info}\n"
        f"Nearby NGOs:\n{ngos_info}"
    )
    
    # Build conversation history
    conversation = []
    for msg in payload.messages[-10:]:  # Last 10 messages
        role = "user" if msg.sender == "user" else "model"
        conversation.append({
            "role": role,
            "parts": [{"text": msg.text}]
        })
    
    # Call Gemini API
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "compawss-ai-backend"
        }
        
        gemini_payload = {
            "contents": conversation,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 500  # Limit response length
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=gemini_payload, headers=headers, timeout=15.0)
            
            if response.status_code == 200:
                data = response.json()
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        answer = parts[0].get("text", "")
                        if answer:
                            return ChatResponse(response=answer, is_live=True)
            else:
                print(f"Gemini API error: {response.status_code} - {response.text}")
                return ChatResponse(
                    response=f"AI service temporarily unavailable (Error {response.status_code}). Please try again.",
                    is_live=False
                )
    
    except Exception as e:
        print(f"Chat API exception: {e}")
        return ChatResponse(
            response="AI service temporarily unavailable. Please try again.",
            is_live=False
        )
    
    # Fallback if no response generated
    return ChatResponse(
        response="I'm here to help with animal rescue. Could you please rephrase your question?",
        is_live=True
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Made with Bob
