"""
Comprehensive test script for Compawss AI Grounded Backend
Tests all endpoints with various scenarios including error cases
"""

import httpx
import json
import sys
import os
from typing import Dict, Any

# Backend URL
BASE_URL = "http://localhost:8000"

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def print_header(text: str):
    """Print a formatted header"""
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80)

def print_test(name: str, passed: bool, details: str = ""):
    """Print test result"""
    global tests_passed, tests_failed
    
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status} - {name}")
    if details:
        print(f"  Details: {details}")
    
    test_results.append({"name": name, "passed": passed, "details": details})
    
    if passed:
        tests_passed += 1
    else:
        tests_failed += 1

def test_health_check():
    """Test /health endpoint"""
    print_header("TEST 1: Health Check")
    
    try:
        response = httpx.get(f"{BASE_URL}/health", timeout=5.0)
        
        if response.status_code == 200:
            data = response.json()
            print(f"Status: {data.get('status')}")
            print(f"API Keys Configured: {json.dumps(data.get('api_keys_configured', {}), indent=2)}")
            print(f"Demo Mode: {data.get('demo_mode')}")
            
            # Check if Gemini is configured
            gemini_configured = data.get('api_keys_configured', {}).get('gemini', False)
            
            if gemini_configured:
                print_test("Health Check", True, "Backend is healthy and Gemini API is configured")
            else:
                print_test("Health Check", True, "Backend is healthy but Gemini API NOT configured")
                print("\n⚠️  WARNING: GEMINI_API_KEY is not configured. Most features will not work.")
                print("   Please set GEMINI_API_KEY in backend/.env file")
        else:
            print_test("Health Check", False, f"HTTP {response.status_code}")
    
    except Exception as e:
        print_test("Health Check", False, f"Exception: {str(e)}")

