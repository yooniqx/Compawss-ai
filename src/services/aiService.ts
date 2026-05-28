/**
 * Compawss Client-Side AI Service Layer.
 * Connects securely to the FastAPI Python backend under `/backend/main.py`.
 * 
 * Rules:
 * 1. Independent & Safe: Operates normally without blocking UI if the backend is missing or offline.
 * 2. Timeout fallbacks: All calls are strictly wrapped in individual timeout controllers to avoid hanging.
 * 3. Fallback Data: Switches cleanly to standard mock heuristics decorated as "Demo AI / Backend Offline".
 */

export const BACKEND_URL = (import.meta as any).env?.VITE_AI_BACKEND_URL || '';
export const DEFAULT_TIMEOUT_MS = 3000; // Fast fail to avoid blocking user interaction

// Cache-based health status to prevent excessive repetitive ping timeouts
let cachedBackendStatusCache: { connected: boolean; checkedAt: number } | null = null;
const CACHE_TTL_MS = 15000; // Checked every 15s maximum

/**
 * Checks if the Python AI Backend is accessible.
 */
export async function checkBackendHealth(): Promise<boolean> {
  if (!BACKEND_URL) {
    return false;
  }

  const now = Date.now();
  if (cachedBackendStatusCache && (now - cachedBackendStatusCache.checkedAt) < CACHE_TTL_MS) {
    return cachedBackendStatusCache.connected;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // Super fast 1.5s timeout for health checks

  try {
    const res = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      const isHealthy = data.status === 'healthy';
      cachedBackendStatusCache = { connected: isHealthy, checkedAt: now };
      return isHealthy;
    }
  } catch (err) {
    console.debug('Python AI backend health check failed. Using fallback simulation:', err);
  }

  clearTimeout(timeoutId);
  cachedBackendStatusCache = { connected: false, checkedAt: now };
  return false;
}

/**
 * Helper to fetch with absolute timeout guards.
 */
async function apiRequest<T>(endpoint: string, payload: any, fallbackData: T): Promise<{ data: T; isLive: boolean }> {
  if (!BACKEND_URL) {
    return { data: fallbackData, isLive: false };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const json = await response.json();
      return { data: json, isLive: true };
    } else {
      console.warn(`AI backend returned code ${response.status} for ${endpoint}. Falling back.`);
    }
  } catch (error) {
    console.debug(`AI service request failed for ${endpoint} (Timeout or offline). Falling back.`, error);
  }

  clearTimeout(timeoutId);
  return { data: fallbackData, isLive: false };
}

/* ==========================================================================
   INTERACTIVE FE HANDLERS WITH GRACEFUL FAILURES
   ========================================================================== */

/**
 * 1. POST /ai/analyze-image
 * Triages an animal photo and determines its species, urgency markers, and first aid tips.
 */
export async function analyzeImage(imageB64: string, speciesHint?: string): Promise<{
  species: string;
  confidence: number;
  severity: string;
  anomalies: string;
  tags: string[];
  directives: string[];
  is_hotspot: boolean;
  isLive: boolean;
}> {
  const isDog = speciesHint?.toLowerCase().includes('dog') || false;
  const isKitten = speciesHint?.toLowerCase().includes('kitten') || speciesHint?.toLowerCase().includes('cat') || false;

  const fallback = {
    species: isKitten ? "Felis catus (Calico Kitten)" : isDog ? "Canis lupus familiaris (Shih Tzu/Stray Mix)" : "Unidentified Stray Species",
    confidence: 88.5,
    severity: isKitten ? "Urgent" : isDog ? "Critical" : "Moderate",
    anomalies: isKitten ? "Fluid loss, vocal panic, grid entrapment threat" : isDog ? "Active vascular bleeding on hind legs" : "External lesion diagnostics required",
    tags: isKitten ? ["trapped", "dehydrated", "abandoned baby"] : isDog ? ["bleeding", "unable to walk"] : ["general rescue"],
    directives: isKitten ? [
      "Avoid inserting metallic poles. Lower a soft fabric mesh rope to allow self-climbing traction.",
      "Prepare warm ambient shelter to raise body core temperature post-extraction.",
      "Prepare safe rehydration solutions."
    ] : [
      "Apply subtle direct gauze pressure to stop vascular bleed if the subject allows.",
      "Wrap in an isothermal blanket or dry cloth to restrict shivering.",
      "Maintain clear air passages."
    ],
    is_hotspot: false
  };

  const payload = { image_b64: imageB64, species_hint: speciesHint || "Unidentified Stray Species" };
  const res = await apiRequest('/ai/analyze-image', payload, fallback);
  return { ...res.data, isLive: res.isLive };
}

/**
 * 2. POST /ai/classify-report
 * Analyzes voice recordings or notes to extract keywords and urgency categories.
 */
