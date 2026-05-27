import os
import math
import base64
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from google import genai
from google.genai import types

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("compawss-ai-backend")

app = FastAPI(
    title="Compawss AI Advanced Python Backend",
    description="FastAPI service for animal injury analysis, triage scoring, responder routing, and multilingual support.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("AI_MODEL_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Gemini Client if API key is provided
def get_gemini_client():
    if GEMINI_API_KEY and GEMINI_API_KEY.strip():
        try:
            # Set User-Agent as required by AI Studio guidelines
            client = genai.Client(
                api_key=GEMINI_API_KEY,
                http_options={"headers": {"User-Agent": "aistudio-build"}}
            )
            return client
        except Exception as e:
            logger.error(f"Error initializing Gemini python client: {e}")
    return None

# Haversine distance helper
def calculate_haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Radius of earth in km
    R = 6371.0
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

# --- Models ---
class ImageAnalysisRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded string of the image (including or excluding data URI header)")
    image_url: Optional[str] = Field(None, description="URL of the hosted image")

class ClassifyReportRequest(BaseModel):
    text: str = Field(..., description="Sighting description or audio transcription")

class SeverityScoreRequest(BaseModel):
    text: str = Field(..., description="Report details")
    tags: Optional[List[str]] = Field(default=[], description="Detected tags or conditions")

class RecommendActionRequest(BaseModel):
    species: str = Field(..., description="Assessed species")
    injury_type: str = Field(..., description="Injury classification")
    severity: str = Field(..., description="Severity category (Critical, Urgent, Moderate, Minor)")

class MatchRespondersRequest(BaseModel):
    latitude: float = Field(..., description="Case location latitude")
    longitude: float = Field(..., description="Case location longitude")
    responders: List[Dict[str, Any]] = Field(..., description="List of volunteers, NGO resources, or veterinary clinics to rank")

class TranslateGuidanceRequest(BaseModel):
    text: str = Field(..., description="Clinical instructions to translate")
    target_language: str = Field(..., description="Language code (hi, bn, ta, te, mr, en)")


@app.get("/health")
def health_check():
    api_configured = (GEMINI_API_KEY is not None and len(GEMINI_API_KEY.strip()) > 0)
    return {
        "status": "healthy",
        "service": "Compawss AI FastAPI Service",
        "gemini_api_configured": api_configured,
        "engine": "Gemini 3.5 Flash // Native CPython" if api_configured else "Demo AI // Fallback Sandbox"
    }


@app.post("/ai/analyze-image")
def analyze_image(payload: ImageAnalysisRequest):
    """
    Image-based animal/injury analysis using Gemini Pro/Flash multimodal model.
    Falls back to a robust taxonomical classifier mock if no API key is specified.
    """
    client = get_gemini_client()
    
    if client:
        try:
            logger.info("Triggering real Gemini multi-spectral ocular image scan.")
            
            # Extract raw base64 data
            image_data = payload.image_base64
            mime_type = "image/png"
            
            if image_data:
                if "," in image_data:
                    header, image_data = image_data.split(",", 1)
                    if "image/jpeg" in header:
                        mime_type = "image/jpeg"
                    elif "image/webp" in header:
                        mime_type = "image/webp"
            else:
                raise HTTPException(status_code=400, detail="Base64 image is required for ocular scan when API key is armed.")

            image_bytes = base64.b64decode(image_data)
            
            prompt = """
            Analyze this street animal rescue image. Provide standard clinical details.
            Return a JSON object conforming exactly to this structure:
            {
                "species": "Standard scientific name and common name (e.g., Felis catus (Calico Cat) or Canis lupus familiaris (Indie Mix))",
                "lesion_notes": "A precise clinical summary describing the wound, bleeding, fractures, posture of pain, or other symptoms.",
                "suggested_severity": "Critical or Urgent or Moderate or Minor",
                "detected_tags": ["list", "of", "conditions", "such as bleeding, trauma, trapped, abandoned"],
                "confidence_score": 95.5,
                "is_demo_ai": false
            }
            Make sure to only answer with the JSON structure itself, no code blocks or formatting.
            """
            
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=[
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=mime_type,
                    ),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            
            import json
            result = json.loads(response.text.strip())
            return result
        except Exception as e:
            logger.warn(f"Exception during real image analysis: {e}. Falling back to demo mode.")

    # FALLBACK DEMO AI
    logger.info("Relying on Demo AI standard image-based lesion/injury mock model.")
    has_dog = True
    if payload.image_url and "kitten" in payload.image_url.lower():
        has_dog = False
    elif payload.image_base64 and len(payload.image_base64) % 3 == 0: # organic variety
        has_dog = False

    if has_dog:
        return {
            "species": "Canis lupus familiaris (Shih Tzu/Indie Mix)",
            "lesion_notes": "DEMO AI: Pronounced laceration on lower rear extremity, notable swelling, high muscle tension indicative of vehicle trauma.",
            "suggested_severity": "Critical",
            "detected_tags": ["bleeding", "unable to walk", "hit by vehicle"],
            "confidence_score": 97.4,
            "is_demo_ai": True
        }
    else:
        return {
            "species": "Felis catus (Calico Kitten / Urban Shorthair)",
            "lesion_notes": "DEMO AI: Extreme shivering behavior, damp coat with dirt clumping, vocal distress suggesting moderate hypothermia due to storm water drain containment.",
            "suggested_severity": "Urgent",
            "detected_tags": ["trapped", "dehydrated", "abandoned baby"],
            "confidence_score": 94.8,
            "is_demo_ai": True
        }


@app.post("/ai/classify-report")
def classify_report(payload: ClassifyReportRequest):
    """
    Emergency incident reporting category classifier.
    """
    client = get_gemini_client()
    
    if client:
        try:
            prompt = f"""
            Analyze the following rescue report text and classify the incident.
            Report: "{payload.text}"
            
            Return a JSON object conforming exactly to this schema:
            {{
                "category": "Injured Stray or Trapped or Abuse/Neglect or Sick Animal or Other",
                "priority_level": "Critical or High or Standard"
            }}
            Only output valid JSON.
            """
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.warn(f"Fallback classify-report error: {e}")

    # Fallback simulation
    text_lower = payload.text.lower()
    category = "Injured Stray"
    priority = "Standard"
    
    if "trap" in text_lower or "drain" in text_lower or "stuck" in text_lower:
        category = "Trapped"
        priority = "High"
    elif "hit" in text_lower or "bleed" in text_lower or "broken" in text_lower or "accident" in text_lower or "car" in text_lower or "run over" in text_lower:
        category = "Injured Stray"
        priority = "Critical"
    elif "abuse" in text_lower or "beat" in text_lower or "hurt" in text_lower or "cruel" in text_lower:
        category = "Abuse/Neglect"
        priority = "High"
    elif "sick" in text_lower or "vomit" in text_lower or "cough" in text_lower or "fever" in text_lower:
        category = "Sick Animal"
        priority = "Standard"

    return {
        "category": f"DEMO AI: {category}",
        "priority_level": priority,
        "is_demo_ai": True
    }


@app.post("/ai/severity-score")
def severity_score(payload: SeverityScoreRequest):
    """
    Emergency severity scorer from 0 to 10 with vitals forecasting constraints.
    """
    client = get_gemini_client()
    
    if client:
        try:
            prompt = f"""
            Rate the severity of the animal crisis based on the following:
            Report Text: "{payload.text}"
            Detected Conditions/Tags: {payload.tags}
            
            Response schema:
            {{
                "severity_score": 8.7,  // float from 0 to 10
                "severity_category": "Critical or Urgent or Moderate or Minor",
                "vitals_guidance": {{
                    "heart_rate_forecast": "140-160 BPM // SHOCK",
                    "temp_estimate": "102.5 °F // ELEVATED",
                    "alertness": "Stupor / Semi-conscious state"
                }}
            }}
            Only output valid JSON.
            """
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.warn(f"Fallback severity-score error: {e}")

    # Fallback simulation
    text_lower = payload.text.lower()
    score = 5.0
    category = "Moderate"
    hr = "110-120 BPM // NORMAL"
    temp = "101.5 °F // NORMAL"
    alert = "Fully Alert"

    if "hit" in text_lower or "bleed" in text_lower or "accident" in text_lower or "critical" in text_lower:
        score = 8.9
        category = "Critical"
        hr = "145 BPM // SHOCK tachycardia"
        temp = "102.8 °F // HYPERTHERMIC SHIVER"
        alert = "Listless / Semi-conscious"
    elif "trap" in text_lower or "substation" in text_lower or "drain" in text_lower:
        score = 7.2
        category = "Urgent"
        hr = "130 BPM // DEHYDRATION TENSION"
        temp = "99.5 °F // HYPOTHERMIC"
        alert = "Highly Vocal / Panicked"

    return {
        "severity_score": score,
        "severity_category": f"DEMO AI: {category}",
        "vitals_guidance": {
            "heart_rate_forecast": hr,
            "temp_estimate": temp,
            "alertness": alert
        },
        "is_demo_ai": True
    }


@app.post("/ai/recommend-action")
def recommend_action(payload: RecommendActionRequest):
    """
    Generate critical first aid recommendations.
    """
    client = get_gemini_client()
    
    if client:
        try:
            prompt = f"""
            Identify critical first-aid actions for a rescuer dealing with this stray animal situation:
            Species: {payload.species}
            Injury/Condition: {payload.injury_type}
            Severity Level: {payload.severity}
            
            Return a JSON object:
            {{
                "directives": ["Do step 1", "Do step 2", "Do step 3"],
                "warnings": ["CRITICAL WARNING: NEVER offer water instantly...", "Avoid moving fractured joints..."],
                "tools_required": ["Muzzle", "Stretcher", "Saline", "Gauze"]
            }}
            Only output valid JSON.
            """
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2
                )
            )
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.warn(f"Fallback recommend-action error: {e}")

    # Fallback simulation
    is_dog = "dog" in payload.species.lower() or "canis" in payload.species.lower()
    if is_dog:
        return {
            "directives": [
                "DEMO AI: Apply subtle direct gauze pressure to stop vascular bleed if the subject allows.",
                "DEMO AI: Wrap in sterile cloth or standard blanket to restrict physical shock and retain body heat.",
                "DEMO AI: Maintain clear respiration passages; avoid force-feeding oral water or fluids."
            ],
            "warnings": [
                "DEMO AI: NEVER place hands near mouth when injured animal is in acute distress to prevent reflex bite.",
                "DEMO AI: DO NOT elevate torso if spinal trauma is suspected from vehicular impact."
            ],
            "tools_required": ["Absorbent Sterile Gauze Pads", "Sturdy Canvas Stretcher", "Warm Insulating Wrap Cloth"],
            "is_demo_ai": True
        }
    else:
        return {
            "directives": [
                "DEMO AI: Avoid inserting metallic poles. Lower a soft fabric mesh rope to allow self-climbing traction.",
                "DEMO AI: Prepare safe ambient warm towels to elevate core body temperature post-extraction.",
                "DEMO AI: Provide clear rehydration or sugar-water feeds dropwise."
            ],
            "warnings": [
                "DEMO AI: NEVER force a kitten inside airtight carriers immediately after water drainage immersion.",
                "DEMO AI: Avoid making sudden loud noises which could trigger vertical climbing panic."
            ],
            "tools_required": ["Nylon Rescue Netting", "Isothermal Insulating Wrap", "Oral Rehydration Syringe Tool"],
            "is_demo_ai": True
        }


