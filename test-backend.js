// Test script to verify backend connection and responses
const BACKEND_URL = "https://compawss-ai.onrender.com";

async function testBackendHealth() {
  console.log("\n=== Testing Backend Health ===");
  console.log(`Target: ${BACKEND_URL}/health`);
  
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    console.log("Status Code:", response.status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
    console.log("Has 'status' field:", !!data.status);
    console.log("Has 'ready' field:", !!data.ready);
    console.log("Status value:", data.status);
    console.log("Ready value:", data.ready);
    
    // Test the logic from aiService.ts
    const statusLower = String(data.status || "").toLowerCase();
    const matchesStatus = ["ok", "healthy", "online"].includes(statusLower);
    const isReady = data.ready === true;
    const isOnline = (response.status === 200) || matchesStatus || isReady;
    
    console.log("\nLogic Test:");
    console.log("- HTTP 200?", response.status === 200);
    console.log("- Status matches?", matchesStatus);
    console.log("- Ready is true?", isReady);
    console.log("- Final isOnline:", isOnline);
    
    return isOnline;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

async function testChatEndpoint() {
  console.log("\n=== Testing Chat Endpoint ===");
  
  const payload = {
    messages: [
      { sender: "user", text: "Hello, I need help with an injured dog" }
    ],
    context: {
      userLocationName: "Bandra, Mumbai"
    },
    threadId: "general"
  };
  
  try {
    console.log("Sending request to /ai/chat...");
    const response = await fetch(`${BACKEND_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Status Code:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("Has response text:", !!data.response);
    console.log("Is live:", data.is_live);
    
    return response.ok;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

async function testImageAnalysis() {
  console.log("\n=== Testing Image Analysis ===");
  
  // Use a small test image URL
  const testImageUrl = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400";
  
  const payload = {
    image_b64: testImageUrl,
    species_hint: "Dog"
  };
  
  try {
    console.log("Sending request to /ai/analyze-image...");
    const response = await fetch(`${BACKEND_URL}/ai/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log("Status Code:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
    console.log("Species:", data.species);
    console.log("Confidence:", data.confidence);
    console.log("Severity:", data.severity);
    
    return response.ok;
  } catch (error) {
    console.error("Error:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("Starting Backend Integration Tests...\n");
  
  const healthOk = await testBackendHealth();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const chatOk = await testChatEndpoint();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const imageOk = await testImageAnalysis();
  
  console.log("\n=== Test Summary ===");
  console.log("Health Check:", healthOk ? "✓ PASS" : "✗ FAIL");
  console.log("Chat Endpoint:", chatOk ? "✓ PASS" : "✗ FAIL");
  console.log("Image Analysis:", imageOk ? "✓ PASS" : "✗ FAIL");
}

runAllTests();

// Made with Bob
