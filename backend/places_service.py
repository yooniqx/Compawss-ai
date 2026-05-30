"""
Google Places API Integration for India-wide Animal Rescue Directory
Supports veterinary clinics, animal hospitals, NGOs, and shelters across all Indian cities
"""
import httpx
import os
import re
from typing import Optional, List, Dict, Tuple
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file in backend directory
backend_dir = Path(__file__).parent
env_path = backend_dir / '.env'
load_dotenv(dotenv_path=env_path)

# Support both environment variable names
GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY") or os.getenv("GOOGLE_MAPS_PLATFORM_KEY")

# Debug: Print API key status at module load
if GOOGLE_API_KEY:
    print(f"[PLACES_SERVICE] Google API key loaded successfully (length: {len(GOOGLE_API_KEY)})")
else:
    print(f"[PLACES_SERVICE] WARNING: Google API key not found in environment")
    print(f"[PLACES_SERVICE] Checked: GOOGLE_PLACES_API_KEY, GOOGLE_MAPS_PLATFORM_KEY")
    print(f"[PLACES_SERVICE] .env path: {env_path}")

# Indian cities and common localities for location extraction
INDIAN_CITIES = [
    "mumbai", "delhi", "bangalore", "bengaluru", "kolkata", "chennai", "hyderabad",
    "pune", "ahmedabad", "surat", "jaipur", "lucknow", "kanpur", "nagpur", "indore",
    "thane", "bhopal", "visakhapatnam", "pimpri-chinchwad", "patna", "vadodara",
    "ghaziabad", "ludhiana", "agra", "nashik", "faridabad", "meerut", "rajkot",
    "kalyan-dombivali", "vasai-virar", "varanasi", "srinagar", "aurangabad", "dhanbad",
    "amritsar", "navi mumbai", "allahabad", "prayagraj", "ranchi", "howrah", "coimbatore",
    "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur", "kota",
    "guwahati", "chandigarh", "solapur", "hubballi-dharwad", "tiruchirappalli", "tiruppur",
    "moradabad", "mysore", "mysuru", "bareilly", "gurgaon", "gurugram", "aligarh",
    "jalandhar", "bhubaneswar", "salem", "mira-bhayandar", "warangal", "thiruvananthapuram",
    "guntur", "bhiwandi", "saharanpur", "gorakhpur", "bikaner", "amravati", "noida",
    "jamshedpur", "bhilai", "cuttack", "firozabad", "kochi", "cochin", "nellore",
    "bhavnagar", "dehradun", "durgapur", "asansol", "rourkela", "nanded", "kolhapur",
    "ajmer", "akola", "gulbarga", "jamnagar", "ujjain", "loni", "siliguri", "jhansi",
    "ulhasnagar", "jammu", "sangli-miraj-kupwad", "mangalore", "erode", "belgaum",
    "ambattur", "tirunelveli", "malegaon", "gaya", "jalgaon", "udaipur", "maheshtala"
]

# Common locality patterns
LOCALITY_KEYWORDS = [
    "near", "in", "at", "around", "close to", "locality", "area", "sector",
    "nagar", "puram", "bagh", "ganj", "colony", "vihar", "enclave", "extension"
]

def extract_location_from_query(query: str) -> Optional[str]:
    """
    Extract location (city/locality) from user query.
    Supports all Indian cities and common locality patterns.
    
    Examples:
        "vet in Mumbai" -> "Mumbai"
        "animal hospital Kolkata" -> "Kolkata"
        "NGO near Salt Lake" -> "Salt Lake"
        "emergency vet Bandra Mumbai" -> "Bandra Mumbai"
    """
    query_lower = query.lower()
    
    # Check for explicit city mentions
    for city in INDIAN_CITIES:
        if city in query_lower:
            # Find the city position
            city_pos = query_lower.find(city)
            
            # Check if there's a locality word before the city (within 2 words)
            # e.g., "Salt Lake Kolkata", "Bandra Mumbai"
            words_before = query_lower[:city_pos].strip().split()
            
            # If there are 1-2 words immediately before the city, include them
            if len(words_before) >= 1:
                last_word = words_before[-1]
                # Check if last word looks like a locality (not a common word)
                common_words = ['in', 'at', 'near', 'from', 'to', 'the', 'a', 'an', 'for', 'of', 'vet', 'ngo', 'hospital', 'clinic', 'shelter', 'animal', 'pet', 'emergency']
                if last_word not in common_words and len(last_word) > 2:
                    # Include locality + city
                    if len(words_before) >= 2:
                        second_last = words_before[-2]
                        if second_last not in common_words and len(second_last) > 2:
                            location = f"{second_last} {last_word} {city}"
                            return location.title()
                    location = f"{last_word} {city}"
                    return location.title()
            
            # Just return the city
            return city.title()
    
    # Check for "near X" or "in X" patterns
    for keyword in LOCALITY_KEYWORDS:
        pattern = rf'{keyword}\s+([A-Za-z\s]+?)(?:\s+(?:city|area|locality|sector))?(?:\s|$|,|\?)'
        match = re.search(pattern, query, re.IGNORECASE)
        if match:
            location = match.group(1).strip()
            if len(location) > 2:  # Avoid single letters
                return location.title()
    
    return None