@app.post("/ai/match-responders")
def match_responders(payload: MatchRespondersRequest):
    """
    Matcher decision routing support for nearest volunteers, vets, or NGOs.
    Ranks them dynamically by distance, ETA estimation, suitability, and capacity.
    """
    lat = payload.latitude
    lon = payload.longitude
    responders = payload.responders
    
    matched_results = []
    
    # Standard fallback ETA calculations & spatial ranking
    for res in responders:
        res_lat = res.get("latitude") or res.get("lat")
        res_lon = res.get("longitude") or res.get("lon") or res.get("lng")
        
        # Guard coordinates
        if res_lat is None or res_lon is None:
            # Generate slightly randomized nearby coords from 0.01 to 0.05 dev
            res_lat = lat + 0.015
            res_lon = lon - 0.012
            
        dist_km = calculate_haversine(lat, lon, res_lat, res_lon)
        
        # Estimate ETA based on average urban speed of 25 km/h in Indian cities
        speed_kmh = 25.0
        time_hours = dist_km / speed_kmh
        eta_minutes = int(time_hours * 60) + 4 # minimum 4 minutes overhead
        
        # Suitability factor calculation based on specialization matching
        suitability = "High Match"
        score = 90 - (dist_km * 2) # closer is better
        
        res_type = res.get("type", "General")
        tags = res.get("service_tags", res.get("tags", []))
        
        # Format distance label
        distance_label = f"{dist_km:.2f} km" if dist_km >= 1.0 else f"{int(dist_km * 1000)} meters"
        
        matched_results.append({
            "id": res.get("id", f"res-{hash(res.get('name', '')) % 1000}"),
            "name": res.get("name", res.get("clinicName", "Field Resource")),
            "distance_km": round(dist_km, 2),
            "distance_label": distance_label,
            "eta_minutes": eta_minutes,
            "phone": res.get("phone", res.get("contact", "+91 99999 99999")),
            "address": res.get("address", "Registered Sector Zone Area"),
            "suitability_ranking": suitability,
            "suitability_score": max(20, min(100, int(score))),
            "capacity_status": "Active Capacity Avail" if res.get("emergency_available", True) else "Limited Capacity",
            "source": res.get("source", "Supabase Directory")
        })
        
    # Sort by proximity/suitability score descending
    matched_results.sort(key=lambda x: x["distance_km"])
    
    return {
        "case_latitude": lat,
        "case_longitude": lon,
        "ranked_responders": matched_results,
        "engine": "CPython Spatial Distance Array Matrix // Routing Engine v1"
    }


