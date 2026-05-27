import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Compass, 
  Heart, 
  ArrowRight, 
  MapPin, 
  Plus, 
  Check, 
  X, 
  Shield, 
  Activity, 
  Smile, 
  Sparkles,
  User,
  Mic,
  Calendar,
  Layers,
  Info,
  WifiOff,
  Camera
} from 'lucide-react';
import { Screen, StrayReport } from '../../types';
import { NEARBY_ACTIVITY, NOTIFICATIONS_DATA, DASHBOARD_STATS } from '../../data';
import { CompawssLogo } from '../CompawssLogo';
import { useRescue, INDIAN_LOCALITIES } from '../../context/RescueContext';


/* ==========================================================================
   1. HOME SCREEN
   ========================================================================== */
interface HomeProps {
  onNavigate: (screen: Screen) => void;
}

const translations = {
  en: {
    heroTitle: "Report Rescue Incident",
    heroSubtitle: "Immediate AI-powered responder dispatch",
    voiceSos: "Empower Active Voice SOS",
    cameraReport: "Camera Quick Scan",
    activeIncidentsMap: "Tactical Overwatch Map",
    gpsStatus: "GPS GRID ENCRYPTED & ACTIVE",
    livesSaved: "Lives Saved Successfully",
    activeVolunteers: "Active NGO Responders",
    responseTime: "Avg Response Speed",
    coverageArea: "Service Area Coverage",
    casesToday: "Urgent Incidents Today",
    quickActionTitle: "NGO Tactical Directives",
    feedTitle: "Active Community Alerts Feed",
    feedLive: "LIVE FEED",
    helpBtn: "Help Case",
    dismissBtn: "Ack",
    observationTitle: "AI Watchman Directive",
    observationBody: "High density of active distress calls detected in Sector 4. Advise additional dispatch units.",
    helpSectorBtn: "Deploy to Sector 4",
    dismiss: "Dismiss Warning",
    offlineToggleOnline: "Network State: Connected",
    offlineToggleOffline: "Network State: Cellular Fallback Active",
    offlineNotice: "Zero network environment active. Reports will queue for SMS fallback routing.",
    impactTimeLabel: "this month",
    coverageLabel: "Sector coverage ratio",
    volunteersCount: "420 Active Rescuers",
    livesCount: "1,248 Saved Cases",
  },
  hi: {
    heroTitle: "दुर्घटना बचाव रिपोर्ट दर्ज करें",
    heroSubtitle: "त्वरित एआई-संचालित एनजीओ प्रेषण सक्रिय",
    voiceSos: "वॉयस एसओएस सक्रिय करें",
    cameraReport: "कैमरा त्वरित स्कैन",
    activeIncidentsMap: "सामरिक लाइव मानचित्र",
    gpsStatus: "जीपीएस ग्रिड सुरक्षित और सक्रिय",
    livesSaved: "बचाए गए कुल जीवन",
    activeVolunteers: "सक्रिय एनजीओ कार्यकर्ता",
    responseTime: "औसत प्रतिक्रिया समय",
    coverageArea: "बचाव क्षेत्र कवरेज",
    casesToday: "आज के गंभीर मामले",
    quickActionTitle: "एनजीओ त्वरित कमान ग्रिड",
    feedTitle: "सक्रिय सामुदायिक चेतावनी सूची",
    feedLive: "लाइव दुर्घटना डेटा",
    helpBtn: "सहायता करें",
    dismissBtn: "हटाएं",
    observationTitle: "एआई विश्लेषक निर्देश",
    observationBody: "सेक्टर 4 में गंभीर दुर्घटनाओं की उच्च संख्या पाई गई है। अतिरिक्त टीमों को तुरंत भेजने का सुझाव।",
    helpSectorBtn: "सेक्टर 4 में प्रेषण करें",
    dismiss: "खारिज करें",
    offlineToggleOnline: "नेटवर्क मोड: कनेक्टेड (ऑन)",
    offlineToggleOffline: "नेटवर्क मोड: सेल्युलर ऑफलाइन फ़ॉलबैक",
    offlineNotice: "कोई नेटवर्क नहीं है। आपातकालीन ड्राफ़्ट एसएमएस फ़ॉलबैक द्वारा भेजा जाएगा।",
    impactTimeLabel: "इस महीने",
    coverageLabel: "सेक्टर कवरेज दर",
    volunteersCount: "420 सक्रिय स्वयंसेवक",
    livesCount: "1,248 बचाए गए मामले",
  },
  bn: {
    heroTitle: "জরুরি উদ্ধার রিপোর্ট নথিভুক্ত করুন",
    heroSubtitle: "অনতিবিলম্বে এআই-চালিত রেসকিউ টিম পাঠানো হবে",
    voiceSos: "ভয়েস এসওএস চালু করুন",
    cameraReport: "ক্যামেরা কুইক স্ক্যান",
    activeIncidentsMap: "ট্যাকটিক্যাল লাইভ মানচিত্র",
    gpsStatus: "জিপিএস গ্রিড সুরক্ষিত ও সক্রিয়",
    livesSaved: "মোট উদ্ধারকৃত জীবন",
    activeVolunteers: "সক্রিয় এনজিও কর্মী",
    responseTime: "গড় সাড়া প্রদানের সময়",
    coverageArea: "উদ্ধার অঞ্চল কভারেজ",
    casesToday: "আজকের জরুরি মামলা",
    quickActionTitle: "এনজিও কুইক অ্যাকশন গ্রিড",
    feedTitle: "সক্রিয় সামাজিক রেসকিউ অ্যালার্ট",
    feedLive: "লাইভ রেসকিউ তথ্য",
    helpBtn: "সাহায্য করুন",
    dismissBtn: "বাতিল",
    observationTitle: "এআই বিশ্লেষণ নির্দেশিকা",
    observationBody: "সেক্টর ৪-এ অত্যন্ত উচ্চ সংবেদনশীল দুর্ঘটনা লক্ষ করা গেছে। অবিলম্বে অতিরিক্ত উদ্ধারকারী দল পাঠান।",
    helpSectorBtn: "সেক্টর ৪-এ কর্মী পাঠান",
    dismiss: "খারিজ",
    offlineToggleOnline: "নেটওয়ার্ক মোড: সংযুক্ত (অনলাইন)",
    offlineToggleOffline: "নেটওয়ার্ক মোড: সেলুলার অফলাইন ব্যাকআপ",
    offlineNotice: "কোনো ইন্টারনেট নেই। জরুরি রিপোর্ট অটোমেটিক এসএমএস ব্যাকআপের মাধ্যমে পাঠানো হবে।",
    impactTimeLabel: "এই মাসে",
    coverageLabel: "সেক্টর কভারেজ অনুপাত",
    volunteersCount: "৪২০ সক্রিয় ব্যক্তি",
    livesCount: "১,২৪৮ উদ্ধারকৃত ঘটনা",
  }
};