export async function classifyReport(text: string, speciesHint?: string): Promise<{
  classification: string;
  severity: string;
  tags: string[];
  confidence: number;
  estimated_count: number;
  isLive: boolean;
}> {
  const txtLow = text.toLowerCase();
  let fallbackSeverity = "Moderate";
  let fallbackClassification = "Manual Node Setup";
  let fallbackTags = ["unknown condition"];

  if (txtLow.includes("bleed") || txtLow.includes("hit") || txtLow.includes("accident") || txtLow.includes("broken")) {
    fallbackSeverity = "Critical";
    fallbackClassification = "Canis Trauma Block";
    fallbackTags = ["bleeding", "hit by vehicle"];
  } else if (txtLow.includes("trap") || txtLow.includes("drain") || txtLow.includes("stuck")) {
    fallbackSeverity = "Urgent";
    fallbackClassification = "Feline Trap Grid";
    fallbackTags = ["trapped", "dehydrated"];
  }

  const fallback = {
    classification: fallbackClassification,
    severity: fallbackSeverity,
    tags: fallbackTags,
    confidence: 85.0,
    estimated_count: 1
  };

  const payload = { text, species_hint: speciesHint };
  const res = await apiRequest('/ai/classify-report', payload, fallback);
  return { ...res.data, isLive: res.isLive };
}

/**
 * 3. POST /ai/severity-score
 * Computes exact priority percentage indices of clinical urgency.
 */
export async function computeSeverityScore(
  species: string,
  tags: string[],
  hasVisibleBleeding: boolean,
  mobilityRestricted: boolean,
  notes = ""
): Promise<{
  severity: string;
  score: number;
  threat_factors: string[];
  escalation_required: boolean;
  isLive: boolean;
}> {
  let fallbackScore = 50.0;
  const threats: string[] = [];

  if (hasVisibleBleeding) {
    fallbackScore += 25;
    threats.push("Active Bleeding (Shock threat)");
  }
  if (mobilityRestricted) {
    fallbackScore += 20;
    threats.push("Skeletal Trauma");
  }
  if (tags.some(t => t.toLowerCase().includes("vehicle") || t.toLowerCase().includes("hit"))) {
    fallbackScore += 15;
    threats.push("Vehicular Impact");
  }

  fallbackScore = Math.min(100, Math.max(10, fallbackScore));
  const fallback = {
    severity: fallbackScore >= 80 ? "Critical" : fallbackScore >= 60 ? "Urgent" : "Moderate",
    score: fallbackScore,
    threat_factors: threats.length > 0 ? threats : ["General Injury"],
    escalation_required: fallbackScore >= 70
  };

  const payload = {
    species,
    tags,
    has_visible_bleeding: hasVisibleBleeding,
    mobility_restricted: mobilityRestricted,
    notes
  };

  const res = await apiRequest('/ai/severity-score', payload, fallback);
  return { ...res.data, isLive: res.isLive };
}

/**
 * 4. POST /ai/recommend-action
 * Fetches dynamic guidelines, contraindications, and equipment checklists.
 */
export async function recommendAction(
  species: string,
  severity: string,
  tags: string[],
  notes = ""
): Promise<{
  directives: string[];
  contraindications: string[];
  first_aid_kit_items: string[];
  isLive: boolean;
}> {
  const isKitten = species.toLowerCase().includes("cat") || species.toLowerCase().includes("kitten");
  const fallback = {
    directives: isKitten ? [
      "Avoid inserting metallic poles near the storm drain.",
      "Lower a warm mesh cloth hook.",
      "Prepare a dark dry compartment to contain sensory panic."
    ] : [
      "Prepare sterile dry cotton dressings.",
      "Wrap the torso smoothly without binding the ribs.",
      "Avoid aggressive sudden eye contact."
    ],
    contraindications: isKitten ? [
      "Do NOT pull out using mechanical ropes.",
      "Do NOT administer pasteurized cow-milk formula."
    ] : [
      "Do NOT supply oral fluid down the throat line.",
      "Do NOT force heavy movement triggers."
    ],
    first_aid_kit_items: isKitten ? [
      "Soft Mesh Handler Basket",
      "Warming Pad",
      "Rehydration Saline"
    ] : [
      "Haemorrhage Tapes",
      "Disposable Examination Gloves",
      "Sterile Antiseptic Gauze Packs"
    ]
  };

  const payload = { species, severity, tags, notes };
  const res = await apiRequest('/ai/recommend-action', payload, fallback);
  return { ...res.data, isLive: res.isLive };
}

/**
 * 5. POST /ai/match-responders
 * Requisitions nearest support coordinates & active NGO trucks.
 */
