"""
Test script for Google Places API integration
"""
import requests
import json
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')  # type: ignore
    except AttributeError:
        pass  # Python < 3.7

BASE_URL = "http://localhost:8000"

def test_debug_places():
    """Test the /debug/places endpoint"""
    print("\n" + "="*80)
    print("TESTING GOOGLE PLACES API INTEGRATION")
    print("="*80)
    
    test_queries = [
        "animal hospital Kolkata",
        "emergency vet Mumbai",
        "NGO for injured dogs Delhi",
        "pet clinic Bangalore",
        "veterinary clinic near Salt Lake",
        "animal shelter Chennai"
    ]
    
    for query in test_queries:
        print(f"\n{'-'*80}")
        print(f"Query: {query}")
        print(f"{'-'*80}")
        
        try:
            response = requests.get(f"{BASE_URL}/debug/places", params={"query": query}, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                print(f"[OK] Status: {response.status_code}")
                print(f"  API Key Configured: {data.get('places_api_key_configured')}")
                print(f"  API Key Source: {data.get('places_api_key_source')}")
                print(f"  Location Extracted: {data.get('location_extracted')}")
                print(f"  Place Type: {data.get('place_type')}")
                print(f"  Search Keywords: {data.get('search_keywords')}")
                print(f"  API Request Sent: {data.get('api_request_sent')}")
                print(f"  API Response Status: {data.get('api_response_status')}")
                print(f"  Results Count: {data.get('results_count')}")
                
                if data.get('error'):
                    print(f"  [WARN] Error: {data.get('error')}")
                
                if data.get('results'):
                    print(f"\n  Top Results:")
                    for i, result in enumerate(data['results'], 1):
                        print(f"    {i}. {result.get('name')}")
                        print(f"       Address: {result.get('address')}")
                        print(f"       Rating: {result.get('rating', 'N/A')}")
                        print(f"       Place ID: {result.get('place_id')}")
            else:
                print(f"[ERROR] Status: {response.status_code}")
                print(f"  Error: {response.text}")
        
        except requests.exceptions.Timeout:
            print(f"[ERROR] Request timed out")
        except Exception as e:
            print(f"[ERROR] Error: {e}")
    
    print(f"\n{'='*80}")
    print("TEST COMPLETE")
    print(f"{'='*80}\n")

if __name__ == "__main__":
    try:
        test_debug_places()
    except requests.exceptions.ConnectionError:
        print("\n[ERROR] Could not connect to backend server at http://localhost:8000")
        print("  Make sure the server is running with: python backend/main_grounded.py\n")
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}\n")

# Made with Bob