def classify_place_type(query: str) -> Tuple[str, List[str]]:
    """
    Classify what type of place the user is looking for.
    Returns (primary_type, search_keywords)
    
    Types:
        - veterinary_care: vets, animal hospitals, pet clinics
        - animal_ngo: NGOs, shelters, rescue organizations
        - emergency: emergency vets, 24/7 clinics
    """
    query_lower = query.lower()
    
    # Emergency veterinary care
    if any(word in query_lower for word in ["emergency", "urgent", "24/7", "24 hour", "immediate"]):
        return "emergency", ["emergency veterinary", "24 hour animal hospital", "emergency pet clinic"]
    
    # NGO/Shelter/Rescue
    if any(word in query_lower for word in ["ngo", "shelter", "rescue", "adoption", "stray", "welfare"]):
        return "animal_ngo", ["animal ngo", "animal shelter", "animal rescue", "stray animal", "animal welfare"]
    
    # Veterinary care (default)
    if any(word in query_lower for word in ["vet", "veterinary", "animal hospital", "pet clinic", "animal doctor"]):
        return "veterinary_care", ["veterinary clinic", "animal hospital", "pet clinic", "veterinary doctor"]
    
    # Default to veterinary care
    return "veterinary_care", ["veterinary clinic", "animal hospital"]

async def search_places_text(query: str, location: str) -> Dict:
    """
    Search for places using Google Places Text Search API.
    Supports India-wide search with any city/locality.
    
    Args:
        query: Search query (e.g., "veterinary clinic", "animal NGO")
        location: Location string (e.g., "Mumbai", "Salt Lake Kolkata")
    
    Returns:
        Dict with status, results, and metadata
    """
    print(f"[PLACES] search_places_text called")
    print(f"[PLACES] Query: {query}")
    print(f"[PLACES] Location: {location}")
    print(f"[PLACES] API key configured: {bool(GOOGLE_API_KEY)}")
    
    if not GOOGLE_API_KEY:
        print("[PLACES ERROR] API key not configured")
        return {
            "status": "error",
            "error": "Google Places API key not configured",
            "results": [],
            "api_key_configured": False
        }
    
    try:
        # Build search query with location
        search_query = f"{query} in {location}, India"
        print(f"[PLACES] Full search query: {search_query}")
        
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params = {
            "query": search_query,
            "key": GOOGLE_API_KEY,
            "region": "in"  # Bias results to India
        }
        
        # Log request details (without exposing full API key)
        api_key_preview = f"{GOOGLE_API_KEY[:8]}...{GOOGLE_API_KEY[-4:]}" if len(GOOGLE_API_KEY) > 12 else "***"
        print(f"[PLACES] Request URL: {url}")
        print(f"[PLACES] API key preview: {api_key_preview}")
        print(f"[PLACES] Region: in")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            print(f"[PLACES] Sending request to Google Places API...")
            response = await client.get(url, params=params)
            print(f"[PLACES] Response status code: {response.status_code}")
            
            if response.status_code != 200:
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                print(f"[PLACES ERROR] {error_msg}")
                return {
                    "status": "error",
                    "error": error_msg,
                    "results": [],
                    "api_key_configured": True
                }
            
            data = response.json()
            google_status = data.get("status")
            print(f"[PLACES] Google API status: {google_status}")
            
            if google_status == "OK":
                results = []
                raw_results = data.get("results", [])
                print(f"[PLACES] Raw results count: {len(raw_results)}")
                
                for place in raw_results[:10]:  # Top 10 results
                    results.append({
                        "name": place.get("name"),
                        "address": place.get("formatted_address"),
                        "rating": place.get("rating"),
                        "user_ratings_total": place.get("user_ratings_total"),
                        "place_id": place.get("place_id"),
                        "types": place.get("types", []),
                        "location": place.get("geometry", {}).get("location", {})
                    })
                
                print(f"[PLACES] Successfully parsed {len(results)} results")
                return {
                    "status": "success",
                    "results": results,
                    "total_results": len(results),
                    "search_query": search_query,
                    "api_key_configured": True
                }
            elif google_status == "ZERO_RESULTS":
                print(f"[PLACES] No results found for query")
                return {
                    "status": "no_results",
                    "error": "ZERO_RESULTS",
                    "results": [],
                    "search_query": search_query,
                    "api_key_configured": True
                }
            elif google_status == "REQUEST_DENIED":
                error_message = data.get("error_message", "Request denied")
                print(f"[PLACES ERROR] REQUEST_DENIED: {error_message}")
                return {
                    "status": "error",
                    "error": f"REQUEST_DENIED: {error_message}",
                    "results": [],
                    "search_query": search_query,
                    "api_key_configured": True
                }
            else:
                error_message = data.get("error_message", google_status)
                print(f"[PLACES ERROR] Google API error: {google_status} - {error_message}")
                return {
                    "status": "error",
                    "error": f"{google_status}: {error_message}",
                    "results": [],
                    "search_query": search_query,
                    "api_key_configured": True
                }
    
    except httpx.TimeoutException as e:
        print(f"[PLACES ERROR] Request timeout: {e}")
        return {
            "status": "error",
            "error": f"Request timeout: {str(e)}",
            "results": [],
            "api_key_configured": True
        }
    except Exception as e:
        print(f"[PLACES ERROR] Unexpected error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {
            "status": "error",
            "error": f"{type(e).__name__}: {str(e)}",
            "results": [],
            "api_key_configured": True
        }