export async function matchResponders(
  latitude: number,
  longitude: number,
  severity = "Critical",
  species = "dog"
): Promise<{
  incident_coordinates: { lat: number; lng: number };
  matched_responders: Array<{
    id: string;
    name: string;
    type: string;
    phone: string;
    distance_km: number;
    status: string;
    estimated_arrival_minutes: number;
  }>;
  ambulance_allocated: boolean;
  isLive: boolean;
}> {
  const fallback = {
    incident_coordinates: { lat: latitude, lng: longitude },
    matched_responders: [
      {
        id: "resp-match-1",
        name: "Crown Veterinary Emergency Surge Post",
        type: "Triage Hospital & Trauma Unit",
        phone: "+91 22 6123 0000",
        distance_km: 1.2,
        status: "Active Duty",
        estimated_arrival_minutes: 8
      },
      {
        id: "resp-match-2",
        name: "Stray Relief India Scout Team A",
        type: "NGO Field Ambulance Squad",
        phone: "+91 22 2673 0912",
        distance_km: 2.7,
        status: "Responding To Dispatch",
        estimated_arrival_minutes: 15
      }
    ],
    ambulance_allocated: severity === "Critical"
  };

  const payload = { latitude, longitude, severity, species };
  const res = await apiRequest('/ai/match-responders', payload, fallback);
  return { ...res.data, isLive: res.isLive };
}

/**
 * 6. POST /ai/translate-guidance
 * Uses region dialects to translate directives quickly (e.g., to Bengali, Hindi).
 */
export async function translateGuidance(
  text: string,
  targetLanguage: string
): Promise<{
  source_language: string;
  target_language: string;
  translated_text: string;
  isLive: boolean;
}> {
  const hi_dict: Record<string, string> = {
    "apply subtle direct gauze pressure to stop vascular bleed if the subject allows.": "यदि पशु अनुमति दे, तो रक्तस्राव रोकने के लिए धुंध की पट्टी से हल्का सीधा दबाव डालें।",
    "wrap in an isothermal blanket or dry cloth to restrict shivering and physical shock.": "कंपकंपी और सदमे को कम करने के लिए थर्मल कंबल या सूखे कपड़े में लपेटें।",
    "maintain clear air passages; do not offer food or force oral fluid intake immediately.": "हवा का रास्ता साफ रखें; तुरंत भोजन या तरल पदार्थ देने का प्रयास न करें।",
    "avoid inserting metallic poles. lower a soft fabric mesh rope to allow self-climbing traction.": "धातु के डंडे डालने से बचें। खुद ऊपर चढ़ने के लिए एक मुलायम सूती जालीदार रस्सी नीचे लटकाएं।",
    "prepare warm ambient shelter to raise body core temperature post-extraction.": "बचाव के बाद शरीर का तापमान बढ़ाने के लिए गर्म और सुरक्षित आश्रय तैयार करें।",
    "prepare safe rehydration solutions.": "सुरक्षित रिहाइड्रेशन घोल (चीनी-पानी का घोल) तैयार करें।"
  };

  const bn_dict: Record<string, string> = {
    "apply subtle direct gauze pressure to stop vascular bleed if the subject allows.": "পশুটি শান্ত থাকলে রক্তপাত বন্ধ করতে সরাসরি পরিষ্কার গজ কাপড় দিয়ে হালকা চাপ দিন।",
    "wrap in an isothermal blanket or dry cloth to restrict shivering and physical shock.": "শরীর গরম রাখতে এবং শারীরিক শক কমাতে একটি শুকনো কাপড় বা থার্মাল কম্বল দিয়ে জড়িয়ে রাখুন।",
    "maintain clear air passages; do not offer food or force oral fluid intake immediately.": "শ্বাসনালী পরিষ্কার রাখুন; অবিলম্বে খাবার বা তরল মুখে দেওয়ার জোরপূর্বক চেষ্টা করবেন না।",
    "avoid inserting metallic poles. lower a soft fabric mesh rope to allow self-climbing traction.": "লোহার স্ক্রু বা রড ঢোকানো এড়িয়ে চলুন। নিজে আরোহণের সুবিধার্থে নরম সুতি জাল সদৃশ দড়ি নামিয়ে দিন।",
    "prepare warm ambient shelter to raise body core temperature post-extraction.": "উদ্ধার পরবর্তী সময়ে শিশুর শরীরের তাপমাত্রা স্বাভাবিক রাখতে উষ্ণ আরামদায়ক খাঁচার ব্যবস্থা করুন।",
    "prepare safe rehydration solutions.": "নিরাপদ রিহাইড্রেশন দ্রবণ প্রস্তুত রাখুন।"
  };

  const normalized = text.toLowerCase().trim().replace(/\.$/, '');
  let trans = text;
  if (targetLanguage === 'hi') {
    trans = hi_dict[normalized] || `[अमरीका अनुवाद: ${text}]`;
  } else if (targetLanguage === 'bn') {
    trans = bn_dict[normalized] || `[অনূদিত নির্দেশ: ${text}]`;
  }

  const fallback = {
    source_language: "en",
    target_language: targetLanguage,
    translated_text: trans
  };

  const payload = { text, target_language: targetLanguage };
  const res = await apiRequest('/ai/translate-guidance', payload, fallback);
  return { ...res.data, isLive: res.isLive };
}
