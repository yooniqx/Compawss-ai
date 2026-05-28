import os
import base64
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Compawss AI Emergency Dispatch Backend",
    description="Python microservice supplying advanced triage, computer vision, and linguistic services for stray animal rescue operations in India.",
    version="1.0.0"
)

# Enable CORS for direct front-end calls from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REQUEST / RESPONSE SCHEMAS ---

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

# --- ENDPOINTS ---

@app.get("/health")
async def health_check():
    """
    Standard CORS-safe service health check.
    """
    return {
        "status": "healthy",
        "ready": True,
        "message": "Compawss Python AI Backend is fully operational",
        "environment": os.environ.get("ENV", "development"),
        "supported_codecs": ["base64", "json-telemetry"]
    }

@app.post("/ai/analyze-image", response_model=AnalyzeImageResponse)
async def analyze_image(payload: AnalyzeImageRequest):
    """
    Triage and identify stray species metadata from a source image payload.
    Uses robust heuristic parsing with fallback to mock computer vision telemetry.
    """
    img_len = len(payload.image_b64)
    if img_len < 100:
        raise HTTPException(status_code=400, detail="Invalid Base64 image payload (too short).")

    hint = payload.species_hint.lower() if payload.species_hint else ""
    
    # Simple clever heuristic simulator based on the size or hint text
    if "dog" in hint or "canis" in hint:
        species = "Canis lupus familiaris (Shih Tzu/Stray Mix)"
        severity = "Critical"
        anomalies = "Active left lower body bleeding, apparent trauma, skeletal limb displacement"
        tags = ["bleeding", "unable to walk", "hit by vehicle"]
        directives = [
            "Apply subtle direct gauze pressure to stop vascular bleed if the subject allows.",
            "Wrap in an isothermal blanket or dry cloth to restrict shivering and physical shock.",
            "Maintain clear air passages; do not offer food or force oral fluid intake immediately."
        ]
    elif "cat" in hint or "kitten" in hint or "feline" in hint:
        species = "Felis catus (Calico Kitten)"
        severity = "Urgent"
        anomalies = "Severe fluid loss, vocal desperation, confined environment threat"
        tags = ["trapped", "dehydrated", "abandoned baby"]
        directives = [
            "Avoid inserting metallic poles. Lower a soft fabric mesh rope to allow self-climbing traction.",
            "Prepare warm ambient shelter to raise body core temperature post-extraction.",
            "Prepare safe rehydration solutions (lactated Ringer or sugar-water drip feeds)."
        ]
    elif "cow" in hint or "cattle" in hint or "bull" in hint:
        species = "Bos taurus (Desi Cow - Zebu Lineage)"
        severity = "Critical"
        anomalies = "Lacerations on flank, plastic ingestion bloating, restricted limb movement"
        tags = ["road obstacle", "lumpen skin threat", "laceration"]
        directives = [
            "Divert active traffic safely around the animal with high-visibility markers.",
            "Apply compression to bleeding flank areas from a safe angle.",
            "Do not attempt to lift the animal without local agricultural harness machinery."
        ]
    else:
        # Default fallback analysis
        species = "Unidentified Stray Species (Heuristic Assessment)"
        severity = "Moderate"
        anomalies = "External lesion profiling required, respiratory assessment pending"
        tags = ["unknown condition", "needs on-site review"]
        directives = [
            "Maintain a safe static perimeter of at least 3 meters until rescue specialists arrive.",
            "Document visual media elements from multiple vectors if animal remains steady.",
            "Ensure clear access paths for incoming first-responder vehicles."
        ]

    confidence = round(85.0 + (img_len % 150) / 10.0, 1)
    if confidence > 98.9:
        confidence = 98.9

    return AnalyzeImageResponse(
        species=species,
        confidence=confidence,
        severity=severity,
        anomalies=anomalies,
        tags=tags,
        directives=directives,
        is_hotspot=(img_len % 2 == 0)
    )

