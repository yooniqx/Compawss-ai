import express from "express";
import path from "path";
import { spawn, exec } from "child_process";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Setup JSON body parsing with large limit for base64 images
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// --- Start and Monitor Python FastAPI daemon in background ---
let pythonProcess: any = null;
let isPythonInstalled = false;

function startPythonBackend() {
  console.log("[Manager] Starting Python FastAPI daemon...");
  
  // Try python3 first
  pythonProcess = spawn("python3", [
    "-m", "uvicorn", 
    "backend.main:app", 
    "--host", "127.0.0.1", 
    "--port", "8000"
  ]);

  pythonProcess.stdout.on("data", (data: any) => {
    console.log(`[Python Stdout] ${data.toString().trim()}`);
  });

  pythonProcess.stderr.on("data", (data: any) => {
    console.warn(`[Python Stderr] ${data.toString().trim()}`);
  });

  pythonProcess.on("close", (code: number) => {
    console.warn(`[Python Process] Exited with code ${code}.`);
    if (code !== null && code !== 0) {
      console.log("[Manager] Attempting fallback launch via standard 'python' command...");
      pythonProcess = spawn("python", [
        "-m", "uvicorn", 
        "backend.main:app", 
        "--host", "127.0.0.1", 
        "--port", "8000"
      ]);
      
      pythonProcess.stdout.on("data", (d: any) => console.log(`[Python Stdout] ${d.toString().trim()}`));
      pythonProcess.stderr.on("data", (d: any) => console.warn(`[Python Stderr] ${d.toString().trim()}`));
    }
  });
}

// Background asynchronous installation of Python packages
console.log("[Manager] Checking/Installing FastAPI python requirements asynchronously...");
exec("pip3 install -r requirements.txt", (err, stdout, stderr) => {
  if (err) {
    console.error("[Manager] pip3 install returned non-zero code. Trying standard pip...", err.message);
    exec("pip install -r requirements.txt", (err2, stdout2, stderr2) => {
      if (err2) {
        console.error("[Manager] Both pip3 and pip installations failed.", err2.message);
      } else {
        console.log("[Manager] Python packages successfully setup via pip.");
        isPythonInstalled = true;
      }
      startPythonBackend();
    });
  } else {
    console.log("[Manager] Python packages successfully setup via pip3.");
    isPythonInstalled = true;
    startPythonBackend();
  }
});


