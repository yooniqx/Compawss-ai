# 🐾 Compawss AI

**AI-Powered Humanitarian Animal Rescue Platform**

Compawss AI combines cutting-edge artificial intelligence with real-time rescue coordination to save animal lives. Built with a futuristic tactical rescue-system UI aesthetic, it provides emergency responders, NGOs, and veterinarians with powerful tools for animal welfare operations.

---

## 🌟 Features

### Core Capabilities
- **🤖 AI-Powered Injury Analysis** - Real-time image analysis using Google Gemini AI to assess animal injuries and provide immediate guidance
- **🚨 Emergency Rescue Reporting** - Quick incident reporting with GPS location tracking and voice recording
- **🏥 NGO & Veterinary Discovery** - Intelligent search and mapping of nearby animal welfare organizations and veterinary clinics
- **💬 Conversational AI Assistant** - Context-aware AI guidance for rescue operations and animal care
- **📍 Live Geolocation Context** - Real-time location services for accurate rescue coordination
- **📊 Rescue Dispatch Dashboard** - Tactical command center for managing active rescue operations

### Technical Highlights
- Cyberpunk/tactical rescue terminal styling with animated overlays
- Real-time AI integration (no mock data or fake responses)
- Microphone recording for voice reports
- GPS permission handling and location services
- Responsive design optimized for mobile rescue operations

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python 3.8+** (for backend)
- **Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))
- **Supabase Account** (for database)
- **Google Maps API Key** (for location services)

### Frontend Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create `.env.local` in the root directory:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   
   Create `backend/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   GOOGLE_PLACES_API_KEY=your_google_places_key
   GOOGLE_MAPS_PLATFORM_KEY=your_google_maps_key
   ```

4. **Run the backend server:**
   ```bash
   python main_grounded.py
   ```

   Backend will be available at `http://localhost:8000`

---

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **Google Maps API** for geolocation
- **Supabase Client** for real-time data

### Backend
- **FastAPI** (Python) for high-performance API
- **Google Gemini AI** for intelligent analysis
- **Supabase** for database and authentication
- **Google Places API** for location services

### Deployment
- **Frontend:** Vercel/Netlify
- **Backend:** Render
- **Database:** Supabase (PostgreSQL)

---

## 📁 Project Structure

```
compawss-ai/
├── src/
│   ├── components/        # React components
│   │   ├── screens/       # Main application screens
│   │   ├── Header.tsx     # Navigation header
│   │   └── Navbar.tsx     # Bottom navigation
│   ├── context/           # React context providers
│   │   ├── ChatContext.tsx      # AI chat state
│   │   └── RescueContext.tsx    # Rescue operations state
│   ├── services/          # API and service integrations
│   │   ├── aiService.ts         # AI/backend communication
│   │   ├── apiService.ts        # API utilities
│   │   └── supabaseClient.ts    # Database client
│   └── types.ts           # TypeScript type definitions
├── backend/
│   ├── main_grounded.py   # Production backend (real AI)
│   ├── main.py            # Legacy backend
│   └── requirements.txt   # Python dependencies
├── .env.example           # Environment variable template
└── README.md              # This file
```

---

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend API URL | ✅ |
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps API key | ✅ |

#### Backend (`backend/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | ✅ |
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GOOGLE_PLACES_API_KEY` | Google Places API key | ✅ |
| `GOOGLE_MAPS_PLATFORM_KEY` | Google Maps Platform key | ✅ |

---

## 🚢 Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Connect your repository to Render
3. Set environment variables in Render dashboard
4. Deploy from `backend/main_grounded.py`

### Deploy Frontend

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting provider

3. Update `VITE_BACKEND_URL` to your production backend URL

---

## 🔐 Security Notes

- **Never commit `.env` or `.env.local` files** - they contain sensitive API keys
- **Use `.env.example`** as a template with placeholder values only
- **Rotate API keys** if accidentally exposed
- **Enable API key restrictions** in Google Cloud Console
- **Use environment variables** in production deployments

---

## 🤝 Contributing

This is a humanitarian project focused on animal welfare. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is built for humanitarian purposes to aid in animal rescue operations.

---

## 🆘 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for animal welfare**
