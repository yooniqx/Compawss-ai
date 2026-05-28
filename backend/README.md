# Compawss AI Emergency Dispatch - Python AI Backend

This is a standalone, optional Python microservice built using **FastAPI** and **Uvicorn** to supply real-time, lightweight AI dispatch intelligence. It acts as an optional server-side assistant for medical triage, audio transcript parsing, severity indexing, first-aid directive matching, and language translations.

## Core Design Principles
1. **Zero-Block Integration**: The frontend is built to operate perfectly with or without this backend. If the backend is offline, the frontend falls back seamlessly to offline mock/demo calculations.
2. **CORS Enabled**: The server sets wildcard Access-Control headers to make direct client-side requests secure during sandboxed developments.
3. **Robust Fallbacks**: Simple heuristics prevent crashing when external APIs are not supplied.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
Make sure you have Python 3.8+ installed:
```bash
python --version
```

### 2. Install Dependencies
Navigate into the `/backend` directory and install the necessary libraries:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Run the Backend Server
Start the Uvicorn development server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Once started, the backend will run at: **`http://localhost:8000`**

---

## 🩺 Endpoints Checklist

- **`GET /health`**
  Returns operational state, ready posture, and codec details.
- **`POST /ai/analyze-image`**
  Decodes image base64, returning calculated species name, anomalies found, tags, confidence benchmarks, and list of directives.
- **`POST /ai/classify-report`**
  Parses audio transcriptions and note text, returning category block fields and priority level.
- **`POST /ai/severity-score`**
  Scores casualty metrics against medical metrics to return dynamic triage scores (0-100) and risk factors.
- **`POST /ai/recommend-action`**
  Replies with first-aid guidelines, high-risk contraindications, and emergency kid dependencies.
- **`POST /ai/match-responders`**
  Calculates local rescue squad assets, response routes, and hospital allocations.
- **`POST /ai/translate-guidance`**
  Transforms English response directives to region-aligned vernaculars (Bengali `bn`, Hindi `hi`).

---

## 🔗 Connecting to Frontend
To hook this up with the Compawss React client, add the backend URL as an environment variable:

```env
# In your root `.env` or client deployment parameters
VITE_AI_BACKEND_URL="http://localhost:8000"
```
If this variable is left empty or the server has not booted, the UI displays `Demo AI / Backend Offline` inside the telemetry indicators and falls back gracefully.