// --- Express API routes & Python Proxy Gateway ---
app.all(["/ai/*", "/health"], async (req, res) => {
  const targetUrl = `http://127.0.0.1:8000${req.originalUrl}`;
  console.log(`[Express Proxy] Gatewaying ${req.method} request to: ${targetUrl}`);

  try {
    const headers: any = {
      "Content-Type": req.headers["content-type"] || "application/json",
    };

    if (req.headers["authorization"]) {
      headers["Authorization"] = req.headers["authorization"];
    }

    const fetchConfig: RequestInit = {
      method: req.method,
      headers: headers,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      fetchConfig.body = JSON.stringify(req.body);
    }

    // Attempt to invoke the python fastapi container
    const pythonResponse = await fetch(targetUrl, fetchConfig);
    const contentType = pythonResponse.headers.get("content-type") || "";

    res.status(pythonResponse.status);

    if (contentType.includes("application/json")) {
      const data = await pythonResponse.json();
      res.json(data);
    } else {
      const text = await pythonResponse.text();
      res.send(text);
    }
  } catch (error: any) {
    console.warn(`[Express Proxy] FastAPI unreachable at ${targetUrl}. Powering fallback Demo AI logic:`, error.message);

    // Dynamic direct Express fallbacks for zero-interruption live preview experience
    if (req.path === "/health") {
      return res.json({
        status: "healthy",
        service: "Compawss AI FastAPI Service [Proxy Fallback Mode]",
        gemini_api_configured: Boolean(process.env.GEMINI_API_KEY || process.env.AI_MODEL_API_KEY),
        engine: "Demo AI // Fallback Sandbox (Express Emulator)"
      });
    }

    if (req.path === "/ai/analyze-image") {
      const hasKitten = (req.body?.image_url && req.body.image_url.includes("kitten"));
      if (hasKitten) {
        return res.json({
          species: "Felis catus (Calico Kitten / Urban Shorthair)",
          lesion_notes: "DEMO AI (Local Fallback): High distress call signatures, severe hydration decay from confined water drain entrapment.",
          suggested_severity: "Urgent",
          detected_tags: ["trapped", "dehydrated", "abandoned baby"],
          confidence_score: 94.8,
          is_demo_ai: true
        });
      } else {
        return res.json({
          species: "Canis lupus familiaris (Shih Tzu/Indie Mix)",
          lesion_notes: "DEMO AI (Local Fallback): Bleeding noticed along the left lower body with heavy pain whimpering and limb trauma.",
          suggested_severity: "Critical",
          detected_tags: ["bleeding", "unable to walk", "hit by vehicle"],
          confidence_score: 97.4,
          is_demo_ai: true
        });
      }
    }

    if (req.path === "/ai/classify-report") {
      const text = req.body?.text?.lower || "";
      const isTrapped = text.includes("trap") || text.includes("drain") || text.includes("stuck");
      return res.json({
        category: isTrapped ? "Trapped" : "Injured Stray",
        priority_level: isTrapped ? "High" : "Critical",
        is_demo_ai: true
      });
    }

    if (req.path === "/ai/severity-score") {
      const text = req.body?.text?.lower || "";
      const isTrapped = text.includes("trap") || text.includes("drain") || text.includes("stuck");
      return res.json({
        severity_score: isTrapped ? 7.2 : 8.9,
        severity_category: isTrapped ? "Urgent" : "Critical",
        vitals_guidance: {
          heart_rate_forecast: isTrapped ? "130 BPM // DEHYDRATED" : "145 BPM // SHOCK",
          temp_estimate: isTrapped ? "99.5 °F // HYPOTHERMIC" : "102.8 °F // SHIVER",
          alertness: isTrapped ? "Panicked / Scleral injection" : "Listless / Semi-conscious"
        },
        is_demo_ai: true
      });
    }

    if (req.path === "/ai/recommend-action") {
      const s = req.body?.species || "";
      const isCat = s.includes("Felis") || s.includes("Cat") || s.includes("Kitten");
      if (isCat) {
        return res.json({
          directives: [
            "DEMO AI (Local Fallback): Lower soft fabric mesh lines down drainage grate rather than metal poles to enable self-climbing gripping.",
            "DEMO AI (Local Fallback): Insulate inside dry warm towels immediately upon exit to stop severe hypothermia core dropping.",
            "DEMO AI (Local Fallback): Administer rehydration feeding syringe drops slowly."
          ],
          warnings: [
            "DEMO AI (Local Fallback): NEVER package inside fully sealed carriers right after water exposure.",
            "DEMO AI (Local Fallback): Reduce immediate nearby shouting or engine starts which fuel vertical escape attempts."
          ],
          tools_required: ["Fabric Sling Net", "Isothermal Warming Cover", "Feeding Syringe Nose"],
          is_demo_ai: true
        });
      } else {
        return res.json({
          directives: [
            "DEMO AI (Local Fallback): Apply direct gauze pressure to stop active arterial or venous bleeding.",
            "DEMO AI (Local Fallback): Restrict shivers by bundling in dry rags or safety blankets.",
            "DEMO AI (Local Fallback): Clean visual breathing passages; never force water into a shock-compromised animal."
          ],
          warnings: [
            "DEMO AI (Local Fallback): NEVER place bare fingers near jaws when the patient is crying in high distress.",
            "DEMO AI (Local Fallback): Avoid single-limb extraction if multiple fractures are present."
          ],
          tools_required: ["Absorbent Gauze Rolls", "Rescue Stretcher Webbing", "Insulating Cover Blanket"],
          is_demo_ai: true
        });
      }
    }

    if (req.path === "/ai/match-responders") {
      const rawResponders = req.body?.responders || [];
      const analyzed = rawResponders.map((r: any, index: number) => ({
        id: r.id || `res-${index}`,
        name: r.name || r.clinicName || "Community Attendant",
        distance_km: index + 1.2,
        distance_label: `${index + 1.2} km`,
        eta_minutes: (index + 1) * 7,
        phone: r.phone || r.contact || "+91 99999 99999",
        address: r.address || "Registered Service Core Sector",
        suitability_ranking: "High Match",
        suitability_score: 95 - index * 4,
        capacity_status: "Active Capacity Avail",
        source: r.source || "System Database Fallback"
      }));
      return res.json({
        case_latitude: req.body?.latitude || 19.0544,
        case_longitude: req.body?.longitude || 72.8402,
        ranked_responders: analyzed,
        engine: "Fallback Express Spatial Responders Matrix Engine"
      });
    }

    if (req.path === "/ai/translate-guidance") {
      const text = req.body?.text || "";
      const target = req.body?.target_language || "hi";
      let translated = `[Local Fallback Translation to ${target}] ${text}`;
      let trans = "Phonetic Local Translation Pronunciation Scheme";
      
      if (text.toLowerCase().includes("gauze")) {
        translated = "खून बहना रोकने के लिए पट्टी (gauze) से हल्का दबाव डालें।";
        trans = "Khoon behna rokne ke liye patti se halka dabaav daalein.";
      }
      return res.json({
        translated_text: translated,
        transliteration: trans,
        is_demo_ai: true
      });
    }

    res.status(502).json({ error: "Service boot processing in background. Standby for core link." });
  }
});


// --- Serve React Frontend Application ---
async function mountFrontend() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Manager] Mounting Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Manager] Serving compiled static production assets...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Host Server] Live and listening at http://localhost:${PORT}`);
  });
}

mountFrontend();