@app.post("/ai/translate-guidance")
def translate_guidance(payload: TranslateGuidanceRequest):
    """
    Clinical directions multi-language translation router.
    Translates first aid steps or diagnostics to Hindi, Bengali, etc.
    """
    client = get_gemini_client()
    target = payload.target_language.lower()
    
    if client:
        try:
            logger.info(f"Using high quality Gemini multilingual translator model for target language: {target}")
            prompt = f"""
            Translate the following first-aid directives or diagnostics accurately into target language: "{target}".
            Ensure terminology is translated in a humane, highly clear, street-practical manner for local Indian field rescuers.
            Include a "transliteration" property which shows how to pronounce the translation in English phonetic script if target is not English.
            
            Text: "{payload.text}"
            
            Return a JSON object conforming exactly to this schema:
            {{
                "translated_text": "The translated text inside native target font/script",
                "transliteration": "Phonetic English pronunciation spelling of the translated text"
            }}
            Only output valid JSON.
            """
            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            import json
            return json.loads(response.text.strip())
        except Exception as e:
            logger.warn(f"Google GenAI translator exception: {e}. Reverting to standard dictionary.")

    # FALLBACK DICTIONARY DECK
    translated = payload.text
    transliteration = ""
    
    # Simulates translation map for demo
    if target in ("hi", "hindi"):
        if "apply subtle direct gauze pressure" in payload.text.lower():
            translated = "रक्तस्राव को रोकने के लिए घाव पर सीधे धुंध (gauze) की पट्टी से हल्का दबाव डालें।"
            transliteration = "Raktasraav ko rokne ke liye ghaav par seedhe gauze ki patti se halka dabaav daalein."
        elif "wrap in sterile cloth" in payload.text.lower() or "wrap in an isothermal" in payload.text.lower():
            translated = "शारीरिक झटके से बचाने और शरीर की गर्मी को बनाए रखने के लिए सूखे कपड़े या कंबल में लपेटें।"
            transliteration = "Shaareerik jhatke se bachaane aur shareer ki garmee ko banaaye rakhne ke liye k遭受 ya kambal mein lapeitain."
        else:
            translated = f"[DEMO HI] {payload.text} (कृपया सुनिश्चित करें कि जानवर सुरक्षित और शांत है)"
            transliteration = "Kripya sunishchit karein ki jaanwar surakshit aur shaant hai."
            
    elif target in ("bn", "bengali", "bengla"):
        if "apply subtle direct gauze pressure" in payload.text.lower():
            translated = "রক্তপাত বন্ধ করতে জখমের ওপর গজ কাপড় দিয়ে সরাসরি হালকা চাপ দিন।"
            transliteration = "Roktopat bondho korte jokhom er upor gauze kapor diye sorasori halka chap din."
        elif "wrap in sterile cloth" in payload.text.lower() or "wrap in an isothermal" in payload.text.lower():
            translated = "শারীরিক শক প্রতিরোধ এবং শরীরের তাপমাত্রা ঠিক রাখতে একটি শুকনো কাপড় বা কম্বল দিয়ে জড়িয়ে রাখুন।"
            transliteration = "Shoririk shock protirodh ebong shorirer tapmatra thik rakhte ekti shukno kapor ba kombol diye joriye rakhun."
        else:
            translated = f"[DEMO BN] {payload.text} (অনুগ্রহ করে নিশ্চিত করুন যে প্রাণীটি নিরাপদ আছে)"
            transliteration = "Onugroh kore nishchit korun jey praniti nirapod achey."
            
    else:
        translated = f"[DEMO TRANSLATION TO {target}] {payload.text}"
        transliteration = f"Phonetic {target} transliteration of rescue rules"

    return {
        "translated_text": translated,
        "transliteration": transliteration,
        "is_demo_ai": True
    }
