"""
Test script for knowledge base endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_intent_classification():
    """Test intent classification endpoint"""
    print("\n=== Testing Intent Classification ===")
    
    test_queries = [
        "what should I do if a dog is bleeding?",
        "how to help a dehydrated stray cat?",
        "emergency vet in Mumbai",
        "NGO near Salt Lake Kolkata"
    ]
    
    for query in test_queries:
        response = requests.get(f"{BASE_URL}/ai/intent", params={"query": query})
        print(f"\nQuery: {query}")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Intent: {data['intent']}")
            print(f"Confidence: {data['confidence']}")
            print(f"Keywords: {data['keywords_matched']}")
        else:
            print(f"Error: {response.text}")

def test_knowledge_retrieval():
    """Test knowledge base retrieval endpoint"""
    print("\n\n=== Testing Knowledge Retrieval ===")
    
    test_queries = [
        ("bleeding dog", None),
        ("dehydration symptoms", "first_aid"),
        ("fracture", None),
        ("newborn puppy", "pet_care")
    ]
    
    for query, intent in test_queries:
        params = {"query": query}
        if intent:
            params["intent"] = intent
        
        response = requests.get(f"{BASE_URL}/ai/knowledge", params=params)
        print(f"\nQuery: {query} (Intent: {intent or 'auto'})")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Total found: {data['total_found']}")
            for entry in data['entries']:
                print(f"  - {entry.get('intent', 'N/A')} (Emergency: {entry.get('emergency_level', 'N/A')})")
                keywords = entry.get('keywords', [])
                if keywords:
                    print(f"    Keywords: {', '.join(keywords[:5])}")
                guidance_preview = entry.get('guidance', '')[:100].replace('\n', ' ')
                print(f"    Guidance: {guidance_preview}...")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    try:
        test_intent_classification()
        test_knowledge_retrieval()
        print("\n\n=== All Tests Complete ===\n")
    except requests.exceptions.ConnectionError:
        print("\nError: Could not connect to backend server at http://localhost:8000")
        print("Make sure the server is running with: python backend/main_grounded.py")
    except Exception as e:
        print(f"\nError: {e}")

# Made with Bob