@app.post("/ai/classify-report", response_model=ClassifyReportResponse)
async def classify_report(payload: ClassifyReportRequest):
    """
    NLU endpoint to classify a textual incident report and extract keywords, severity.
    """
    text = payload.text.lower()
    
    # Analyze text for key tokens
    severity = "Moderate"
    classification = "Manual Node Setup"
    tags = ["needs review"]
    
    # Rules
    if any(k in text for k in ["kill", "die", "dead", "severed", "head trauma", "fracture", "bleeding heavily", "unconscious"]):
        severity = "Critical"
        classification = "Canis Trauma Block" if "dog" in text else "Feline Vet Critical"
    elif any(k in text for k in ["bleed", "hurt", "broke", "hit", "struck", "car", "accident", "wound"]):
        severity = "Critical"
        classification = "Canis Trauma Block"
    elif any(k in text for k in ["trapped", "stuck", "drain", "well", "locked", "pipe"]):
        severity = "Urgent"
        classification = "Feline Trap Grid" if "cat" in text or "kitten" in text else "Trap Rescue Case"
    elif any(k in text for k in ["dehydrated", "starving", "skin", "mange", "fever", "limp"]):
        severity = "Urgent"
        classification = "Animal Sick Bay Care"
    
    # Tag extraction
    possible_tags = ["bleeding", "hit by vehicle", "trapped", "dehydrated", "unable to walk", "abuse", "poisoning", "road hazard"]
    found_tags = [tag for tag in possible_tags if tag in text]
    if not found_tags:
        found_tags = ["general rescue"]

    count = 1
    if "puppies" in text or "kittens" in text or "many" in text or "dogs" in text:
        count = 3

    return ClassifyReportResponse(
        classification=classification,
        severity=severity,
        tags=found_tags,
        confidence=92.4 if len(found_tags) > 0 else 76.5,
        estimated_count=count
    )

@app.post("/ai/severity-score", response_model=SeverityScoreResponse)
async def severity_score(payload: SeverityScoreRequest):
    """
    Computes an exact visual/empirical severity index and risk profile.
    """
    base_score = 40.0
    threats = []
    
    if payload.has_visible_bleeding:
        base_score += 25.0
        threats.append("Vascular Bleed (High Shock Risk)")
    if payload.mobility_restricted:
        base_score += 20.0
        threats.append("Limb/Skeletal Fracture")
    
    lower_species = payload.species.lower()
    if "critical" in lower_species or "trauma" in lower_species:
        base_score += 15.0
        threats.append("Critical Pathology Flagged")
        
    for tag in payload.tags:
        t_low = tag.lower()
        if "hit by vehicle" in t_low or "struck" in t_low:
            base_score += 15.0
            threats.append("Vehicular Blunt Force Trauma")
        elif "bleeding" in t_low:
            if "Vascular Bleed (High Shock Risk)" not in threats:
                base_score += 10.0
                threats.append("Active Bleeding")
        elif "poison" in t_low:
            base_score += 20.0
            threats.append("Toxic Ingestion")
            
    # Bound score
    if base_score > 100.0:
        base_score = 100.0
    if base_score < 0.0:
        base_score = 10.0
        
    severity = "Moderate"
    if base_score >= 80.0:
        severity = "Critical"
    elif base_score >= 60.0:
        severity = "Urgent"
        
    return SeverityScoreResponse(
        severity=severity,
        score=base_score,
        threat_factors=threats or ["General Stray Vulnerability"],
        escalation_required=(base_score >= 70.0)
    )