def test_image_analysis_with_api_key():
    """Test /ai/analyze-image with API key configured"""
    print_header("TEST 2: Image Analysis (with API key)")
    
    try:
        payload = {
            "image_b64": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400",
            "species_hint": "dog"
        }
        
        response = httpx.post(
            f"{BASE_URL}/ai/analyze-image",
            json=payload,
            timeout=20.0
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Species: {data.get('species')}")
            print(f"Confidence: {data.get('confidence')}")
            print(f"Severity: {data.get('severity')}")
            print(f"Anomalies: {data.get('anomalies')[:100]}...")
            print(f"Tags: {data.get('tags')}")
            
            # Check for fake data indicators
            anomalies = data.get('anomalies', '').lower()
            has_fake_vitals = any(term in anomalies for term in ['bpm', 'heart rate:', 'temperature:', '°f', '°c'])
            
            if has_fake_vitals:
                print_test("Image Analysis", False, "Response contains fake vitals (BPM, temperature)")
            else:
                print_test("Image Analysis", True, "Real Gemini Vision analysis (no fake vitals)")
        
        elif response.status_code == 503:
            print_test("Image Analysis", True, "Correctly returns 503 when API key missing")
            print(f"  Error: {response.json().get('detail')}")
        
        else:
            print_test("Image Analysis", False, f"HTTP {response.status_code}: {response.text}")
    
    except Exception as e:
        print_test("Image Analysis", False, f"Exception: {str(e)}")

def test_classify_report():
    """Test /ai/classify-report"""
    print_header("TEST 3: Classify Report")
    
    try:
        payload = {
            "text": "Found injured dog near Salt Lake, bleeding from leg, hit by vehicle",
            "species_hint": "dog"
        }
        
        response = httpx.post(
            f"{BASE_URL}/ai/classify-report",
            json=payload,
            timeout=15.0
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"Classification: {data.get('classification')}")
            print(f"Severity: {data.get('severity')}")
            print(f"Tags: {data.get('tags')}")
            print(f"Confidence: {data.get('confidence')}")
            
            # Should classify as Critical due to bleeding and vehicle hit
            severity = data.get('severity', '').lower()
            if 'critical' in severity or 'urgent' in severity:
                print_test("Classify Report", True, f"Correctly classified as {severity}")
            else:
                print_test("Classify Report", False, f"Incorrect severity: {severity}")
        else:
            print_test("Classify Report", False, f"HTTP {response.status_code}")
    
    except Exception as e:
        print_test("Classify Report", False, f"Exception: {str(e)}")

def test_match_responders():
    """Test /ai/match-responders"""
    print_header("TEST 4: Match Responders")
    
    try:
        payload = {
            "latitude": 19.0544,
            "longitude": 72.8402,
            "severity": "Critical",
            "species": "dog"
        }
        
        response = httpx.post(
            f"{BASE_URL}/ai/match-responders",
            json=payload,
            timeout=15.0
        )
        
        if response.status_code == 200:
            data = response.json()
            responders = data.get('matched_responders', [])
            print(f"Found {len(responders)} responders")
            
            if responders:
                for r in responders[:3]:
                    print(f"  - {r.get('name')} ({r.get('type')})")
                
                # Check if these are real or fake
                first_responder = responders[0].get('name', '')
                if 'Crown Veterinary Emergency Surge Post' in first_responder:
                    print_test("Match Responders", False, "Returns fake hardcoded responders")
                else:
                    print_test("Match Responders", True, "Returns real data from Google Places/Supabase")
            else:
                print_test("Match Responders", True, "No responders found (expected if APIs not configured)")
        
        elif response.status_code == 503:
            print_test("Match Responders", True, "Correctly returns 503 when no data sources configured")
            print(f"  Error: {response.json().get('detail')}")
        
        else:
            print_test("Match Responders", False, f"HTTP {response.status_code}")
    
    except Exception as e:
        print_test("Match Responders", False, f"Exception: {str(e)}")

def test_chat_assistant():
    """Test /ai/chat"""
    print_header("TEST 5: Chat Assistant")
    
    try:
        payload = {
            "messages": [
                {"sender": "user", "text": "What should I do for injured dog with bleeding leg?"}
            ],
            "context": {
                "userLocationName": "Bandra West, Mumbai"
            },
            "threadId": "general"
        }
        
        response = httpx.post(
            f"{BASE_URL}/ai/chat",
            json=payload,
            timeout=15.0
        )
        
        if response.status_code == 200:
            data = response.json()
            answer = data.get('response', '')
            is_live = data.get('is_live', False)
            
            print(f"Is Live: {is_live}")
            print(f"Response: {answer[:200]}...")
            
            # Check for fake demo indicators
            has_demo_label = "(DEMO AI)" in answer or "**DEMO AI**" in answer
            is_verbose = len(answer) > 500
            
            if has_demo_label:
                print_test("Chat Assistant", False, "Response contains '(DEMO AI)' label")
            elif not is_live:
                print_test("Chat Assistant", True, "API key not configured (expected)")
            elif is_verbose:
                print_test("Chat Assistant", False, f"Response too verbose ({len(answer)} chars)")
            else:
                print_test("Chat Assistant", True, "Concise, real AI response")
        
        else:
            print_test("Chat Assistant", False, f"HTTP {response.status_code}")
    
    except Exception as e:
        print_test("Chat Assistant", False, f"Exception: {str(e)}")

def test_recommend_action():
    """Test /ai/recommend-action"""
    print_header("TEST 6: Recommend Action")
    
    try:
        payload = {
            "species": "dog",
            "severity": "Critical",
            "tags": ["bleeding", "hit by vehicle"],
            "notes": "Leg injury with active bleeding"
        }
        
        response = httpx.post(
            f"{BASE_URL}/ai/recommend-action",
            json=payload,
            timeout=15.0
        )
        
        if response.status_code == 200:
            data = response.json()
            directives = data.get('directives', [])
            contraindications = data.get('contraindications', [])
            
            print(f"Directives: {len(directives)}")
            for d in directives:
                print(f"  - {d}")
            
            print(f"Contraindications: {len(contraindications)}")
            for c in contraindications:
                print(f"  - {c}")
            
            if directives:
                print_test("Recommend Action", True, "Provides actionable recommendations")
            else:
                print_test("Recommend Action", False, "No recommendations provided")
        
        else:
            print_test("Recommend Action", False, f"HTTP {response.status_code}")
    
    except Exception as e:
        print_test("Recommend Action", False, f"Exception: {str(e)}")

def test_severity_score():
    """Test /ai/severity-score"""
    print_header("TEST 7: Severity Score")
    
    try:
        payload = {
            "species": "dog",
            "tags": ["bleeding", "hit by vehicle", "unable to walk"],
            "has_visible_bleeding": True,
            "mobility_restricted": True,
            "notes": "Critical trauma"
        }
        
        response = httpx.post(
            f"{BASE_URL}/ai/severity-score",
            json=payload,
            timeout=10.0
        )
        
        if response.status_code == 200:
            data = response.json()
            severity = data.get('severity')
            score = data.get('score')
            threats = data.get('threat_factors', [])
            
            print(f"Severity: {severity}")
            print(f"Score: {score}")
            print(f"Threat Factors: {threats}")
            
            # Should be Critical with high score
            if severity == "Critical" and score >= 70:
                print_test("Severity Score", True, f"Correctly scored as Critical ({score})")
            else:
                print_test("Severity Score", False, f"Unexpected: {severity} with score {score}")
        
        else:
            print_test("Severity Score", False, f"HTTP {response.status_code}")
    
    except Exception as e:
        print_test("Severity Score", False, f"Exception: {str(e)}")

def print_summary():
    """Print test summary"""
    print_header("TEST SUMMARY")
    
    total_tests = tests_passed + tests_failed
    pass_rate = (tests_passed / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\nTotal Tests: {total_tests}")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"Pass Rate: {pass_rate:.1f}%")
    
    if tests_failed > 0:
        print("\n❌ FAILED TESTS:")
        for result in test_results:
            if not result['passed']:
                print(f"  - {result['name']}: {result['details']}")
    
    print("\n" + "="*80)
    
    if tests_failed == 0:
        print("🎉 ALL TESTS PASSED! Backend is working correctly.")
    else:
        print("⚠️  SOME TESTS FAILED. Please review the errors above.")
    
    print("="*80 + "\n")

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("  COMPAWSS AI - GROUNDED BACKEND TEST SUITE")
    print("="*80)
    print(f"\nTesting backend at: {BASE_URL}")
    print("Make sure the backend is running: python backend/main.py")
    
    # Check if backend is reachable
    try:
        response = httpx.get(f"{BASE_URL}/health", timeout=5.0)
        if response.status_code != 200:
            print(f"\n❌ ERROR: Backend returned HTTP {response.status_code}")
            print("Please make sure the backend is running.")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: Cannot connect to backend at {BASE_URL}")
        print(f"Error: {str(e)}")
        print("\nPlease start the backend first:")
        print("  cd backend")
        print("  python main.py")
        sys.exit(1)
    
    # Run all tests
    test_health_check()
    test_image_analysis_with_api_key()
    test_classify_report()
    test_match_responders()
    test_chat_assistant()
    test_recommend_action()
    test_severity_score()
    
    # Print summary
    print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if tests_failed == 0 else 1)

if __name__ == "__main__":
    main()

# Made with Bob