async def search_places_nearby(latitude: float, longitude: float, place_type: str, radius: int = 5000) -> Dict:
    """
    Search for places near GPS coordinates using Google Places Nearby Search API.
    
    Args:
        latitude: GPS latitude
        longitude: GPS longitude
        place_type: Type of place (e.g., "veterinary_care")
        radius: Search radius in meters (default 5km)
    
    Returns:
        Dict with status, results, and metadata
    """
    if not GOOGLE_API_KEY:
        return {
            "status": "error",
            "error": "Google Places API key not configured",
            "results": [],
            "api_key_configured": False
        }
    
    try:
        # Map our types to Google Places types
        type_mapping = {
            "veterinary_care": "veterinary_care",
            "animal_ngo": "veterinary_care",  # Google doesn't have NGO type, use vet as proxy
            "emergency": "veterinary_care"
        }
        
        google_type = type_mapping.get(place_type, "veterinary_care")
        
        url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        params = {
            "location": f"{latitude},{longitude}",
            "radius": radius,
            "type": google_type,
            "key": GOOGLE_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                return {
                    "status": "error",
                    "error": f"HTTP {response.status_code}: {response.text}",
                    "results": [],
                    "api_key_configured": True
                }
            
            data = response.json()
            
            if data.get("status") == "OK":
                results = []
                for place in data.get("results", [])[:10]:  # Top 10 results
                    results.append({
                        "name": place.get("name"),
                        "address": place.get("vicinity"),
                        "rating": place.get("rating"),
                        "user_ratings_total": place.get("user_ratings_total"),
                        "place_id": place.get("place_id"),
                        "types": place.get("types", []),
                        "location": place.get("geometry", {}).get("location", {}),
                        "open_now": place.get("opening_hours", {}).get("open_now")
                    })
                
                return {
                    "status": "success",
                    "results": results,
                    "total_results": len(results),
                    "search_location": {"lat": latitude, "lng": longitude},
                    "search_radius_meters": radius,
                    "api_key_configured": True
                }
            else:
                return {
                    "status": "no_results",
                    "error": data.get("status"),
                    "results": [],
                    "api_key_configured": True
                }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "results": [],
            "api_key_configured": True
        }

async def get_place_details(place_id: str) -> Dict:
    """
    Get detailed information about a specific place.
    
    Args:
        place_id: Google Places ID
    
    Returns:
        Dict with detailed place information
    """
    if not GOOGLE_API_KEY:
        return {
            "status": "error",
            "error": "Google Places API key not configured"
        }
    
    try:
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_address,formatted_phone_number,opening_hours,rating,user_ratings_total,website,geometry",
            "key": GOOGLE_API_KEY
        }
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code != 200:
                return {
                    "status": "error",
                    "error": f"HTTP {response.status_code}"
                }
            
            data = response.json()
            
            if data.get("status") == "OK":
                result = data.get("result", {})
                return {
                    "status": "success",
                    "name": result.get("name"),
                    "address": result.get("formatted_address"),
                    "phone": result.get("formatted_phone_number"),
                    "website": result.get("website"),
                    "rating": result.get("rating"),
                    "user_ratings_total": result.get("user_ratings_total"),
                    "opening_hours": result.get("opening_hours", {}).get("weekday_text", []),
                    "location": result.get("geometry", {}).get("location", {})
                }
            else:
                return {
                    "status": "error",
                    "error": data.get("status")
                }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

# Made with Bob