@app.post("/ai/recommend-action", response_model=RecommendActionResponse)
async def recommend_action(payload: RecommendActionRequest):
    """
    Obtain custom rescue directives and list contraindications.
    """
    sev_level = payload.severity.lower()
    species_type = payload.species.lower()
    
    directives = []
    contraindications = []
    first_aid_kit_items = []
    
    if "dog" in species_type or "canis" in species_type:
        first_aid_kit_items = ["Gauze Rolls", "Antiseptic Spray (Betadine)", "Heavy Duty Leash/Muzzle", "Thermal Blanket"]
        if "critical" in sev_level:
            directives = [
                "Apply clean sterile gauze directly to open leg lacerations, keeping pressure stable.",
                "Immobilize the patient on a flat board to prevent aggravating spine or pelvic fractures.",
                "Keep covered with a warmth sheet to tackle trauma-induced hypothermia."
            ]
            contraindications = [
                "Do NOT force-feed or offer water; could lead to airway aspiration if state is listless.",
                "Do NOT attempt to bind a muzzle if the dog has muzzle-related breathing difficulties."
            ]
        else:
            directives = [
                "Approach slowly, offering soft speech cues and showing open palms.",
                "Wrap with a loose collar to keep the dog from escaping towards dynamic roads."
            ]
            contraindications = [
                "Do NOT chase or yell if the animal exhibits high adrenaline panicking patterns."
            ]
    elif "cat" in species_type or "kitten" in species_type:
        first_aid_kit_items = ["Kitten Formula", "Soft Mesh Net", "Thick Handling Gloves", "Saline Syringes"]
        directives = [
            "Isolate the animal inside a dark, well-ventilated rescue cage to curb sensory shock.",
            "Offer warm rehydration fluids if the kitten is conscious and able to swallow."
        ]
        contraindications = [
            "Do NOT attempt rescue from deep grids with bare hands — cats often bite when terrified.",
            "Do NOT feed cow's milk which triggers severe gastrointestinal sickness in young kittens."
        ]
    else:
        first_aid_kit_items = ["Standard First-Aid Kit", "Disposable Gloves", "Hydration Formula"]
        directives = [
            "Maintain a secure cordon of 3 meters. Keep children and onlookers away.",
            "Provide hydration fluids nearby, but do not aggressively approach the subject."
        ]
        contraindications = [
            "Do NOT make sudden threatening gestures or surround the subject's egress points."
        ]
        
    return RecommendActionResponse(
        directives=directives,
        contraindications=contraindications,
        first_aid_kit_items=first_aid_kit_items
    )

@app.post("/ai/match-responders", response_model=MatchRespondersResponse)
async def match_responders(payload: MatchRespondersRequest):
    """
    Spatial recommendation engine to match optimal local rescue units and hospital desks.
    """
    # Simply generate realistic matched responders based on distance
    matches = [
        ResponderMatch(
            id="resp-match-1",
            name="Crown Veterinary Emergency Surge Post",
            type="Triage Hospital & Trauma Unit",
            phone="+91 22 6123 0000",
            distance_km=1.2,
            status="Active Duty",
            estimated_arrival_minutes=8
        ),
        ResponderMatch(
            id="resp-match-2",
            name="Stray Relief India Scout Team A",
            type="NGO Field Ambulance Squad",
            phone="+91 22 2673 0912",
            distance_km=2.7,
            status="Responding To Dispatch",
            estimated_arrival_minutes=15
        ),
        ResponderMatch(
            id="resp-match-3",
            name="RESQ Charitable Central Rescue Unit",
            type="Surgical Support Base",
            phone="+91 91722 21212",
            distance_km=4.9,
            status="Standby Ops",
            estimated_arrival_minutes=25
        )
    ]
    
    # Scale distance/arrival slightly by coordinates
    for m in matches:
        lat_diff = abs(payload.latitude - 19.05) % 0.1
        lon_diff = abs(payload.longitude - 72.84) % 0.1
        m.distance_km = round(m.distance_km + (lat_diff + lon_diff) * 15.0, 1) or 0.5
        m.estimated_arrival_minutes = max(5, int(m.distance_km * 4 + 3))

    return MatchRespondersResponse(
        incident_coordinates={"lat": payload.latitude, "lng": payload.longitude},
        matched_responders=matches,
        ambulance_allocated=(payload.severity == "Critical")
    )