function useIsLightMode() {
  const [isLight, setIsLight] = useState(() => document.documentElement.classList.contains('light-mode'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light-mode'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isLight;
}

export const HomeView: React.FC<HomeProps> = ({ onNavigate }) => {
  const isLight = useIsLightMode();
  const [lang, setLang] = useState<'en' | 'hi' | 'bn'>('en');
  const [showObservation, setShowObservation] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedCityFilter, setSelectedCityFilter] = useState<'Mumbai' | 'Bangalore' | 'New Delhi' | 'Pune' | 'Kolkata' | 'Hyderabad'>('Mumbai');

  const {
    vets,
    ngos,
    cases,
    stats,
    isOffline,
    setIsOffline,
    userLocation,
    gpsPermission,
    requestGpsPermission,
    updateUserLocationDirectlyByLocality,
    clearNotification,
    addNotification
  } = useRescue();

  const handleDismissAlert = (id: string) => {
    // Modify status or log action
    addNotification('Alert Cleared from Feed', `Incident alert ${id} was acknowledged on citizen interface.`, 'Info');
  };

  const text = translations[lang];

  // Convert rescue cases (sorted by distance) into the feed representation
  const activeAlerts = cases
    .filter(c => c.status !== 'Resolved' && c.status !== 'Closed')
    .map(c => {
      return {
        id: c.id,
        type: `${c.animalProfile.species} (${c.animalProfile.name}) - ${c.type}`,
        location: c.location,
        distance: c.distance,
        timeAgo: c.timeAgo,
        status: c.priority === 'Critical' ? 'Critical Injury' : (c.priority === 'High' ? 'Urgent Need' : c.status)
      };
    });

  return (
    <div className="flex-1 pb-32 overflow-y-auto w-full px-4 md:px-8 max-w-md md:max-w-xl mx-auto space-y-6 pt-4 animate-in fade-in duration-300">
      
      {/* Multilingual Switcher Header & Offline Simulator control */}
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#08080C] border border-white/10 shadow-lg">
        {/* Languages options */}
        <div className="flex gap-1.5 items-center">
          <span className="text-[9px] font-mono text-[#00F2FF] font-black tracking-wider uppercase">Lang:</span>
          {(['en', 'hi', 'bn'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-[10px] uppercase px-2 py-1 rounded font-bold transition-all ${
                lang === l 
                  ? 'bg-[#FF4E00] text-white shadow-md' 
                  : 'bg-white/5 text-[#cbc3d7]/60 hover:text-white'
              }`}
            >
              {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'বাংলা'}
            </button>
          ))}
        </div>

        {/* Offline Toggle simulation button */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`px-3 py-1 rounded-full text-[9px] font-bold font-mono tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
            isOffline 
              ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
              : 'bg-green-500/10 text-green-400 border border-green-500/20'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isOffline ? 'bg-red-500 animate-ping' : 'bg-green-400'}`} />
          {isOffline ? "OFFLINE ACTIVE" : "ONLINE CONNECTED"}
        </button>
      </div>

      {/* GPS Locate & Indian Locality Selector Station */}
      <div className={`p-4 rounded-2xl border flex flex-col gap-3 text-left shadow-lg ${
        isLight ? 'bg-white border-gray-200' : 'glass-panel border-white/10'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-teal-50 text-teal-600' : 'bg-[#00F2FF]/10 text-[#00F2FF]'}`}>
              <MapPin className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className={`text-[9px] font-mono tracking-wide block uppercase ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/50'}`}>Emergency Dispatch Sector</span>
              <span className={`text-sm font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{userLocation.name}, {userLocation.city}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className={`px-3 py-1.5 font-sans font-black text-[10px] rounded-lg border transition ${
              isLight 
                ? 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700' 
                : 'bg-white/5 border-white/10 text-[#cbc3d7] hover:bg-white/10'
            }`}
          >
            {showLocationPicker ? "Close" : "Change Zone"}
          </button>
        </div>

        {showLocationPicker && (
          <div className="pt-2 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
            {gpsPermission === 'denied' && (
              <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-[10px] text-red-200 leading-normal font-sans">
                ⚠️ <strong>GPS Access Denied/Unavailable:</strong> Please manually select your active Indian city and nearest rescue sector below to retrieve localized shelter directory databases and vets.
              </div>
            )}

            {/* Quick GPS auto locate trigger */}
            <button
              onClick={() => {
                requestGpsPermission();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-[#00F2FF] to-teal-500 text-black hover:opacity-90 transition active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Auto-Detect GPS Device Location</span>
            </button>

            {/* City Selection Tabs */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono uppercase tracking-wider text-gray-400 block font-bold">Select Active City</span>
              <div className="grid grid-cols-3 gap-1">
                {(['Mumbai', 'Bangalore', 'New Delhi', 'Pune', 'Kolkata', 'Hyderabad'] as const).map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCityFilter(city)}
                    className={`px-2 py-1.5 text-[10px] font-bold rounded transition text-center ${
                      selectedCityFilter === city
                        ? 'bg-[#FF4E00] text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-[#cbc3d7]/85'
                    }`}
                  >
                    {city === 'New Delhi' ? 'Delhi' : city}
                  </button>
                ))}
              </div>
            </div>

            {/* Micro-Localities Grid of selected city */}
            <div className="space-y-1">
              <span className="text-[8px] font-mono uppercase tracking-wider text-gray-400 block font-bold">Locality-Level Sighting discovery</span>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {INDIAN_LOCALITIES.filter(l => l.city === selectedCityFilter).map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => {
                      updateUserLocationDirectlyByLocality(loc.name);
                      setShowLocationPicker(false);
                    }}
                    className={`p-2 rounded-lg text-left text-[10px] font-semibold border transition ${
                      userLocation.name === loc.name
                        ? 'border-[#00F2FF] bg-[#00F2FF]/10 text-white'
                        : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-[#cbc3d7]/70'
                    }`}
                  >
                    <span className="block truncate font-bold">{loc.name}</span>
                    <span className="text-[8px] opacity-60 font-mono">Lat: {loc.latitude.toFixed(3)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Offline Alert Cues */}
      {isOffline && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-left animate-in slide-in-from-top-4 duration-300 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold">
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            <span>CELLULAR STANDALONE SURVIVAL MODE</span>
          </div>
          <p className="text-[10px] text-red-200/80 leading-relaxed font-sans">
            {text.offlineNotice}
          </p>
          <div className="flex gap-2 pt-1">
            <span className="text-[9px] font-mono bg-red-400/20 px-1.5 py-0.5 rounded text-white font-bold">LOCAL MAP PACKS LOADED</span>
            <span className="text-[9px] font-mono bg-red-400/20 px-1.5 py-0.5 rounded text-white font-bold">QUEUE SLOTS: 3 AVAILABLE</span>
          </div>
        </div>
      )}


      {/* 1. LARGE SOS / REPORT EMERGENCY CARD */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FF4E00] to-[#00F2FF] p-[1.5px] group shadow-[0_8px_35px_rgba(255,78,0,0.3)] transition-all hover:scale-[1.01] active:scale-95 duration-200">
        <div className="absolute inset-0 bg-[#FF4E00] opacity-40 blur-xl group-hover:opacity-75 transition-opacity pointer-events-none" />
        
        <div className={`relative z-10 rounded-2xl p-5 flex flex-col gap-4 text-left ${isLight ? 'bg-orange-50/95 border border-orange-200' : 'bg-[#08080C]/95'}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className={`text-[10px] font-mono tracking-widest font-black uppercase ${isLight ? 'text-[#C2410C]' : 'text-[#00F2FF]'}`}>
                CRITICAL FIELD DISPATCH INTEL
              </span>
              <h2 className={`font-display font-black text-xl tracking-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {text.heroTitle}
              </h2>
              <p className={`text-xs font-medium ${isLight ? 'text-gray-600' : 'text-[#cbc3d7]/70'}`}>
                {text.heroSubtitle}
              </p>
            </div>
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl pulse-accent ${
              isLight 
                ? 'bg-orange-100 border border-orange-300 text-[#C62828]' 
                : 'bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00]'
            }`}>
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Quick Voice & Camera Action Buttons inline */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1 w-full">
            <button
              onClick={() => onNavigate(Screen.VoiceReporting)}
              className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer leading-none min-w-0 ${
                isLight 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm' 
                  : 'bg-[#FF4E00]/10 border border-[#FF4E00]/30 hover:bg-[#FF4E00]/20 text-white'
              }`}
            >
              <Mic className={`w-4 h-4 shrink-0 ${isLight ? 'text-white font-black' : 'text-[#FF4E00] animate-pulse'}`} />
              <span className="truncate text-xs font-bold leading-none">{text.voiceSos}</span>
            </button>
            <button
              onClick={() => onNavigate(Screen.InjuryAnalysis)}
              className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer leading-none min-w-0 ${
                isLight 
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' 
                  : 'bg-[#00F2FF]/10 border border-[#00F2FF]/30 hover:bg-[#00F2FF]/20 text-white'
              }`}
            >
              <Camera className={`w-4 h-4 shrink-0 ${isLight ? 'text-white' : 'text-[#00F2FF]'}`} />
              <span className="truncate text-xs font-bold leading-none">{text.cameraReport}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE INCIDENT MAP PREVIEW Section */}
      <div className={`rounded-2xl border overflow-hidden shadow-2xl relative ${isLight ? 'bg-white border-gray-200' : 'bg-[#08080C] border-white/10'}`}>
        <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-gray-200 bg-gray-50' : 'border-white/10'}`}>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#FF4E00] animate-ping" />
            <h3 className={`font-display text-xs font-mono font-black tracking-wider uppercase ${isLight ? 'text-gray-800' : 'text-[#cbc3d7]'}`}>
              {text.activeIncidentsMap}
            </h3>
          </div>
          <span className={`text-[9px] font-mono font-black uppercase tracking-wider ${isLight ? 'text-[#C2410C]' : 'text-[#00F2FF]'}`}>
            {text.gpsStatus}
          </span>
        </div>

        {/* Live animated SVG Radar Canvas inside Home screen! */}
        <div className={`relative h-44 flex items-center justify-center overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-[#050508]'}`}>
          {/* Centered branded telemetry compass background */}
          <CompawssLogo size={135} animate={true} className="absolute opacity-10 pointer-events-none filter drop-shadow-[0_0_8px_rgba(255,184,0,0.05)] scale-110" />

          {/* Concentric rings */}
          <div className={`absolute w-36 h-36 border rounded-full ${isLight ? 'border-gray-300/40' : 'border-white/5'}`} />
          <div className={`absolute w-24 h-24 border rounded-full ${isLight ? 'border-gray-300/40' : 'border-white/5'}`} />
          <div className={`absolute w-12 h-12 border rounded-full ${isLight ? 'border-teal-350/20' : 'border-[#00F2FF]/10'}`} />
          
          {/* Labeled radar quadrants */}
          <span className={`absolute top-2 left-2 text-[8px] font-mono ${isLight ? 'text-gray-500/50' : 'text-[#cbc3d7]/30'}`}>SEC 4-A</span>
          <span className={`absolute bottom-2 right-2 text-[8px] font-mono ${isLight ? 'text-gray-500/50' : 'text-[#cbc3d7]/30'}`}>SEC 7-W</span>

          {/* Radar sweeping vector */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 120 0 L 120 176 M 0 88 L 384 88" stroke={isLight ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"} strokeWidth="1" />
            </svg>
          </div>

          {/* Active blinking incident nodes */}
          {/* Distress spot 1 */}
          <div className="absolute top-[25%] left-[30%] animate-pulse">
            <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping" />
            <div className="h-1.5 w-1.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />
          </div>
          {/* Distress spot 2 */}
          <div className="absolute bottom-[20%] right-[35%]">
            <span className="absolute inline-flex h-3 w-3 rounded-full bg-[#00F2FF] opacity-75 animate-ping" />
            <div className="h-1.5 w-1.5 bg-[#00F2FF] rounded-full shadow-[0_0_8px_rgba(0,242,255,1)]" />
          </div>
          {/* Sentinel responder symbol */}
          <div className={`absolute top-[50%] right-[20%] flex items-center gap-1 px-1.5 py-0.5 border rounded ${isLight ? 'bg-white border-gray-300 text-gray-800' : 'bg-white/5 border-white/10 text-[#cbc3d7]'}`}>
            <span className="h-1 w-1 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[7px] font-mono font-bold">UNIT-7B</span>
          </div>

          <div className={`absolute inset-x-0 bottom-0 h-12 pointer-events-none ${isLight ? 'bg-gradient-to-t from-gray-100 to-transparent' : 'bg-gradient-to-t from-[#050508] to-transparent'}`} />
          <div className={`absolute bottom-2 left-3 text-[9px] font-mono flex items-center gap-1 ${isLight ? 'text-gray-600 font-bold' : 'text-[#cbc3d7]/40'}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <span>DISPATCH OVERLAYS LOCKED</span>
          </div>
        </div>
      </div>

      {/* 3. RESCUE IMPACT METRICS CONTAINER */}
      <div className="grid grid-cols-2 gap-3">
        {/* Lives Saved Card */}
        <div className={`border p-3.5 flex flex-col gap-1 text-left shadow-lg rounded-2xl ${isLight ? 'bg-white border-gray-200' : 'glass-panel border-white/10'}`}>
          <span className={`text-[9px] font-mono tracking-wider uppercase ${isLight ? 'text-gray-500 font-bold' : 'text-[#cbc3d7]/50'}`}>{text.livesSaved}</span>
          <span className={`font-display font-black text-xl flex items-baseline gap-1.5 ${isLight ? 'text-teal-700' : 'text-[#00F2FF]'}`}>
            {stats.livesSavedCount}
            <span className="text-[10px] font-medium text-green-500 font-sans flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> {stats.livesSavedTrend}
            </span>
          </span>
          <span className={`text-[9px] font-mono ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/40'}`}>Verified in crisis matrix</span>
        </div>

        {/* Coverage Card */}
        <div className={`border p-3.5 flex flex-col gap-1 text-left shadow-lg rounded-2xl ${isLight ? 'bg-white border-gray-200' : 'glass-panel border-white/10'}`}>
          <span className={`text-[9px] font-mono tracking-wider uppercase ${isLight ? 'text-gray-500 font-bold' : 'text-[#cbc3d7]/50'}`}>{text.activeVolunteers}</span>
          <span className={`font-display font-black text-xl flex items-baseline gap-1 ${isLight ? 'text-[#C2410C]' : 'text-[#FF4E00]'}`}>
            {stats.activeVolunteersCount}
            <span className="text-[10px] font-medium text-amber-500 font-sans">
              Active
            </span>
          </span>
          <span className={`text-[9px] font-mono ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/40'}`}>{stats.activeVolunteersTrend}</span>
        </div>

        {/* Core telemetry details row */}
        <div className={`col-span-2 grid grid-cols-3 gap-2 p-2.5 rounded-xl text-center text-[10px] font-mono border ${isLight ? 'bg-gray-100 border-gray-200 text-gray-700' : 'bg-white/[0.02] border border-white/5 text-[#cbc3d7]/50'}`}>
          <div>
            <span className={`block font-black text-xs ${isLight ? 'text-teal-700' : 'text-[#00F2FF]'}`}>{stats.responseTimeMinutes} mins</span>
            <span>{text.responseTime}</span>
          </div>
          <div>
            <span className={`block font-black text-xs ${isLight ? 'text-[#C2410C]' : 'text-[#FF4E00]'}`}>{stats.coverageAreaPercent}%</span>
            <span>{text.coverageArea}</span>
          </div>
          <div>
            <span className={`block font-black text-xs ${isLight ? 'text-gray-900 border-b border-gray-200' : 'text-white'}`}>{stats.casesTodayCount} Cases</span>
            <span>{text.casesToday}</span>
          </div>
        </div>
      </div>

      {/* 4. QUICK ACTION DIRECTIVES GRID */}
      <div className="space-y-2.5">
        <h3 className={`font-display font-black text-xs uppercase tracking-widest text-left pl-1 ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/45'}`}>
          {text.quickActionTitle}
        </h3>
        
        <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-2 text-left">
          {[
            { label: "Emergency Stream", screen: Screen.SOS, d: "Initiate overwatch", icon: "emergency" },
            { label: "Direct Voice Report", screen: Screen.VoiceReporting, d: "Audio transcription live", icon: "mic" },
            { label: "Computer Vision Scan", screen: Screen.InjuryAnalysis, d: "Diagnose severity risks", icon: "camera" },
            { label: "Tactical Overwatch Map", screen: Screen.RescueCommand, d: "Satellite positioning", icon: "map" },
            { label: "NGO Coordinator Desk", screen: Screen.NGODashboard, d: "Resource logistics manager", icon: "corporate_fare" },
            { label: "Volunteer Assignments", screen: Screen.VolunteerDashboard, d: "Shifts and dispatch ETAs", icon: "volunteer_activism" },
            { label: "Foster Rehab Shelter", screen: Screen.FosterDashboard, d: "Shelter space allocation", icon: "add_home" },
            { label: "Citizen Dispatch Board", screen: Screen.OwnerDashboard, d: "One-tap local witness logs", icon: "account_circle" },
          ].map((action, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate(action.screen)}
              className={`p-3 border rounded-xl flex flex-col items-start gap-1 group text-left cursor-pointer transition-all ${
                isLight 
                  ? 'bg-white border-gray-200 hover:border-orange-500/40 hover:bg-orange-50/50 shadow-sm' 
                  : 'bg-[#08080C] border-white/5 hover:border-[#FF4E00]/40 hover:bg-[#FF4E00]/5'
              }`}
            >
              <span className={`material-symbols-outlined text-sm group-hover:text-[#FF4E00] transition-colors ${isLight ? 'text-teal-700' : 'text-[#00F2FF]'}`}>
                {action.icon}
              </span>
              <span className={`text-[11px] font-black group-hover:text-[#FF4E00] transition-colors mt-0.5 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                {action.label}
              </span>
              <span className={`text-[8.5px] font-mono leading-relaxed ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/45'}`}>
                {action.d}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. LIVE RESCUE ACTIVITY FEED (Injured stray alerts, rescue requests) */}
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between">
          <h3 className={`font-display font-bold text-md flex items-center gap-2 ${isLight ? 'text-gray-900' : 'text-[#e4e1e9]'}`}>
            {text.feedTitle}
            <span className="h-2 w-2 rounded-full bg-[#FF4E00] animate-pulse" />
          </h3>
          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isLight ? 'text-[#C2410C]' : 'text-[#FF4E00]'}`}>
            {text.feedLive}
          </span>
        </div>

        <div className="space-y-3">
          {activeAlerts.map((report) => {
            const isCritical = report.status.includes('Blood') || report.status.includes('Trauma') || report.status.includes('Blood Loss');
            return (
              <div 
                key={report.id}
                className={`group relative rounded-2xl border p-4 flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-3 shadow-lg transition-all text-left ${
                  isLight 
                    ? 'bg-white border-gray-200 hover:border-orange-500/30 shadow-sm' 
                    : 'glass-panel border-white/10 hover:border-[#FF4E00]/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${
                    isCritical ? 'text-red-500' : (isLight ? 'text-[#C2410C]' : 'text-[#FF4E00]')
                  }`}>
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 className={`text-xs font-black group-hover:text-white transition-colors leading-snug truncate ${isLight ? 'text-gray-900' : 'text-[#e4e1e9]'}`}>
                      {report.type}
                    </h4>
                    <p className={`text-[11px] block truncate ${isLight ? 'text-gray-600' : 'text-[#cbc3d7]/60'}`}>
                      {report.distance} • {report.timeAgo}
                    </p>
                    <span className={`inline-block text-[8.5px] font-mono font-bold uppercase px-1.5 py-0.5 mt-1 rounded ${
                      isCritical 
                        ? (isLight ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-red-500/10 text-red-400') 
                        : (isLight ? 'bg-amber-50 text-amber-805 border border-amber-200' : 'bg-amber-400/10 text-amber-400')
                    }`}>
                      {report.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-0 min-[360px]:ml-2 shrink-0 self-end min-[360px]:self-auto">
                  <button 
                    onClick={() => {
                      if (report.id.includes('108')) {
                        onNavigate(Screen.InjuryAnalysis);
                      } else {
                        onNavigate(Screen.RescueCommand);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${
                      isLight 
                        ? 'text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 shadow-sm' 
                        : 'text-[#00F2FF] bg-[#00F2FF]/10 border border-[#00F2FF]/20 hover:bg-[#00F2FF]/20'
                    }`}
                  >
                    {text.helpBtn}
                  </button>
                  <button 
                    onClick={() => handleDismissAlert(report.id)}
                    title="Acknowledge alert"
                    className={`h-7 w-7 rounded-lg flex items-center justify-center transition border ${
                      isLight 
                        ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600' 
                        : 'bg-white/5 border border-white/10 text-[#cbc3d7]/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
          {activeAlerts.length === 0 && (
            <div className={`rounded-2xl border border-dashed p-6 text-center text-xs ${
              isLight ? 'border-gray-300 text-gray-400 bg-gray-50' : 'border-white/10 text-[#cbc3d7]/40 bg-white/[0.01]'
            }`}>
              All local alerts and incidents cleared.
            </div>
          )}
        </div>
      </div>

      {/* AI Overwatch / Watchman Directive Card */}
      {showObservation && (
        <div className={`relative rounded-2xl border p-5 shadow-2xl overflow-hidden text-left ${
          isLight 
            ? 'bg-teal-50/95 border-teal-250 shadow-md' 
            : 'relative rounded-2xl glass-panel border border-[#FF4E00]/30'
        }`}>
          {/* subtle glow border */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00F2FF]/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-start gap-3 relative z-10 w-full">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isLight ? 'bg-teal-100 text-teal-800' : 'bg-[#00F2FF]/10 text-[#00F2FF]'
            }`}>
              <Sparkles className={`w-5 h-5 animate-pulse ${isLight ? 'text-teal-700' : 'text-[#00F2FF]'}`} />
            </div>
            <div className="space-y-3 w-full">
              <div className="space-y-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider font-black ${
                  isLight ? 'text-teal-800' : 'text-[#00F2FF]'
                }`}>
                  {text.observationTitle}
                </span>
                <p className={`text-xs leading-relaxed ${
                  isLight ? 'text-gray-800 font-medium' : 'text-[#cbc3d7]'
                }`}>
                  {text.observationBody}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(Screen.VolunteerDashboard)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isLight 
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm' 
                      : 'text-[#08080C] bg-[#00F2FF] hover:bg-[#00d0dd]'
                  }`}
                >
                  {text.helpSectorBtn}
                </button>
                <button
                  onClick={() => setShowObservation(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isLight 
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300' 
                      : 'text-[#cbc3d7]/80 bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {text.dismiss}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* ==========================================================================
   2. NOTIFICATIONS SCREEN
   ========================================================================== */
interface NotificationsProps {
  onNavigate: (screen: Screen) => void;
}export const NotificationsView: React.FC<NotificationsProps> = ({ onNavigate }) => {
  const isLight = useIsLightMode();
  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 animate-in fade-in duration-300 space-y-4">
      <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
        <h2 className={`font-display font-bold text-xl ${isLight ? 'text-gray-900' : 'text-white'}`}>Notifications</h2>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${isLight ? 'bg-orange-100 border-orange-300 text-[#C2410C]' : 'bg-[#FF4E00]/10 text-[#FF4E00] border-[#FF4E00]/20'}`}>
          3 Alerts
        </span>
      </div>

      {/* Special Trigger element for navigation: Emergency Nearby */}
      <div 
        onClick={() => onNavigate(Screen.RescueCommand)}
        className={`group relative rounded-2xl p-5 shadow-lg transition-all cursor-pointer border ${
          isLight 
            ? 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400' 
            : 'bg-[#FF4E00]/10 border border-[#FF4E00]/30 hover:border-[#FF4E00]/50 hover:bg-[#FF4E00]/15'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl pulse-accent ${
            isLight ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-[#FF4E00]/20 border border-[#FF4E00]/30 text-white'
          }`}>
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className={`font-display font-semibold text-sm flex items-center gap-1.5 font-bold ${isLight ? 'text-[#C2410C]' : 'text-[#FF4E00]'}`}>
              Emergency Nearby
              <span className="text-[10px] bg-[#FF4E00] text-white font-mono px-1.5 py-0.5 rounded font-black">LIVE</span>
            </h3>
            <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-800 font-medium' : 'text-red-200/80'}`}>
              Injured stray dog detected in Sector 5. Responders needed for live thermal coordination.
            </p>
            <div className={`flex items-center gap-1.5 text-[10px] font-mono pt-1 font-bold ${isLight ? 'text-teal-700' : 'text-[#00F2FF]'}`}>
              <span>Map coordinates active</span>
              <span>•</span>
              <span>2 mins ago</span>
            </div>
          </div>
        </div>
        <div className={`absolute top-4 right-4 group-hover:translate-x-1 transition-transform ${isLight ? 'text-red-600' : 'text-[#00F2FF]'}`}>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>

      {/* Other notifications */}
      <div className="space-y-3">
        {NOTIFICATIONS_DATA.filter(n => n.id !== 'notif-1').map((notif) => {
          const isSuccess = notif.category === 'Success';
          return (
            <div 
              key={notif.id}
              className={`rounded-2xl border p-4 flex items-start gap-3 transition-all ${
                isLight 
                  ? 'bg-white border-gray-200 hover:border-orange-500/20 shadow-sm' 
                  : 'glass-panel border-white/10 hover:border-[#FF4E00]/20'
              }`}
            >
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                isLight 
                  ? (isSuccess ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-teal-50 text-teal-700 border border-teal-250') 
                  : `bg-white/5 ${isSuccess ? 'text-green-400' : 'text-[#00F2FF]'}`
              }`}>
                {isSuccess ? <Check className="w-4.5 h-4.5" /> : <Info className="w-4.5 h-4.5" />}
              </div>
              <div className="space-y-1">
                <span className={`text-[10px] font-mono tracking-wider uppercase ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/40'}`}>
                  {notif.category} Notification
                </span>
                <h4 className={`text-sm font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{notif.title}</h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-gray-700' : 'text-[#cbc3d7]/70'}`}>{notif.message}</p>
                <span className={`text-[10px] block font-mono ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/40'}`}>{notif.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`pt-8 text-center text-xs ${isLight ? 'text-gray-500' : 'text-[#cbc3d7]/40'}`}>
        You're completely caught up! 🎉
      </div>
    </div>
  );
};

/* ==========================================================================
   3. SOS SCREEN
   ========================================================================== */
interface SOSProps {
  onNavigate: (screen: Screen) => void;
}

export const SOSView: React.FC<SOSProps> = ({ onNavigate }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-6 flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-10 animate-in fade-in duration-300 bg-gradient-to-b from-[#FF4E00]/10 to-transparent min-h-[500px]">
      
      {/* Emergency Status Headers */}
      <div className="space-y-2 mt-4">
        <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00] uppercase">
          EMERGENCY BROADCAST ROUTER
        </span>
        <h2 className="font-display font-extrabold text-2xl text-white">
          Ready to Transmit SOS
        </h2>
        <p className="text-xs text-[#cbc3d7]/70 max-w-xs mx-auto">
          Compawss AI will immediately record audio telemetry, geo-locate the animal, and search with near-frequency NGO dispatch teams.
        </p>
      </div>

      {/* Radar Pulse Trigger Action (ID: sos-btn) */}
      <div className="relative flex items-center justify-center py-6">
        {/* Pulsing Outer Rings with Orange details */}
        <div className="absolute w-48 h-48 bg-[#FF4E00]/5 rounded-full animate-ping pointer-events-none" />
        <div className="absolute w-64 h-64 bg-[#FF4E00]/10 rounded-full animate-pulse pointer-events-none" />
        
        {/* Actual button requested by xpath / ID: //button[@id='sos-btn'] */}
        {/* Navigates to Voice Reporting */}
        <button
          id="sos-btn"
          onClick={() => {
            setIsBroadcasting(true);
            setTimeout(() => {
              onNavigate(Screen.VoiceReporting);
            }, 600);
          }}
          className="relative h-44 w-44 rounded-full bg-gradient-to-tr from-[#FF4E00] to-red-500 p-[2px] shadow-[0_0_60px_rgba(255,184,0,0.45)] hover:shadow-[0_0_80px_rgba(255,184,0,0.65)] cursor-pointer transition-transform active:scale-95 duration-300 pulse-accent"
        >
          {/* Inner glossy glass plate */}
          <div className="absolute inset-[2px] rounded-full bg-[#08080C]/90 backdrop-blur-2xl hover:bg-[#08080C]/70 flex flex-col items-center justify-center text-center p-3 overflow-hidden select-none">
            {/* Pulsing signal glow behind logo */}
            <div className="absolute inset-0 bg-[#FF4E00]/5 rounded-full animate-pulse-slow" />
            <CompawssLogo size={105} animate={true} className="relative z-10 filter drop-shadow-[0_0_12px_rgba(255,184,0,0.3)] mb-1" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none relative z-10">SOS TRANSMIT</span>
            <span className="text-[9px] font-mono text-[#00F2FF] tracking-widest font-black mt-1 relative z-10 uppercase">ACTIVE CO-PILOT</span>
          </div>
        </button>
      </div>

      {/* Safety Notice block */}
      <div className="rounded-2xl glass-panel border border-white/10 p-4 flex items-center gap-3 max-w-sm mx-auto text-left">
        <Shield className="w-8 h-8 text-green-400 shrink-0" />
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase font-bold text-[#FF4E00] tracking-wider">SECURE TELEMETRY</span>
          <p className="text-[11px] text-[#cbc3d7]/70">
            Aura-secured connections encrypt data. Zero public tracking is shared outside medical NGO teams.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. AI ASSISTANT WATCHMAN
   ========================================================================== */
interface Message {
  sender: 'ai' | 'user';
  text: string;
  options?: string[];
  actions?: { label: string; onClick: () => void }[];
}

interface FlowState {
  flow: 'idle' | 'reporting' | 'scanning' | 'vet' | 'language' | 'audio';
  step: number;
  reportInfo: {
    condition?: string;
    location?: string;
    photoAttached?: boolean;
  };
}

interface AIAssistantProps {
  onNavigate: (screen: Screen) => void;
}

export const AIAssistantView: React.FC<AIAssistantProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello! I am your Compawss AI Rescue Co-pilot. I am here to help you report, coordinate, and track rescues of injured, lost, or vulnerable animals safely.\n\nType a question or select a quick action to begin coordination.',
      options: ['What can this app do?', 'Report an injured animal', 'Find nearby rescuers']
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [lang, setLang] = useState<'en' | 'hi' | 'bn'>('en');
  const [audioGuidance, setAudioGuidance] = useState(false);

  const [flowState, setFlowState] = useState<FlowState>({
    flow: 'idle',
    step: 0,
    reportInfo: {}
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (text: string, current: FlowState): { text: string; state: FlowState; options?: string[]; actions?: { label: string; onClick: () => void }[] } => {
    const norm = text.toLowerCase().trim();

    // 1. HELP / WHAT CAN THIS APP DO
    if (
      norm.includes('what can this app do') || 
      norm.includes('what can this do') || 
      norm.includes('features') || 
      norm.includes('capabilities') || 
      norm === 'help'
    ) {
      return {
        text: "Compawss AI helps you report animals in distress using photo, video, voice, text, and location. It analyzes urgency, suggests safe next steps, connects cases to nearby rescuers, NGOs, vets, shelters, or volunteers, and helps track rescue progress until care is completed.",
        state: { flow: 'idle', step: 0, reportInfo: {} },
        options: ['Report an injured animal', 'Find nearby rescuers', 'Contact nearest vet']
      };
    }

    // 2. REPORT EMERGENCY INITIATION
    if (
      norm.includes('report an injured animal') || 
      norm.includes('report animal') || 
      norm === 'report' || 
      norm.includes('injured animal')
    ) {
      return {
        text: "I will guide you step-by-step through submitting a rescue report. First, please describe the animal's condition (e.g., severe bleeding, fractured limb, unconscious, trapped) so we can assess the urgency level.",
        state: { flow: 'reporting', step: 1, reportInfo: {} },
        options: ['Severe Bleeding', 'Limping or Fracture Accents', 'Dehydrated and Weak', 'Trapped in Drain']
      };
    }

    // 3. START VOICE SOS
    if (
      norm.includes('voice sos') || 
      norm.includes('start voice') || 
      norm === 'sos'
    ) {
      setTimeout(() => {
        onNavigate(Screen.VoiceReporting);
      }, 1400);
      return {
        text: "Opening Voice SOS transmission flow... Prepare to speak clear animal descriptions when the microphone turns on. This interface will send immediate GPS grids and transcribe audio.",
        state: { flow: 'idle', step: 0, reportInfo: {} }
      };
    }

    // 4. IMAGE AI SCAN TRIGGER
    if (
      norm.includes('upload photo') || 
      norm.includes('photo scan') || 
      norm.includes('ai scan') || 
      norm.includes('upload photo for ai scan')
    ) {
      return {
        text: "[Interactive Camera Scan Active]\nPlease select a sample case below to simulate an incoming photo attachment logic. This will analyze trauma severity using computer vision.",
        state: { flow: 'scanning', step: 1, reportInfo: {} },
        options: ['Simulate Canine Limb Injury', 'Simulate Feline Dehydration Photo', 'Cancel Scan']
      };
    }

    // 5. FIND NEARBY RESCUERS
    if (
      norm.includes('find nearby') || 
      norm.includes('rescuers') || 
      norm.includes('nearby rescuers')
    ) {
      const ngoListText = ngos.length > 0 
        ? ngos.slice(0, 3).map(n => `• ${n.name} (${n.type || 'Rescue Center'}) — ${n.address} [Source: ${n.source || 'Demo'}, Phone: ${n.contact}]`).join('\n')
        : '• No active local animal NGOs detected in this locality quadrant.';

      return {
        text: `Scanning local ${userLocation.name} coordinates for active NGO field units and animal shelters...\n\n📍 VERIFIED LOCAL SHELTER ORGANIZATIONS:\n${ngoListText}`,
        state: { flow: 'idle', step: 0, reportInfo: {} },
        actions: [
          { label: 'View Rescue Command Map', onClick: () => onNavigate(Screen.RescueCommand) },
          { label: 'Open NGO Logistics Hub', onClick: () => onNavigate(Screen.NGODashboard) }
        ]
      };
    }

    // 6. CONTACT NEAREST VET
    if (
      norm.includes('contact nearest vet') || 
      norm.includes('nearest vet') || 
      norm === 'vet'
    ) {
      const vetListText = vets.length > 0
        ? vets.slice(0, 3).map(v => `• ${v.clinicName} (${v.name}) — ${v.distance}, ${v.openingStatus || 'Active now'} [Source: ${v.source || 'Demo'}, Phone: ${v.contact}]`).join('\n')
        : '• No active veterinary clinics found within scan radius.';

      return {
        text: `Fetching local veterinary clinics equipped for emergency diagnostics near ${userLocation.name}:\n\n🏥 TELEPHONY / EMERGENCY DIRECTORY:\n${vetListText}\n\nWould you like to place a simulated call directly or map coordinates?`,
        state: { flow: 'vet', step: 1, reportInfo: {} },
        options: ['Place Call: Closest Clinic', 'Map Clinics Locations Overlay']
      };
    }

    // 7. TRACK ACTIVE RESCUE
    if (
      norm.includes('track active rescue') || 
      norm.includes('track') || 
      norm.includes('active rescue')
    ) {
      const caseListText = cases.length > 0
        ? cases.slice(0, 2).map(c => `• Case ${c.id} (${c.animalProfile.species} / ${c.animalProfile.breed}): Sighted at ${c.location} (${c.distance}) — Status: [${c.status}]`).join('\n')
        : '• No active priority dispatch missions registered in your overwatch zone.';

      return {
        text: `Verified dispatch missions currently in coordination near ${userLocation.city}:\n\n🔍 LIVE OPERATIONS DIRECTORIES:\n${caseListText}\n\nUse the buttons below to load full tactical tracking widgets:`,
        state: { flow: 'idle', step: 0, reportInfo: {} },
        actions: [
          { label: 'Open Volunteer Directives Board', onClick: () => onNavigate(Screen.VolunteerDashboard) },
          { label: 'Open Primary Map Engine', onClick: () => onNavigate(Screen.RescueCommand) }
        ]
      };
    }

    // 8. CHANGE LANGUAGE
    if (
      norm.includes('change language') || 
      norm === 'language'
    ) {
      return {
        text: "Compawss AI supports localized communication dialects. Please choose your preferences below:",
        state: { flow: 'language', step: 1, reportInfo: {} },
        options: ['English (EN)', 'Hindi (हिन्दी)', 'Bengali (বাংলা)']
      };
    }

    // 9. ENABLE AUDIO GUIDANCE
    if (
      norm.includes('enable audio') || 
      norm.includes('audio guidance') || 
      norm === 'audio'
    ) {
      return {
        text: "Audio guidance reads instructions, safe triage procedures, and alert priorities loud enough to assist rescuers in high-stress outdoor environments. Turn it on?",
        state: { flow: 'audio', step: 1, reportInfo: {} },
        options: ['Turn ON Audio Guidance', 'Keep Audio Guidance OFF']
      };
    }

    // IN-FLOW STATE HANDLERS
    if (current.flow === 'reporting') {
      const { step, reportInfo } = current;
      if (step === 1) {
        return {
          text: `Logged condition description: "${text}".\n\nNext, please provide the location or landmark where the animal is located so rescuers can find it (e.g. "Sector 4 Alleyway near Bank").`,
          state: { flow: 'reporting', step: 2, reportInfo: { ...reportInfo, condition: text } },
          options: ['Use Current Location Coordinates', 'Sector 4 Corner Market', 'East Bypass Highway']
        };
      } else if (step === 2) {
        return {
          text: `Logged location landmarks: "${text}".\n\nLastly, do you have a photo of the animal? Adding a photo enables quick AI triage analysis and lets emergency responders identify the animal in the field.`,
          state: { flow: 'reporting', step: 3, reportInfo: { ...reportInfo, location: text } },
          options: ['Simulate Photo Attachment', 'Skip Photo & Review']
        };
      } else if (step === 3) {
        const attach = norm.includes('simulate') || norm.includes('attachment') || norm.includes('photo');
        const complete = { ...reportInfo, photoAttached: attach };
        const reviewText = `📝 REPORT SUMMARY FOR SUBMISSION:\n• Animal Condition: ${complete.condition}\n• Search Coordinates: ${complete.location}\n• Vision Diagnosis: ${complete.photoAttached ? 'Canine Trauma Photo Attached' : 'None'}`;
        
        return {
          text: `${reviewText}\n\nReady to finalize this emergency dispatch report? Click submit below to alert nearby rescuers.`,
          state: { flow: 'reporting', step: 4, reportInfo: complete },
          options: ['🚀 SUBMIT RESCUE REPORT NOW', '❌ Discard Report']
        };
      } else if (step === 4) {
        if (norm.includes('submit') || norm.includes('report now') || norm.includes('rocket')) {
          return {
            text: `🚨 EMERGENCY RESCUE REPORT SUBMITTED!\n\n• Case ID: CPW-2026-7782\n• Status: Alert Broadcast Sent & Responders Notified\n• Assigned Rescuers: Mobile Volunteer Vet Unit Alpha-7\n• Estimated Arrival Time (ETA): 12 minutes\n• Live Status Tracking Link: [Track Case File Details](https://ais-dev-ly5a3ozapsnkntgpagavx2-841250886780.asia-east1.run.app)\n\nWe are monitoring this incident closely. You can track progress on the live map.`,
            state: { flow: 'idle', step: 0, reportInfo: {} },
            actions: [
              { label: 'Track on Command Map', onClick: () => onNavigate(Screen.RescueCommand) }
            ]
          };
        } else {
          return {
            text: "Report draft discarded. Let me know what else I can coordinate for you.",
            state: { flow: 'idle', step: 0, reportInfo: {} }
          };
        }
      }
    }

    if (current.flow === 'scanning') {
      if (norm.includes('canine') || norm.includes('limb') || norm.includes('injury')) {
        return {
          text: "📸 [AI COMPUTER VISION INSTANT SCAN]\n• Species Identified: Canine (Stray Dog)\n• Severity Assessment: HIGH RISK (Visible limb laceration & blood loss)\n• Immediate Triage Advice: Secure from major roads and highways. Give water if conscious. Keep still.\n\nCoordinates locked. Prompt to file this as a certified rescue report?",
          state: { flow: 'reporting', step: 4, reportInfo: { condition: 'Stray dog with high-risk limb laceration', location: 'GPS Live Diagnostic Captured', photoAttached: true } },
          options: ['🚀 SUBMIT RESCUE REPORT NOW', '❌ Cancel Scan']
        };
      } else if (norm.includes('feline') || norm.includes('dehydration') || norm.includes('cat')) {
        return {
          text: "📸 [AI COMPUTER VISION INSTANT SCAN]\n• Species Identified: Feline (Cat)\n• Severity Assessment: MODERATE RISK (Weakness, lethargy & dehydration)\n• Immediate Triage Advice: Place an easily accessible container of fresh water nearby. Provide ambient shelter out of intense sunlight.\n\nCoordinates locked. Prompt to file this as a certified rescue report?",
          state: { flow: 'reporting', step: 4, reportInfo: { condition: 'Dehydrated feline with acute fatigue symptoms', location: 'GPS Live Diagnostic Captured', photoAttached: true } },
          options: ['🚀 SUBMIT RESCUE REPORT NOW', '❌ Cancel Scan']
        };
      } else {
        return {
          text: "Visual computer-vision scan session ended. What other assistance is needed?",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      }
    }

    if (current.flow === 'vet') {
      if (norm.includes('call') || norm.includes('closest')) {
        const nearestVet = vets[0];
        const clinicName = nearestVet ? nearestVet.clinicName : "Crown Veterinary Hospital";
        const phone = nearestVet ? nearestVet.contact : "+91 22 6123 0000";
        const sourceLabel = nearestVet ? nearestVet.source || 'Demo' : 'Demo';
        return {
          text: `📞 [Placing Call...] Connecting you to ${clinicName} (${phone}) [Source: ${sourceLabel}]. Make sure to state your emergency sector: "${userLocation.name}" clearly upon connection.`,
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      } else {
        setTimeout(() => {
          onNavigate(Screen.RescueCommand);
        }, 1000);
        return {
          text: "Opening map overlays to locate active partner veterinary clinics nearby...",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      }
    }

    if (current.flow === 'language') {
      if (norm.includes('hindi') || norm.includes('हिन्दी')) {
        setLang('hi');
        return {
          text: "भाषा बदलकर हिंदी कर दी गई है। सुरक्षित बचाव सहायता के लिए आपका स्वागत है।",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      } else if (norm.includes('bengali') || norm.includes('বাংলা')) {
        setLang('bn');
        return {
          text: "ভাষা সফলভাবে বাংলায় পরিবর্তন করা হয়েছে। উদ্ধার কার্যে স্বাগতম।",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      } else {
        setLang('en');
        return {
          text: "Language was updated to English successfully. How can Compawss assist you further?",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      }
    }

    if (current.flow === 'audio') {
      if (norm.includes('on') || norm.includes('turn on')) {
        setAudioGuidance(true);
        return {
          text: "Audio Guidance has been activated successfully. Compawss AI will speak critical procedures during diagnostic scanning.",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      } else {
        setAudioGuidance(false);
        return {
          text: "Audio Guidance disabled. Quiet mode restores.",
          state: { flow: 'idle', step: 0, reportInfo: {} }
        };
      }
    }

    // Default Fallback Response (no jargon, practical helper)
    return {
      text: "I am ready. I can help you report an injured animal, find rescuers, get veterinary contacts, or check active rescues. What action should we take first?",
      state: { flow: 'idle', step: 0, reportInfo: {} },
      options: ['What can this app do?', 'Report an injured animal', 'Find nearby rescuers']
    };
  };

  const processMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);

    // Remove active interactive options from previous AI message before adding the new user message
    setMessages((prev) => 
      prev.map((msg, idx) => {
        if (idx === prev.length - 1) {
          return { ...msg, options: undefined };
        }
        return msg;
      })
    );

    setTimeout(() => {
      const response = generateResponse(text, flowState);
      
      setFlowState(response.state);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: response.text,
          options: response.options,
          actions: response.actions
        }
      ]);
    }, 600);
  };

  const sendMsg = () => {
    if (!inputVal.trim()) return;
    const txt = inputVal;
    setInputVal('');
    processMessage(txt);
  };

  const handleQuickAction = (label: string) => {
    processMessage(label);
  };

  const QUICK_ACTIONS = [
    { label: 'Report an injured animal', desc: 'Assess symptoms & alert units', icon: <Activity className="w-3.5 h-3.5 text-[#FF4E00]" /> },
    { label: 'Start Voice SOS', desc: 'Real-time audio telemetry SOS', icon: <Mic className="w-3.5 h-3.5 text-[#FF4E00]" /> },
    { label: 'Upload photo for AI scan', desc: 'Computer vision wound triage', icon: <Camera className="w-3.5 h-3.5 text-[#00F2FF]" /> },
    { label: 'Find nearby rescuers', desc: 'NGO units in your sector grid', icon: <MapPin className="w-3.5 h-3.5 text-[#00F2FF]" /> },
    { label: 'Contact nearest vet', desc: 'Dial verified partner pet hospitals', icon: <Info className="w-3.5 h-3.5 text-[#00F2FF]" /> },
    { label: 'Track active rescue', desc: 'Live ETA for ongoing operations', icon: <Compass className="w-3.5 h-3.5 text-[#FF4E00]" /> },
    { label: 'Change language', desc: 'Toggle dialects instantly', icon: <Smile className="w-3.5 h-3.5 text-[#00F2FF]" /> },
    { label: 'Enable audio guidance', desc: 'Talkback voice triage feedback', icon: <Sparkles className="w-3.5 h-3.5 text-[#FF4E00]" /> },
  ];

  return (
    <div className="flex-1 pb-32 overflow-hidden w-full px-4 md:px-6 max-w-md md:max-w-xl mx-auto pt-4 animate-in fade-in duration-300 flex flex-col justify-between" style={{ minHeight: 'calc(100vh - 150px)' }}>
      
      <div className="flex-1 flex flex-col overflow-hidden min-h-[400px]">
        {/* Banner header of humanitarian rescue pilot */}
        <div className="p-4 rounded-2xl bg-[#0C0F16] border border-white/10 relative overflow-hidden flex items-center justify-between shadow-xl mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping" />
              <span className="text-[10px] font-mono tracking-widest text-[#00F2FF] uppercase font-bold">COMPAWSS CO-PILOT ACTIVE</span>
            </div>
            <h3 className="font-display font-black text-sm text-white">Rescue Overwatch Desk</h3>
            <p className="text-[9.5px] text-[#cbc3d7]/60">Humanitarian animal support assistant</p>
          </div>
          <CompawssLogo size={34} animate={true} className="filter drop-shadow-[0_0_8px_rgba(255,184,0,0.25)]" />
        </div>

        {/* Global toggles info card */}
        {(audioGuidance || lang !== 'en') && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex flex-wrap gap-2 text-[9.5px] text-[#00F2FF] font-mono justify-between">
            {lang !== 'en' && <span>Locale: {lang === 'hi' ? 'Hindi (हिन्दी)' : 'Bengali (বাংলা)'}</span>}
            {audioGuidance && <span className="flex items-center gap-1">🗣️ Voice Guidance On</span>}
          </div>
        )}

        {/* Chat message threads */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth">
          {messages.map((m, idx) => (
            <div 
              key={idx}
              className={`flex items-start gap-2.5 w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="h-8 w-8 rounded-lg bg-[#00F2FF]/10 flex items-center justify-center shrink-0 border border-[#00F2FF]/25 overflow-hidden">
                  <CompawssLogo size={20} />
                </div>
              )}
              <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-stretch">
                <div 
                  className={`rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-md break-words overflow-hidden whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-[#FF4E00]/15 border border-[#FF4E00]/30 text-white rounded-tr-none'
                      : 'bg-[#12121A] border border-white/10 text-white rounded-tl-none'
                  }`}
                >
                  <p className="font-sans leading-normal">{m.text}</p>

                  {/* Actions inside individual message card */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                      {m.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={act.onClick}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-[#FF4E00]/20 border border-[#FF4E00]/30 hover:bg-[#FF4E00]/30 active:scale-95 transition cursor-pointer"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#FF4E00]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-options below the latest message block */}
                {m.options && m.options.length > 0 && (
                  <div className="flex flex-col gap-1.5 mt-2 max-w-full">
                    {m.options.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => processMessage(opt)}
                        className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-[#00F2FF] bg-[#00F2FF]/5 border border-[#00F2FF]/15 hover:bg-[#00F2FF]/15 hover:border-[#00F2FF]/35 active:scale-95 transition break-words whitespace-normal font-sans cursor-pointer leading-tight shadow-sm"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick helper triggers list requested */}
        <div className="border-t border-white/5 pt-4 space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#FF4E00] block pl-1 font-mono">
            Rescue Macro Shortcuts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full">
            {QUICK_ACTIONS.map((action, actionIdx) => (
              <button
                key={actionIdx}
                onClick={() => handleQuickAction(action.label)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#090A0F] border border-white/5 hover:border-[#FF4E00]/40 hover:bg-[#FF4E00]/5 transition duration-150 cursor-pointer text-left min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="shrink-0">{action.icon}</div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-white block truncate leading-tight">
                      {action.label}
                    </span>
                    <span className="text-[9px] text-[#cbc3d7]/50 block truncate leading-none mt-0.5 font-sans">
                      {action.desc}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input textbox bar */}
      <div className="p-2.5 bg-[#12121A] rounded-xl border border-white/10 flex items-center gap-1.5 mt-4 shadow-xl">
        <input 
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask Compawss pilot or report status..."
          className="bg-transparent border-0 text-white focus:outline-none focus:ring-0 text-xs flex-1 px-2 py-1 placeholder-white/30 font-sans"
          onKeyDown={(e) => e.key === 'Enter' && sendMsg()}
        />
        <button 
          onClick={sendMsg}
          className="px-4 py-1.5 bg-[#FF4E00] text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-[#FF4E00]/85 transition font-sans flex items-center justify-center whitespace-nowrap"
        >
          Send
        </button>
      </div>
    </div>
  );
};