@app.post("/ai/translate-guidance", response_model=TranslateGuidanceResponse)
async def translate_guidance(payload: TranslateGuidanceRequest):
    """
    Simulated translation for dynamic guidance messages.
    """
    dest = payload.target_language.lower()
    text = payload.text
    
    # Dictionary mappings for standard guidance outputs to show elegant real translation simulation
    hi_dict = {
        "apply subtle direct gauze pressure to stop vascular bleed if the subject allows.": "यदि पशु अनुमति दे, तो रक्तस्राव रोकने के लिए धुंध की पट्टी से हल्का सीधा दबाव डालें।",
        "wrap in an isothermal blanket or dry cloth to restrict shivering and physical shock.": "कंपकंपी और सदमे को कम करने के लिए थर्मल कंबल या सूखे कपड़े में लपेटें।",
        "maintain clear air passages; do not offer food or force oral fluid intake immediately.": "हवा का रास्ता साफ रखें; तुरंत भोजन या तरल पदार्थ देने का प्रयास न करें।",
        "avoid inserting metallic poles. lower a soft fabric mesh rope to allow self-climbing traction.": "धातु के डंडे डालने से बचें। खुद ऊपर चढ़ने के लिए एक मुलायम सूती जालीदार रस्सी नीचे लटकाएं।",
        "prepare warm ambient shelter to raise body core temperature post-extraction.": "बचाव के बाद शरीर का तापमान बढ़ाने के लिए गर्म और सुरक्षित आश्रय तैयार करें।",
        "prepare safe rehydration solutions (lactated ringer or sugar-water drip feeds).": "सुरक्षित रिहाइड्रेशन घोल (रिंगर लैक्टेट या चीनी-पानी का घोल) तैयार करें।"
    }
    
    bn_dict = {
        "apply subtle direct gauze pressure to stop vascular bleed if the subject allows.": "পশুটি শান্ত থাকলে রক্তপাত বন্ধ করতে সরাসরি পরিষ্কার গজ কাপড় দিয়ে হালকা চাপ দিন।",
        "wrap in an isothermal blanket or dry cloth to restrict shivering and physical shock.": "শরীর গরম রাখতে এবং শারীরিক শক কমাতে একটি শুকনো কাপড় বা থার্মাল কম্বল দিয়ে জড়িয়ে রাখুন।",
        "maintain clear air passages; do not offer food or force oral fluid intake immediately.": "শ্বাসনালী পরিষ্কার রাখুন; অবিলম্বে খাবার বা তরল মুখে দেওয়ার জোরপূর্বক চেষ্টা করবেন না।",
        "avoid inserting metallic poles. lower a soft fabric mesh rope to allow self-climbing traction.": "লোহার স্ক্রু বা রড ঢোকানো এড়িয়ে চলুন। নিজে আরোহণের সুবিধার্থে নরম সুতি জাল সদৃশ দড়ি নামিয়ে দিন।",
        "prepare warm ambient shelter to raise body core temperature post-extraction.": "উদ্ধার পরবর্তী সময়ে শিশুর শরীরের তাপমাত্রা স্বাভাবিক রাখতে উষ্ণ আরামদায়ক খাঁচার ব্যবস্থা করুন।",
        "prepare safe rehydration solutions (lactated ringer or sugar-water drip feeds).": "নিরাপদ রিহাইড্রেশন দ্রবণ (মধু-জল বা স্যালাইন রিহাইড্রেশন ড্রিপ) প্রস্তুত রাখুন।"
    }
    
    trans = text
    # Match lower key or return mock elegant standard translation
    normalized_k = text.lower().strip().rstrip(".")
    
    if dest == "hi":
        trans = hi_dict.get(normalized_k) or f"[अनुवादित: {text}]"
    elif dest == "bn":
        trans = bn_dict.get(normalized_k) or f"[অনূদিত: {text}]"
    elif dest == "en":
        trans = text
    else:
        trans = f"[Translated ({dest}): {text}]"
        
    return TranslateGuidanceResponse(
        source_language="en",
        target_language=dest,
        translated_text=trans
    )

if __name__ == "__main__":
    import uvicorn
    # Local runtime defaults
    uvicorn.run(app, host="0.0.0.0", port=8000)
