import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff,
  MapPin, 
  Check, 
  Trash, 
  Cpu, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  Heart, 
  ChevronRight, 
  ShieldAlert, 
  Calendar,
  Camera,
  Upload,
  Play,
  Square,
  Pause,
  RefreshCw,
  Volume2,
  Lock,
  Compass,
  Crosshair,
  Info,
  Users,
  CheckCircle,
  Clock,
  ArrowLeft,
  AlertOctagon,
  Loader2,
  FileVideo,
  Eye,
  ArrowRight,
  Sparkle,
  ShieldCheck,
  Flame,
  User,
  VolumeX,
  Map
} from 'lucide-react';
import { Screen } from '../../types';
import { CompawssLogo } from '../CompawssLogo';
import { useRescue } from '../../context/RescueContext';
import { getDemoMode } from '../../data';
import { uploadRescueImage } from '../../services/supabaseClient';
import { 
  checkBackendHealth, 
  BACKEND_URL,
  analyzeImage, 
  classifyReport, 
  computeSeverityScore, 
  recommendAction, 
  matchResponders, 
  translateGuidance,
  useBackendStatus
} from '../../services/aiService';


/* ==========================================================================
   INTERACTIVE FIELD RESCUER PRESETS DATA
   ========================================================================== */
interface PresetData {
  id: string;
  name: string;
  species: string;
  image: string;
  severity: 'Critical' | 'Urgent' | 'Moderate' | 'Unknown';
  tags: string[];
  count: number;
  landmark: string;
  notes: string;
  confidence: number;
  anomalies: string;
  directives: string[];
  transcriptions: {
    en: string;
    hi: string;
    bn: string;
  };
}

const PRESETS: Record<string, PresetData> = {
  dog: {
    id: 'dog',
    name: 'Canis Trauma Block',
    species: 'Canis lupus familiaris (Shih Tzu Mix)',
    image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
    severity: 'Critical',
    tags: ['bleeding', 'unable to walk', 'hit by vehicle'],
    count: 1,
    landmark: 'Sree Krishna Sweets Corner',
    notes: 'Resting listlessly under a green vegetable vendor cart. Trembling severely when approached.',
    confidence: 97.4,
    anomalies: 'Active left lower body bleeding, apparent trauma, skeletal limb displacement',
    directives: [
      'Apply subtle direct gauze pressure to stop vascular bleed if the subject allows.',
      'Wrap in an isothermal blanket or dry cloth to restrict shivering and physical shock.',
      'Maintain clear air passages; do not offer food or force oral fluid intake immediately.'
    ],
    transcriptions: {
      en: "Calling dispatch from Sector 4 near the wholesale food market, gate three. I am looking at a medium stray shih tzu mix. It has been struck by a rapid motorbike and is bleeding from its rear-left leg, whimpering heavily, and cannot stand on its own.",
      hi: "सेक्टर ४ थोक बाजार गेट ३ के पास दुर्घटना की सूचना। मुझे एक घायल कुत्ता मिला है। इसके पिछले बाएं पैर से गंभीर रक्तस्राव हो रहा है और वह चल नहीं पा रहा है। दर्द से कराह रहा है, कृपया त्वरित सहायता भेजें।",
      bn: "সেক্টর ৪ পাইকারি বাজার গেট ৩ এর কাছে জরুরি উদ্ধার রিপোর্ট। আমি একটি মারাত্মক আহত কুকুর দেখতে পাচ্ছি। এর পেছনের বাম পা থেকে রক্তপাত হচ্ছে এবং এটি সোজা হয়ে দাঁড়াতে পারছে না। প্রচণ্ড যন্ত্রণায় কাতর।"
    }
  },
  kitten: {
    id: 'kitten',
    name: 'Feline Trap Grid',
    species: 'Felis catus (Calico Kitten)',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
    severity: 'Urgent',
    tags: ['trapped', 'dehydrated', 'abandoned baby'],
    count: 1,
    landmark: 'Greenwood Heights Main Substation',
    notes: 'Stuck about 2 meters down the horizontal storm water drain. Screaming continuously.',
    confidence: 94.8,
    anomalies: 'Severe fluid loss, vocal desperation, confined environment threat',
    directives: [
      'Avoid inserting metallic poles. Lower a soft fabric mesh rope to allow self-climbing traction.',
      'Prepare warm ambient shelter to raise body core temperature post-extraction.',
      'Prepare safe rehydration solutions (lactated Ringer or sugar-water drip feeds).'
    ],
    transcriptions: {
      en: "Located a tiny calico kitten trapped deep inside the storm drainage grates near the power substation. It seems extremely dehydrated, cold, and has been screaming for help for hours. Need a extraction tool.",
      hi: "ग्रीनवुड हाइट्स सबस्टेशन नाले में फंसा हुआ एक बिल्ली का बच्चा। यह बहुत कमजोर, निर्जलित और ठंडा महसूस हो रहा है। नाले से निकालने वाले सहायक उपकरणों के साथ बचाव टीम चाहिए।",
      bn: "গ্রীনউড হাইটস সাবস্টেশন সন্নিহিত নর্দমার ভেতর একটি ছোট বিড়ালের বাচ্চা আটকা পড়েছে। এটি অত্যন্ত পানিশূন্যতায় ভুগছে ও ঠাণ্ডা হয়ে গেছে। নালা থেকে উদ্ধারের জন্য রেসকিউ টুল সহ টিম পাঠান।"
    }
  },
  manual: {
    id: 'manual',
    name: 'Manual Node Setup',
    species: 'Unidentified Stray Species',
    image: '',
    severity: 'Moderate',
    tags: ['unknown condition'],
    count: 1,
    landmark: '',
    notes: '',
    confidence: 76.5,
    anomalies: 'External lesion profiling required, respiratory assessment pending',
    directives: [
      'Maintain a safe static perimeter of at least 3 meters until rescue specialists arrive.',
      'Document visual media elements from multiple vectors if animal remains steady.',
      'Ensure clear access paths for incoming first-responder vehicles.'
    ],
    transcriptions: {
      en: "Visual incident report initialized. Standing by for multi-spectral AI diagnostic capture. Reporting local stray animal showing distinct discomfort, standing close to the local service road.",
      hi: "दैनिक आपातकालीन बचाव कॉल। सड़क के किनारे एक पशु गंभीर अवस्था में देखा गया है। उसकी शारीरिक स्थिति ठीक नहीं है, कृपया एआई डिटेक्टर तैनात करें।",
      bn: "নতুন সড়ক উদ্ধার রিপোর্ট। রাস্তার পাশে একটি পশু অত্যন্ত শারীরিক অস্বস্তিতে রয়েছে। অবিলম্বে মেডিকেল টিম ও ভেটেরিনারি এম্বুলেন্স সহায়তা প্রয়োজন।"
    }
  }
};

/* ==========================================================================
   1. VOICE & MULTI-MEDIA REPORTING SCREEN
   ========================================================================== */
interface VoiceReportingProps {
  onNavigate: (screen: Screen) => void;
}

export const VoiceReportingView: React.FC<VoiceReportingProps> = ({ onNavigate }) => {
  const { userLocation, requestGpsPermission, gpsPermission } = useRescue();
  const [activePreset, setActivePreset] = useState<'dog' | 'kitten' | 'manual'>('dog');
  const [lang, setLang] = useState<'en' | 'hi' | 'bn'>('en');
  
  // Media capture state - NO FAKE IMAGE
  const [capturedMedia, setCapturedMedia] = useState<{ type: 'photo' | 'video' | 'none'; url: string | null }>({
    type: 'none',
    url: null
  });
  const [isLiveCamera, setIsLiveCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Voice recording states - NO FAKE DATA
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'paused' | 'playback'>('idle');
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [transcription, setTranscription] = useState(''); // Empty by default - user must record or type
  const [isPlaybackPlaying, setIsPlaybackPlaying] = useState(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Dynamic fields - NO FAKE DEFAULTS
  const [severity, setSeverity] = useState<'Critical' | 'Urgent' | 'Moderate' | 'Unknown'>('Unknown');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [animalCount, setAnimalCount] = useState<number>(1);
  const [landmark, setLandmark] = useState<string>(''); // Empty - user must provide
  const [locationNotes, setLocationNotes] = useState<string>(''); // Empty - user must provide
  const [immediateDanger, setImmediateDanger] = useState<boolean>(false);
  const [anonymous, setAnonymous] = useState<boolean>(false);
  
  // Waveform animation mock values
  const [equalizerHeights, setEqualizerHeights] = useState<number[]>([12, 12, 12, 12, 12, 12, 12, 12, 12, 12]);

  // Handle Preset Switching - ONLY FOR DEMO MODE
  const applyPreset = (presetKey: 'dog' | 'kitten' | 'manual') => {
    setActivePreset(presetKey);
    
    // Only auto-fill if in demo mode
    if (getDemoMode()) {
      const p = PRESETS[presetKey];
      setSeverity(p.severity);
      setSelectedTags([...p.tags]);
      setAnimalCount(p.count);
      setLandmark(p.landmark);
      setLocationNotes(p.notes);
      setTranscription(p.transcriptions[lang]);
      
      if (presetKey === 'manual') {
        setCapturedMedia({ type: 'none', url: null });
      } else {
        setCapturedMedia({ type: 'photo', url: p.image });
      }
    } else {
      // In normal mode, just set the species hint
      setSeverity('Unknown');
      setSelectedTags([]);
      setAnimalCount(1);
      setLandmark('');
      setLocationNotes('');
      setTranscription('');
      setCapturedMedia({ type: 'none', url: null });
    }
  };

  // Sync translation when language switcher is toggled - ONLY IN DEMO MODE
  useEffect(() => {
    if (getDemoMode()) {
      setTranscription(PRESETS[activePreset].transcriptions[lang]);
    }
  }, [lang, activePreset]);

  // Handle Live Camera initiation
  const toggleCamera = async () => {
    if (isLiveCamera) {
      stopCamera();
    } else {
      setIsLiveCamera(true);
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Camera access failed:", err);
        setCameraError("Camera access denied or unavailable.");
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsLiveCamera(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Capture snapshot from real webcam video stream
  const captureSnapshot = () => {
    if (videoRef.current && streamRef.current && !cameraError) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedMedia({ type: 'photo', url: dataUrl });
          
          // Sync with draft storage immediately
          const rawDraft = localStorage.getItem('compawss_active_draft');
          if (rawDraft) {
            try {
              const parsed = JSON.parse(rawDraft);
              parsed.image = dataUrl;
              localStorage.setItem('compawss_active_draft', JSON.stringify(parsed));
            } catch (e) {
              console.warn('Error syncing draft storage:', e);
            }
          }
        }
        stopCamera();
      } catch (err) {
        console.error("Failed to capture image from video stream:", err);
      }
    }
  };

  // File Uploader handle
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await uploadRescueImage(file);
        setCapturedMedia({ type: mediaType, url });
        
        // Also update our localStorage draft image URL immediately!
        const rawDraft = localStorage.getItem('compawss_active_draft');
        if (rawDraft) {
          try {
            const parsed = JSON.parse(rawDraft);
            parsed.image = url;
            localStorage.setItem('compawss_active_draft', JSON.stringify(parsed));
          } catch (e) {
            console.warn('Error syncing draft storage:', e);
          }
        }
      } catch (err) {
        console.error('File upload conversion failed:', err);
        const url = URL.createObjectURL(file);
        setCapturedMedia({ type: mediaType, url });
      }
    }
  };

  // Voice recording simulation loop
  useEffect(() => {
    let timer: any;
    if (voiceState === 'recording') {
      timer = setInterval(() => {
        setVoiceSeconds(s => s + 1);
        // Animate simulated radio waveform
        setEqualizerHeights(Array.from({ length: 10 }, () => Math.floor(Math.random() * 32) + 6));
      }, 1000);
    } else {
      setEqualizerHeights([12, 12, 12, 12, 12, 12, 12, 12, 12, 12]);
    }
    return () => clearInterval(timer);
  }, [voiceState]);

  // Audio Playback simulation loop
  useEffect(() => {
    let timer: any;
    if (isPlaybackPlaying) {
      timer = setInterval(() => {
        setAudioPlaybackProgress(p => {
          if (p >= 100) {
            setIsPlaybackPlaying(false);
            clearInterval(timer);
            return 0;
          }
          return p + 10;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaybackPlaying]);

  const handleStartVoiceRecord = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(audioBlob);
        
        // Try speech recognition if available
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'bn' ? 'bn-IN' : 'en-IN';
          recognition.continuous = false;
          recognition.interimResults = false;
          
          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setTranscription(transcript);
            console.log('[REAL_MICROPHONE] Speech-to-text result:', transcript);
          };
          
          recognition.onerror = (event: any) => {
            console.warn('[REAL_MICROPHONE] Speech recognition error:', event.error);
            setTranscription('[Audio recorded, transcription unavailable. Please type your report.]');
          };
          
          recognition.start();
        } else {
          console.warn('[REAL_MICROPHONE] Speech recognition not available in this browser');
          setTranscription('[Audio recorded, transcription unavailable. Please type your report.]');
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        setVoiceState('playback');
      };
      
      // Start recording
      mediaRecorder.start();
      setVoiceSeconds(0);
      setVoiceState('recording');
      setTranscription('');
      console.log('[REAL_MICROPHONE] Recording started');
      
    } catch (error) {
      console.error('[REAL_MICROPHONE] Microphone access denied or error:', error);
      alert('Microphone access denied. Please allow microphone permission or type your report manually.');
      setVoiceState('idle');
    }
  };
  
  const handleStopVoiceRecord = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('[REAL_MICROPHONE] Recording stopped');
    }
  };

  // Reactively respond to CTA redirects from the Empty Scan state
  useEffect(() => {
    const forceCam = localStorage.getItem('compawss_force_camera');
    if (forceCam === 'true') {
      localStorage.removeItem('compawss_force_camera');
      setCapturedMedia({ type: 'none', url: null });
      applyPreset('manual');
      toggleCamera();
    }

    const forceUpload = localStorage.getItem('compawss_force_upload');
    if (forceUpload === 'true') {
      localStorage.removeItem('compawss_force_upload');
      setCapturedMedia({ type: 'none', url: null });
      applyPreset('manual');
    }

    const forceVoice = localStorage.getItem('compawss_force_voice');
    if (forceVoice === 'true') {
      localStorage.removeItem('compawss_force_voice');
      applyPreset('manual');
      handleStartVoiceRecord();
    }
  }, []);

  // Multiselect tags handler
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Submit Draft to dispatch (transitions to next view with state cache)
  const handleSubmitDraft = () => {
    const reportDraftObj = {
      presetId: activePreset,
      media: capturedMedia,
      severity,
      tags: selectedTags,
      animalCount,
      landmark,
      notes: locationNotes,
      danger: immediateDanger,
      isAnonymous: anonymous,
      transcription,
      language: lang
    };
    
    // Save draft securely in local storage for screen transition syncing
    localStorage.setItem('compawss_active_draft', JSON.stringify(reportDraftObj));
    localStorage.setItem('compawss_analysis_started', 'true');
    
    // Go to next view Case Analysis Screen
    onNavigate(Screen.InjuryAnalysis);
  };

  return (
    <div className="flex-1 pb-32 overflow-y-auto w-full px-4 md:px-8 max-w-lg mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Telemetry Header */}
      <div className="flex items-center justify-between border-b border-[#00F2FF]/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-mono text-[10px] uppercase text-[#00F2FF] font-black tracking-widest">
            AI RESCUE TRANSMITTER // TERM_DECK v4.1
          </span>
        </div>
        <span className="bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00] text-[8px] font-mono px-2 py-0.5 rounded uppercase tracking-wider font-bold">
          COMMS ACTIVE
        </span>
      </div>

      {/* Preset Injectors Section (Interactive simulation aids) */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#cbc3d7]/60 block">
          ⚡ Select Simulation Scenario Preset
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'dog', title: '🐕 Canis Dog', subtitle: 'Critical Bleed' },
            { key: 'kitten', title: '🐈 Feline Trap', subtitle: 'Drain Grate' },
            { key: 'manual', title: '🛠️ Manual Edit', subtitle: 'Empty Grid' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => applyPreset(item.key as any)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-16 ${
                activePreset === item.key
                  ? 'bg-gradient-to-tr from-[#FF4E00]/20 to-[#00F2FF]/5 border-[#FF4E00] shadow-[0_0_12px_rgba(255,184,0,0.15)]'
                  : 'bg-[#14141a] border-white/5 hover:bg-[#1a1a24] hover:border-white/10'
              }`}
            >
              <span className="text-xs font-bold text-white block leading-none">{item.title}</span>
              <span className="text-[9px] text-[#cbc3d7]/50 font-mono font-semibold">{item.subtitle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Viewport Capture Console Container */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c12] relative overflow-hidden shadow-2xl">
        {/* Simple Human HUD Title */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 px-2 py-0.5 bg-black/70 border border-white/10 rounded-full">
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveCamera ? 'bg-red-500 animate-pulse' : 'bg-[#cbc3d7]/40'}`} />
          <span className="text-[8px] font-mono text-white uppercase tracking-widest">
            {isLiveCamera ? 'LIVE CAMERA' : capturedMedia.url ? 'MEDIA WORKSPACE' : 'CAMERA STANDBY'}
          </span>
        </div>

        {/* Viewport frame itself */}
        <div className="h-64 relative bg-[#06060a] flex items-center justify-center overflow-hidden">
          
          {/* Grid canvas background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#14141e_1px,transparent_1px),linear-gradient(to_bottom,#14141e_1px,transparent_1px)] bg-[size:16px_16px] opacity-35" />

          {isLiveCamera ? (
            <div className="w-full h-full relative">
              {cameraError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 space-y-3 bg-[#08080c]/95">
                  <AlertOctagon className="w-8 h-8 text-red-500" />
                  <p className="text-xs font-sans text-red-400 font-bold leading-normal">{cameraError}</p>
                  <label className="mt-2 px-4 py-2 bg-[#00F2FF]/10 hover:bg-[#00F2FF]/20 border border-[#00F2FF]/30 text-[#00F2FF] rounded-xl text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md">
                    <Upload className="w-4 h-4 text-[#00F2FF]" />
                    UPLOAD IMAGE FROM DEVICE
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        handleFileUpload(e, 'photo');
                        stopCamera();
                      }} 
                    />
                  </label>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
          ) : capturedMedia.url ? (
            <div className="w-full h-full relative">
              {capturedMedia.type === 'video' ? (
                <video src={capturedMedia.url} controls className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={capturedMedia.url} 
                  alt="Incident Visual Preview" 
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
              )}
              {/* Confirmed Lock Graphics Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[9px] rounded uppercase font-bold tracking-wider">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    MEDIA FRAME LOCKED
                  </div>
                  <button 
                    onClick={() => setCapturedMedia({ type: 'none', url: null })}
                    className="p-1 px-2.5 bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg text-[9px] font-bold font-mono transition-colors"
                  >
                    DISCARD
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Camera className="w-10 h-10 text-[#cbc3d7]/30" />
              <p className="text-xs font-mono text-[#cbc3d7]/60">NO RESCUE VISUAL ACTIVE</p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs justify-center pt-1">
                <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-[10.5px] font-mono font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-sm">
                  <Upload className="w-3.5 h-3.5 text-[#00F2FF]" />
                  UPLOAD PHOTO
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'photo')} 
                  />
                </label>
                <label className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-[10.5px] font-mono font-bold tracking-wider transition cursor-pointer flex items-center justify-center gap-1 shadow-sm">
                  <FileVideo className="w-3.5 h-3.5 text-[#FF4E00]" />
                  UPLOAD VIDEO
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'video')} 
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Tactical Media Action Deck Control */}
        <div className="p-3 bg-[#111116] border-t border-white/5 grid grid-cols-2 gap-2 font-mono">
          <button
            onClick={toggleCamera}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isLiveCamera 
                ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30' 
                : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
            }`}
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            {isLiveCamera ? 'STOP WEBCAM' : 'OPEN WEBCAM'}
          </button>

          {isLiveCamera ? (
            <button
              onClick={captureSnapshot}
              disabled={!!cameraError}
              className={`py-2 rounded-xl text-xs font-black tracking-wider transition flex items-center justify-center gap-1 ${
                cameraError 
                  ? 'bg-[#181822] border border-white/5 text-[#cbc3d7]/20 cursor-not-allowed shadow-none' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer shadow-[0_2px_10px_rgba(6,182,212,0.35)]'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              CAPTURE SCAN
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              <label className="py-2 border border-white/10 hover:border-cyan-400/30 hover:bg-white/5 rounded-xl text-[10px] font-bold text-[#cbc3d7] tracking-wider transition cursor-pointer flex items-center justify-center gap-1">
                <Upload className="w-3.5 h-3.5 text-[#00F2FF]" />
                PHOTO
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'photo')} 
                />
              </label>

              <label className="py-2 border border-white/10 hover:border-cyan-400/30 hover:bg-white/5 rounded-xl text-[10px] font-bold text-[#cbc3d7] tracking-wider transition cursor-pointer flex items-center justify-center gap-1">
                <FileVideo className="w-3.5 h-3.5 text-[#FF4E00]" />
                VIDEO
                <input 
                  type="file" 
                  accept="video/*" 
                  capture="environment"
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'video')} 
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Active Speech Vocal Terminal */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-[#FF4E00]" />
            <span className="font-mono text-[9px] text-[#FF4E00] uppercase font-black tracking-widest leading-none">
              VOICE SOS CO-PILOT SYSTEM
            </span>
          </div>
          
          {/* Active Multilingual Input Selector */}
          <div className="flex gap-1 items-center bg-black/40 border border-white/5 p-0.5 rounded-lg">
            <span className="text-[7.5px] font-mono font-bold text-[#cbc3d7]/40 px-1">LANG:</span>
            {(['en', 'hi', 'bn'] as const).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded transition ${
                  lang === l 
                    ? 'bg-[#FF4E00] text-white font-mono scale-105 shadow' 
                    : 'text-[#cbc3d7]/40 hover:text-white'
                }`}
              >
                {l === 'en' ? 'EN' : l === 'hi' ? 'हिन्दी' : 'বাংলা'}
              </button>
            ))}
          </div>
        </div>

        {/* Equalizer animation pane */}
        <div className="flex items-center justify-between bg-[#111116] border border-white/5 rounded-xl p-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (voiceState === 'recording') {
                  handleStopVoiceRecord();
                } else if (voiceState === 'idle') {
                  handleStartVoiceRecord();
                } else {
                  setVoiceState('idle');
                  setVoiceSeconds(0);
                }
              }}
              className={`h-11 w-11 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                voiceState === 'recording'
                  ? 'bg-red-500/20 text-red-500 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse'
                  : 'bg-[#FF4E00]/10 text-[#FF4E00] border border-[#FF4E00]/25 hover:bg-[#FF4E00]/20'
              }`}
            >
              {voiceState === 'recording' ? <Square className="w-4 h-4 fill-red-500" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="space-y-0.5 text-left">
              <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase tracking-widest font-black block">
                {voiceState === 'recording' ? 'DICTATING SPEECH DATA' : voiceState === 'paused' ? 'RECORD PAUSED' : voiceState === 'playback' ? 'DICTATION CAPTURED' : 'STANDBY TRANSCRIPTER'}
              </span>
              <span className="text-xs font-mono font-bold text-white block">
                00:{voiceSeconds < 10 ? `0${voiceSeconds}` : voiceSeconds} <span className="text-[10px] text-[#cbc3d7]/50">/ 00:30</span>
              </span>
            </div>
          </div>

          {/* Equalizer Waveform bars */}
          <div className="flex items-center gap-1 justify-center h-8 px-2">
            {equalizerHeights.map((h, i) => (
              <span 
                key={i} 
                style={{ height: `${h}px` }}
                className={`w-[3px] bg-gradient-to-t rounded-full transition-all duration-300 ${
                  voiceState === 'recording' ? 'from-[#FF4E00] to-[#00F2FF]' : 'from-white/10 to-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Preview Speech Playback controls (if recorded) */}
        {voiceState === 'playback' && (
          <div className="p-2 bg-cyan-500/5 border border-cyan-400/20 rounded-xl flex items-center justify-between text-left animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setIsPlaybackPlaying(!isPlaybackPlaying);
                }}
                className="h-8 w-8 bg-cyan-400 hover:bg-cyan-300 text-black rounded-lg flex items-center justify-center cursor-pointer transition"
              >
                {isPlaybackPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 fill-black" />}
              </button>
              <div className="space-y-0.5">
                <span className="text-[8.5px] font-mono text-cyan-400 font-bold uppercase block tracking-wider leading-none">PLAYBACK AUDIO MEMO</span>
                <span className="text-[9px] text-[#cbc3d7]/70 font-mono">Incident_Telemetry_VoIP_001.raw</span>
              </div>
            </div>
            
            {/* Playback progress bar */}
            <div className="flex-1 max-w-[120px] mx-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${audioPlaybackProgress}%` }} />
            </div>

            <button
              onClick={() => {
                setVoiceSeconds(0);
                setVoiceState('idle');
                setTranscription(''); // Clear transcription for re-recording
                if (recordedAudioBlob.current) {
                  recordedAudioBlob.current = null;
                }
              }}
              className="p-1 px-2.5 bg-white/5 border border-white/10 text-[#cbc3d7] hover:text-white rounded-lg text-[9px] font-mono font-bold"
            >
              RE-RECORD
            </button>
          </div>
        )}

        {/* Transcript editor box */}
        <div className="space-y-1.5 text-left">
          <label className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase tracking-widest font-black pl-1 block">Live ASR Text Output</label>
          <div className="relative">
            <textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Live audio transcript output matches speak voice. You can also type manually here..."
              rows={3}
              className="w-full bg-[#111116] border border-white/5 hover:border-white/10 focus:border-[#FF4E00] focus:ring-1 focus:ring-[#FF4E00]/25 rounded-xl p-3 text-xs text-white leading-relaxed placeholder-white/20 select-text outline-none resize-none"
            />
            <span className="absolute bottom-2.5 right-2.5 flex items-center gap-1 text-[8.5px] font-mono text-[#cbc3d7]/40 select-none">
              <Sparkles className="w-3 h-3 text-[#00F2FF]" />
              SECURE RAW STAGE
            </span>
          </div>
        </div>
      </div>

      {/* Field Metadata Questionnaire */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 shadow-2xl text-left space-y-5">
        
        <div className="border-b border-white/5 pb-2">
          <span className="font-mono text-[9px] text-cyan-400 uppercase font-black tracking-widest leading-none">
            EMERGENCY PARAMETER COUPLING
          </span>
        </div>

        {/* Severity levels */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#cbc3d7]/60 block">
            🚨 Select Emergency Severity Factor
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Critical', 'Urgent', 'Moderate', 'Unknown'] as const).map(lvl => {
              const styles = {
                Critical: 'border-red-500/35 text-red-400 bg-red-500/5 hover:bg-red-500/15',
                Urgent: 'border-orange-500/35 text-orange-400 bg-orange-500/5 hover:bg-orange-500/15',
                Moderate: 'border-amber-500/35 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15',
                Unknown: 'border-slate-500/35 text-slate-400 bg-slate-500/5 hover:bg-slate-500/15'
              };
              const activeStyles = {
                Critical: 'border-red-500 text-white bg-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.25)]',
                Urgent: 'border-orange-500 text-white bg-orange-500/25 shadow-[0_0_8px_rgba(249,115,22,0.25)]',
                Moderate: 'border-amber-500 text-white bg-amber-500/25 shadow-[0_0_8px_rgba(245,158,11,0.25)]',
                Unknown: 'border-slate-400 text-white bg-slate-500/40 shadow-[0_0_8px_rgba(100,116,139,0.25)]'
              };
              const isActive = severity === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverity(lvl)}
                  className={`py-2 rounded-xl text-[10px] font-bold font-mono tracking-wider border text-center transition cursor-pointer ${
                    isActive ? activeStyles[lvl] : styles[lvl]
                  }`}
                >
                  {lvl.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Animal condition tags multiselect */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#cbc3d7]/60 block">
            🏷️ Animal Condition Signs (Select all that apply)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              'bleeding', 
              'unable to walk', 
              'unconscious', 
              'trapped', 
              'hit by vehicle', 
              'dehydrated', 
              'abandoned baby', 
              'aggressive injury', 
              'unknown condition'
            ].map(tag => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold font-sans border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF4E00]/20 border-[#FF4E00] text-red-200 scale-105'
                      : 'bg-[#111116] border-white/5 text-[#cbc3d7]/60 hover:text-white hover:border-white/10'
                  }`}
                >
                  {isSelected && '✓ '}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location notes Landmark Animal Counter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#cbc3d7]/40 uppercase block pl-1">Number of Animals</span>
            <div className="flex items-center gap-2 bg-[#111116] border border-white/5 rounded-xl p-1 max-w-[120px]">
              <button 
                type="button"
                onClick={() => setAnimalCount(Math.max(1, animalCount - 1))}
                className="h-8 w-8 bg-white/5 rounded-lg font-mono text-xs flex items-center justify-center text-white font-black hover:bg-white/10 cursor-pointer"
              >
                -
              </button>
              <span className="flex-1 text-center font-mono font-bold text-xs text-white">{animalCount}</span>
              <button 
                type="button"
                onClick={() => setAnimalCount(animalCount + 1)}
                className="h-8 w-8 bg-white/5 rounded-lg font-mono text-xs flex items-center justify-center text-white font-black hover:bg-white/10 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#cbc3d7]/40 uppercase block pl-1">Key Nearby Landmark</span>
            <input 
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Metro Pillar 140, temple, sweets shop..."
              className="w-full bg-[#111116] border border-white/5 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 rounded-xl p-2 px-3 text-xs text-white outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-[#cbc3d7]/40 uppercase block pl-1">Specific Location Notes</span>
          <input 
            type="text"
            value={locationNotes}
            onChange={(e) => setLocationNotes(e.target.value)}
            placeholder="Describe alley direction, back wall of parking..."
            className="w-full bg-[#111116] border border-white/5 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 rounded-xl p-2.5 px-3 text-xs text-white outline-none"
          />
        </div>

        {/* Toggles bar */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setImmediateDanger(!immediateDanger)}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              immediateDanger 
                ? 'bg-red-500/10 border-red-500/30 text-red-200' 
                : 'bg-[#111116] border-white/5 text-[#cbc3d7]/50'
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-black font-sans uppercase block leading-none">Immediate Danger Nearby</span>
              <span className="text-[8px] font-mono text-[#cbc3d7]/40 leading-none">Traffic, heavy rainfall, hazard</span>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${immediateDanger ? 'bg-red-500 animate-ping' : 'bg-white/10'}`} />
          </button>

          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
              anonymous 
                ? 'bg-[#00F2FF]/10 border-[#00F2FF]/35 text-white' 
                : 'bg-[#111116] border-white/5 text-[#cbc3d7]/50'
            }`}
          >
            <div className="space-y-0.5">
              <span className="text-[9.5px] font-black font-sans uppercase block leading-none">Anonymous Report</span>
              <span className="text-[8px] font-mono text-[#cbc3d7]/40 leading-none">Mask my responder ID</span>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${anonymous ? 'bg-cyan-400' : 'bg-white/10'}`} />
          </button>
        </div>

        {/* Real GPS Location Display */}
        {userLocation.latitude && userLocation.longitude ? (
          <div className="p-3 bg-gradient-to-r from-green-500/5 to-transparent border border-green-500/20 rounded-xl flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-green-400 shrink-0" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-green-400 font-black uppercase tracking-widest block leading-none">GPS LOCATION CONFIRMED</span>
              <p className="text-[9px] text-[#cbc3d7]/70 font-mono">
                [LAT: {userLocation.latitude.toFixed(4)}° N, LON: {userLocation.longitude.toFixed(4)}° E] • {userLocation.name || 'Location detected'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <MapPin className="w-5 h-5 text-yellow-400 shrink-0" />
              <div className="flex-1 space-y-0.5">
                <span className="text-[9px] font-mono text-yellow-400 font-black uppercase tracking-widest block leading-none">⚠️ LOCATION REQUIRED</span>
                <p className="text-[9px] text-[#cbc3d7]/70 font-mono">
                  Enable GPS for accurate location or enter manually in landmark field
                </p>
              </div>
            </div>
            <button
              onClick={requestGpsPermission}
              disabled={gpsPermission === 'denied'}
              className={`w-full py-2 px-3 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
                gpsPermission === 'denied'
                  ? 'bg-red-500/10 border border-red-500/30 text-red-400 cursor-not-allowed'
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              }`}
            >
              {gpsPermission === 'denied' ? '🚫 GPS Permission Denied' : '📍 Request GPS Permission'}
            </button>
          </div>
        )}

      </div>

      {/* Main launch transmit button */}
      <div className="pt-2">
        <button
          onClick={handleSubmitDraft}
          disabled={!capturedMedia?.url}
          className={`w-full relative py-4 rounded-xl transition flex items-center justify-center gap-2 font-display font-black text-xs text-white uppercase tracking-widest cursor-pointer ${
            !capturedMedia?.url
              ? 'bg-[#181822] border border-white/5 text-[#cbc3d7]/30 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-[#FF4E00] to-orange-500 hover:brightness-110 active:scale-[0.98] shadow-[0_4px_30px_rgba(255,78,0,0.35)]'
          }`}
        >
          <Sparkle className="w-4 h-4 text-[#FFF1CC] animate-spin" style={{ animationDuration: '6s' }} />
          <span>INITIATE TACTICAL AI SCAN</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

    </div>
  );
};


/* ==========================================================================
   2. INJURY ANALYSIS (COMPUTER VISION AI REPORT & TACTICAL TRACKER)
   ========================================================================== */
interface InjuryAnalysisProps {
  onNavigate: (screen: Screen) => void;
}

export const InjuryAnalysisView: React.FC<InjuryAnalysisProps> = ({ onNavigate }) => {
  const { reportNewCase, addNotification, userLocation, isOffline } = useRescue();
  const [draft, setDraft] = useState<any>(null);
  const backendStatus = useBackendStatus();
  const isBackendLive = backendStatus.isLive;
  const [liveResults, setLiveResults] = useState<any>(null);

  
  // Custom tracking / scanning screens triggers
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [isDispatched, setIsDispatched] = useState(false);
  const [etaSeconds, setEtaSeconds] = useState(522); // starts at 8:42
  const [statusText, setStatusText] = useState('LOCKING SATELLITE COMMS');
  const [activeTab, setActiveTab] = useState<'details' | 'rules'>('details');

  const severity = liveResults?.classRes?.severity || draft?.severity || 'Critical';
  const selectedTags = liveResults?.classRes?.tags || draft?.tags || ['unknown condition'];

  // Load draft data and execute AI service checks in parallel on mount
  useEffect(() => {
    async function initAnalysis() {
      // 1. Diagnostics check: check if Python AI backend is live in direct non-blocking way
      const live = !isOffline && (await checkBackendHealth());

      // Load local draft
      const raw = localStorage.getItem('compawss_active_draft');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setDraft(parsed);

          const hasImage = !!parsed.media?.url;
          if (!hasImage) {
            setIsScanning(false);
          }

          if (live && (hasImage || parsed.transcription || parsed.notes)) {
            // Initiate backend calls safely, avoiding blocking main flow
            try {
              let imgRes = null;
              if (hasImage) {
                imgRes = await analyzeImage(parsed.media.url, parsed.presetId);
              }
              const classRes = parsed.transcription || parsed.notes
                ? await classifyReport(parsed.transcription || parsed.notes, parsed.presetId)
                : null;
              
              const hasBleed = parsed.tags?.includes('bleeding') || false;
              const hasMobility = parsed.tags?.includes('unable to walk') || false;
              const sevScoreRes = await computeSeverityScore(
                parsed.presetId || 'dog',
                parsed.tags || [],
                hasBleed,
                hasMobility,
                parsed.notes || ''
              );

              const recRes = await recommendAction(
                parsed.presetId || 'dog',
                parsed.severity || 'Critical',
                parsed.tags || []
              );

              setLiveResults({
                imgRes,
                classRes,
                sevScoreRes,
                recRes
              });
            } catch (err) {
              console.warn("Dynamic API request returned error, using fallback state cleanly:", err);
            }
          }
        } catch (e) {
          setDraft(null);
          setIsScanning(false);
        }
      } else {
        setIsScanning(false);
      }
    }
    initAnalysis();
  }, []);

  // Scanning counter loop simulation
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            setIsScanning(false);
            clearInterval(interval);
            return 100;
          }
          const increment = Math.floor(Math.random() * 8) + 3;
          const next = Math.min(100, p + increment);
          
          // Modify active system status logs organically
          if (next < 25) {
            setStatusText('ACQUIRING ORBITAL TELEMETRY MAPPING');
          } else if (next < 50) {
            setStatusText('ALIGNING FIELD CORNER CORRELATORS');
          } else if (next < 75) {
            setStatusText('INTERSECTING TAXONOMICAL SPECIES WEIGHTS');
          } else {
            setStatusText('DE-SHADOWING LESION MATRIX EDGE ARRAYS');
          }
          return next;
        });
      }, 90);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // ETA Ticking loop down from 8:42 if dispatched has processed
  useEffect(() => {
    let timer: any;
    if (isDispatched && etaSeconds > 0) {
      timer = setInterval(() => {
        setEtaSeconds(s => s - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isDispatched, etaSeconds]);

  // Helper to format minutes/seconds readable
  const formatSeconds = (total: number) => {
    const mm = Math.floor(total / 60);
    const ss = total % 60;
    return `${mm}m ${ss < 10 ? `0${ss}` : ss}s`;
  };

  // Safe fallback metadata block helper enriched by live Python AI responses when operational
  const basePreset = draft?.presetId ? PRESETS[draft.presetId as 'dog' | 'kitten' | 'manual'] : PRESETS.dog;
  const hasImage = !!draft?.media?.url;
  const resolvedPresetData = isBackendLive ? {
    id: draft?.presetId || 'manual',
    name: draft?.animalName || 'Active Scan Subject',
    species: hasImage ? (liveResults?.imgRes?.species ?? 'Processing Species...') : 'Unidentified (Requires Photo)',
    image: draft?.media?.url || '',
    severity: liveResults?.imgRes?.severity || liveResults?.classRes?.severity || 'Moderate',
    tags: liveResults?.imgRes?.tags || liveResults?.classRes?.tags || ['analyzing...'],
    count: draft?.animalCount || 1,
    landmark: draft?.landmark || 'Detected Coordinates',
    notes: draft?.notes || '',
    confidence: hasImage ? (liveResults?.imgRes?.confidence ?? 0) : 0,
    anomalies: hasImage ? (liveResults?.imgRes?.anomalies ?? 'Awaiting live AI vision results...') : 'No visual anomalies detected (Awaiting Photo Capture)',
    directives: liveResults?.imgRes?.directives || liveResults?.recRes?.directives || ['Awaiting live directives...'],
  } : {
    ...basePreset,
    confidence: hasImage ? (liveResults?.imgRes?.confidence ?? basePreset.confidence) : 0,
    anomalies: hasImage ? (liveResults?.imgRes?.anomalies ?? basePreset.anomalies) : 'No visual anomalies detected (Awaiting Photo Capture)',
    directives: liveResults?.imgRes?.directives || liveResults?.recRes?.directives || basePreset.directives,
    species: hasImage ? (liveResults?.imgRes?.species ?? basePreset.species) : 'Unidentified (Requires Photo)',
  };

  // Render scan progress bar
  if (isScanning) {
    return (
      <div className="flex-1 pb-32 overflow-y-auto w-full px-4 md:px-8 max-w-sm md:max-w-md mx-auto pt-12 space-y-10 text-center animate-in fade-in duration-300">
        
        {/* Hologram loading satellite graphic style */}
        <div className="relative flex items-center justify-center my-6">
          <div className="absolute w-28 h-28 bg-cyan-400/5 rounded-full animate-ping" />
          <div className="absolute w-40 h-40 bg-[#00F2FF]/10 rounded-full animate-pulse-slow" />
          <CompawssLogo size={180} animate={true} className="relative opacity-25 filter drop-shadow-[0_0_20px_rgba(0,242,255,0.25)] pointer-events-none scale-105" />
          
          {/* Neon spinning text percent meter */}
          <div className="absolute inset-x-0 bottom-2.5 flex flex-col items-center justify-center">
            <span className="font-display font-black text-3xl text-white tracking-widest">{scanProgress}%</span>
            <span className="text-[9px] font-mono uppercase text-cyan-400 tracking-widest font-black">AI ANALYZING</span>
          </div>
        </div>

        {/* Dynamic telemetry prompt status message */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 text-[#FF4E00] animate-spin" />
            <h3 className="font-display text-lg font-black text-rose-100 uppercase tracking-wide leading-none">
              PROCESSING SPECTRAL INPUT
            </h3>
          </div>
          
          <p className="text-xs text-[#cbc3d7]/70 max-w-xs mx-auto font-mono min-h-[32px] leading-relaxed">
            {statusText}...
          </p>
        </div>

        {/* Flow system progress bar layout */}
        <div className="space-y-2 max-w-xs mx-auto text-left">
          <div className="h-2 w-full bg-[#111116] border border-white/5 rounded-full overflow-hidden leading-none">
            <div 
              className="h-full bg-gradient-to-r from-[#FF4E00] via-amber-400 to-[#00F2FF] rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(0,242,255,0.5)]" 
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono text-[#cbc3d7]/30">
            <span>MUTAGEN CLASS VECTOR</span>
            <span>LOCK_RATIO: [{scanProgress}/100]</span>
          </div>
        </div>

        {/* AI Disclaimer Security Badge */}
        <div className="p-3 bg-white/3 border border-white/5 rounded-xl max-w-sm mx-auto text-left flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[8.5px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Edge-Compute Comms Mode</span>
            <p className="text-[10px] text-[#cbc3d7]/65 leading-normal">
              Analyzing photo indices on encrypted local sandboxed nodes. Private credentials remains 100% anonymous.
            </p>
          </div>
        </div>

      </div>
    );
  }

  /* RENDER DISPATCH TRACKING DECK (AFTER RESCUE SIGNAL INITIATED) */
  if (isDispatched) {
    return (
      <div className="flex-1 pb-32 overflow-y-auto w-full px-4 md:px-8 max-w-lg mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
        
        {/* Urgent Live Alert banner */}
        <div className="p-4 bg-gradient-to-r from-red-500/25 to-amber-500/5 border border-red-500/40 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="space-y-0.5 text-left">
            <span className="text-[8px] font-mono text-white px-2 py-0.5 bg-red-600 rounded-md font-bold uppercase tracking-widest inline-block animate-pulse">
              LIVE BROADCAST IN PROGRESS
            </span>
            <h3 className="font-display font-black text-base text-red-100">Rescue Unit Dispatched</h3>
            <p className="text-[10px] text-[#cbc3d7]/90 font-medium">Inter-agency medical responders linked onto local grid.</p>
          </div>
          <Heart className="w-8 h-8 text-red-400 shrink-0 fill-red-400 animate-pulse" />
        </div>

        {/* ETA Widget Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 shadow-2xl relative overflow-hidden text-left">
          <div className="absolute -right-8 -bottom-8 opacity-5">
            <CompawssLogo size={140} animate={true} />
          </div>

          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono text-[#00F2FF] font-black uppercase tracking-widest block leading-none">MOBILIZED DISPATCH ETA</span>
              <h2 className="font-display font-extrabold text-3xl text-white tracking-tight mt-1">
                {etaSeconds > 0 ? formatSeconds(etaSeconds) : "Ambulance Arrived"}
              </h2>
            </div>
            <Clock className="w-8 h-8 text-[#00F2FF]" />
          </div>

          {/* Details list inside tracking */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-mono">
            <div className="space-y-0.5">
              <span className="text-[9.2px] text-[#cbc3d7]/40 uppercase font-bold block">CASE IDENTIFIER</span>
              <span className="text-white font-black">COMPAWSS-2026-X84B</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9.2px] text-[#cbc3d7]/40 uppercase font-bold block">AI CLASSIFICATION</span>
              <span className="text-red-400 font-black">CLASS-A CRITICAL {severity.toUpperCase()}</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9.2px] text-[#cbc3d7]/40 uppercase font-bold block">NEAREST NGO DETECTED</span>
              <span className="text-white">Kolkata Welfare Assoc</span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[9.2px] text-[#cbc3d7]/40 uppercase font-bold block">VET STANDBY HUB</span>
              <span className="text-white">Animal Medical Clinic IV</span>
            </div>
          </div>
        </div>

        {/* Live Tracking Map Element (Requested!) */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 shadow-2xl space-y-3.5 text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="font-mono text-[9px] text-green-400 font-black uppercase tracking-widest block leading-none">REAL-TIME TACTICAL GPS MAP</span>
            </div>
            <span className="text-[8px] font-mono text-[#cbc3d7]/50">[GRID_S4_ZOOM_LEVEL_16.4]</span>
          </div>

          {/* Visual Vector Map Drawing */}
          <div className="h-44 bg-[#06060a] border border-white/5 rounded-xl relative overflow-hidden flex items-center justify-center">
            
            {/* Grid gridlines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#14141e_1px,transparent_1px),linear-gradient(to_bottom,#14141e_1px,transparent_1px)] bg-[size:12px_12px] opacity-25" />
            
            {/* Abstract SVG path lines mimicking streets */}
            <svg className="absolute inset-0 w-full h-full stroke-[#cbc3d7]/10 stroke-[2] fill-none" viewBox="0 0 400 200">
              <path d="M 0,40 L 400,40" />
              <path d="M 0,140 L 400,140" />
              <path d="M 120,0 L 120,200" />
              <path d="M 280,0 L 280,200" />
              
              {/* Tactical rescue route path vector line */}
              <path 
                d="M 120,40 L 280,40 L 280,140" 
                className="stroke-[#00F2FF]/45 stroke-[2.5]" 
                strokeDasharray="4 4" 
              />
            </svg>

            {/* Target Coordinate Red Dot (Subject Location) */}
            <div className="absolute left-[272px] top-[132px] flex items-center justify-center z-10 select-none">
              <span className="absolute h-8 w-8 bg-red-500/10 rounded-full animate-ping pointer-events-none" />
              <span className="absolute h-4 w-4 bg-red-500/30 rounded-full animate-pulse pointer-events-none" />
              <div className="h-2.5 w-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center" />
              <span className="absolute -top-5 bg-red-500 text-white font-mono font-bold text-[7.5px] px-1 py-0.5 rounded shadow leading-none uppercase select-none">
                TARGET SUBJECT
              </span>
            </div>

            {/* Ambulance Moving Vector Point (dispatched first responder asset) */}
            {/* The ambulance slowly animates closer based on ticking down etaSeconds */}
            <div 
              className="absolute z-10 transition-all duration-1000 select-none flex items-center justify-center"
              style={{
                left: etaSeconds > 0 
                  ? `${112 + Math.min(160, Math.max(0, (522 - etaSeconds) * 0.45))}px` 
                  : '272px',
                top: etaSeconds > 200 
                  ? '32px' 
                  : `${40 + Math.min(100, Math.max(0, (200 - etaSeconds) * 1.0))}px`
              }}
            >
              <div className="absolute h-9 w-9 bg-cyan-400/20 rounded-full animate-pulse-slow pointer-events-none" />
              <div className="h-6 w-6 bg-[#00F2FF] hover:brightness-110 rounded-full text-[#08080C] flex items-center justify-center shadow-lg border-2 border-white cursor-pointer group">
                <TruckIcon className="w-3.5 h-3.5" />
              </div>
              <span className="absolute -bottom-5 bg-cyan-400 text-black font-mono font-black text-[7.5px] px-1 py-0.5 rounded shadow leading-none uppercase whitespace-nowrap">
                NGO_FLEET_UNIT_3
              </span>
            </div>

            {/* Scale guide */}
            <div className="absolute bottom-2 left-2 bg-black/60 border border-white/10 px-1.5 py-0.5 rounded text-[7.5px] font-mono text-[#cbc3d7]/60 block select-none">
              SENS_SCALE: [0.1km]
            </div>
            
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 border border-white/10 px-1.5 py-0.5 rounded text-[7.5px] font-mono text-green-400 block select-none">
              <span className="h-1 w-1 bg-green-400 rounded-full animate-pulse" />
              SYS_STREAM: ENCRYPTED
            </div>
          </div>
        </div>

        {/* Emergency instructions tip board while waiting */}
        <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 shadow-2xl space-y-3.5 text-left relative overflow-hidden">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5 text-[#FF4E00]">
            <CheckCircle className="w-4.5 h-4.5" />
            <span className="font-mono text-[9px] font-black uppercase tracking-widest block leading-none">
              EMERGENCY FIELD PROTOCOLS
            </span>
          </div>

          <ul className="space-y-2.5 text-xs text-[#cbc3d7] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="bg-[#FF4E00]/15 text-[#FF4E00] font-mono text-[9.5px] h-4.5 w-4.5 font-bold rounded flex items-center justify-center shrink-0">1</span>
              <div>
                <strong className="text-white block">Keep Area Calm</strong>
                Minimize loud machinery or crowd gathering. Animal anxiety directly correlates to elevated blood pressure and hyper-ventilative shock.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-[#FF4E00]/15 text-[#FF4E00] font-mono text-[9.5px] h-4.5 w-4.5 font-bold rounded flex items-center justify-center shrink-0">2</span>
              <div>
                <strong className="text-white block">Provide Shade and Cover</strong>
                Protect the wet sections of lesions from overhead sun rays or incoming precipitation. Do not apply chemical ointments without specialised prescription tools.
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-[#FF4E00]/15 text-[#FF4E00] font-mono text-[9.5px] h-4.5 w-4.5 font-bold rounded flex items-center justify-center shrink-0">3</span>
              <div>
                <strong className="text-white block">Avoid Force Feeding</strong>
                Do not force push food or direct oral waters down the esophagus. If dehydrated, use a clean damp sponge around the gums to allow slow absorption.
              </div>
            </li>
          </ul>
        </div>

        {/* Dispatch Return button actions */}
        <div className="pt-2">
          <button
            onClick={() => onNavigate(Screen.Home)}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-green-500 hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 font-display font-bold text-xs text-white uppercase tracking-widest shadow-lg cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO PRIMARY OVERCOMMAND</span>
          </button>
        </div>

      </div>
    );
  }

  /* RENDER DETECTED DIAGNOSTIC DETAILS & DISPATCH SUBMIT BUTTON */
  return (
    <div className="flex-1 pb-32 overflow-y-auto w-full px-4 md:px-8 max-w-lg mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Python AI Backend Connection Status Indicator & Rich Diagnostics Panel */}
      <div className="p-4 rounded-2xl bg-[#0c0c12] border border-white/5 space-y-3 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-cyan-500 via-emerald-500 to-amber-500" />
        
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div>
            <span className="text-[9px] uppercase text-[#cbc3d7]/40 block leading-none font-bold">SYSTEM TELEMETRY</span>
            <h3 className="text-white text-xs font-bold font-display uppercase tracking-wider mt-0.5">Live Python AI Engine Diagnostics</h3>
          </div>
          {backendStatus.isWakingUp || backendStatus.checking ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8.5px] font-black uppercase tracking-wider">
              <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
              Waking/Scanning...
            </div>
          ) : isBackendLive ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400 text-[8.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live AI Connected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#FF4E00]/10 border border-[#FF4E00]/25 text-[#FF4E00] text-[8.5px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4E00]" />
              Demo AI Mode Active
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono text-[#cbc3d7]/80">
          <div>
            <span className="text-white/40 block text-[8px] uppercase font-bold mb-0.5">SERVICE ENDPOINT</span>
            <code className="text-cyan-400 bg-white/5 px-1 py-0.5 rounded text-[9px] block truncate" title={BACKEND_URL}>
              {BACKEND_URL}
            </code>
          </div>
          <div>
            <span className="text-white/40 block text-[8px] uppercase font-bold mb-0.5">CURRENT CO-PILOT MODE</span>
            <span className={`font-bold block ${isBackendLive ? 'text-green-400' : 'text-amber-400'}`}>
              {isBackendLive ? 'LIVE BACKEND' : (isOffline ? 'OFFLINE' : 'DEMO MODE')}
            </span>
          </div>
          <div>
            <span className="text-white/40 block text-[8px] uppercase font-bold mb-0.5">LAST CO-PILOT APU SYNC</span>
            <span className="block text-white/90 font-medium">
              {backendStatus.lastSuccessfulCall || 'Never'}
            </span>
          </div>
          <div>
            <span className="text-white/40 block text-[8px] uppercase font-bold mb-0.5">API ACTION RESPONSE TIME</span>
            <span className="block text-white/90 font-medium">
              {backendStatus.responseTimeMs ? `${backendStatus.responseTimeMs} ms` : 'N/A'}
            </span>
          </div>
        </div>

        {backendStatus.isWakingUp && (
          <div className="pt-1.5 border-t border-white/5 flex items-center gap-2 text-[#cbc3d7]/60 text-[9px]">
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Waking sleeping Render instance. Please stand by (up to 20s)...</span>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2 text-left">
        <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
        <div className="space-y-0.5">
          <h2 className="font-display font-extrabold text-base text-white uppercase tracking-wide leading-none">AI Structural Diagnostic Analysis</h2>
          <span className="font-mono text-[8px] uppercase tracking-wider text-[#cbc3d7]/40 block">[STAGE-2 RESOLVED DIRECTIVE]</span>
        </div>
      </div>

      {/* Interactive Photo Vector Crop View */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c12] relative overflow-hidden shadow-2xl">
        <div className="min-h-60 h-auto relative bg-[#06060a] flex flex-col justify-between">
          
          {/* Preset image loading */}
          {draft?.media?.url ? (
            <div className="h-60 relative w-full">
              <img 
                src={draft.media.url} 
                alt="Scan Target Specimen" 
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-transparent pointer-events-none" />
              
              {/* Symmetrical Tech Crosshair overlay matches actual AI scanners */}
              <div className="absolute inset-x-8 inset-y-10 border border-[#00F2FF]/35 rounded-xl pointer-events-none">
                <div className="absolute -top-1.5 -left-1.5 h-3.5 w-3.5 border-t-2 border-l-2 border-[#00F2FF] shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
                <div className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 border-t-2 border-r-2 border-[#00F2FF] shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
                <div className="absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 border-b-2 border-l-2 border-[#00F2FF] shadow-[0_0_10px_rgba(0,242,255,0.8)]" />
                <div className="absolute -bottom-1.5 -right-1.5 h-3.5 w-3.5 border-b-2 border-r-2 border-[#00F2FF] shadow-[0_0_10px_rgba(0,242,255,0.8)]" />

                <div className="absolute top-2 left-3 bg-black/60 border border-[#00F2FF]/20 px-2.5 py-1 rounded text-[8px] font-mono block tracking-wider shadow">
                  {resolvedPresetData.confidence < 65 ? (
                    <span className="text-amber-500">AI CONFIDENCE LIMITED</span>
                  ) : (
                    <span className="text-[#00F2FF]">SCAN CONFIDENCE {resolvedPresetData.confidence}%</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center p-6 md:p-8 text-center bg-[#08080C]">
              <AlertOctagon className="w-11 h-11 text-amber-500/80 mb-2 animate-pulse" />
              <p className="text-xs font-mono font-bold uppercase text-amber-500 tracking-wider">No image provided</p>
              <p className="text-[10px] text-[#cbc3d7]/60 max-w-sm mt-1 mb-5 leading-normal">
                AI visual analysis is deactivated. Please upload or capture an image of the injury to trigger the automatic scanning algorithm.
              </p>
              
              {/* CTA buttons: “Open Camera”, “Upload Photo”, “Use Voice Report Instead” */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-md pt-1">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('compawss_force_camera', 'true');
                    onNavigate(Screen.VoiceReporting);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-cyan-400 hover:bg-cyan-300 text-black font-mono font-bold text-[9px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all active:scale-95 cursor-pointer shadow"
                >
                  <Camera className="w-3 h-3" />
                  Open Camera
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('compawss_force_upload', 'true');
                    onNavigate(Screen.VoiceReporting);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/5 text-white font-mono font-bold text-[9px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  Upload Photo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('compawss_force_voice', 'true');
                    onNavigate(Screen.VoiceReporting);
                  }}
                  className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-[#cbc3d7] font-mono font-bold text-[9px] uppercase tracking-wider px-3 py-2 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  <Mic className="w-3 h-3 text-[#FF4E00]" />
                  Voice Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Diagnosis overview card info */}
        <div className="p-5 text-left space-y-4">
          <div className="flex justify-between items-start border-b border-white/5 pb-3">
            <div className="space-y-0.5">
              <span className="text-[8.5px] font-mono text-[#cbc3d7]/40 uppercase tracking-widest font-black block">ANALYTICAL INCIDENT BLOCK</span>
              <h3 className="font-display font-black text-xl text-white">{draft?.presetId === 'dog' ? 'Barnaby (Canis Case)' : draft?.presetId === 'kitten' ? 'Kitten (Feline Case)' : 'Draft Case Node'}</h3>
              <p className="text-[10px] text-[#cbc3d7]/65 font-mono">
                {resolvedPresetData.species} • Detected near {draft?.landmark || 'Ground Grid'}
              </p>
            </div>
            
            {/* Urgent badge */}
            <span className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold tracking-wider ${
              severity === 'Critical' 
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : severity === 'Urgent'
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
            }`}>
              {severity.toUpperCase()}
            </span>
          </div>

          {/* Condition tags badges */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#cbc3d7]/40">Condition tags classified</span>
            <div className="flex flex-wrap gap-1.5">
              {(draft?.tags || selectedTags).map((t: string) => (
                <span 
                  key={t}
                  className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[#FF4E00]"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Text transcription summary */}
          <div className="p-3.5 rounded-xl bg-[#111116] border border-white/5 space-y-1.5 text-xs text-[#cbc3d7]">
            <span className="font-mono text-[9px] text-[#00F2FF] font-black uppercase tracking-wider leading-none block">DICTATED INTEL TRANSCRIPTION</span>
            <p className="leading-relaxed select-text italic">
              "{draft?.transcription || 'No voice transcript logged.'}"
            </p>
          </div>
        </div>
      </div>

      {/* Tabs list selecting detail metrics */}
      <div className="grid grid-cols-2 gap-2 bg-[#0c0c12] border border-white/5 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('details')}
          className={`py-2 text-xs font-mono font-black rounded-lg transition-colors cursor-pointer ${
            activeTab === 'details' ? 'bg-[#FF4E00]/20 text-red-200' : 'text-[#cbc3d7]/40 hover:text-[#cbc3d7]/70'
          }`}
        >
          🔍 AI DETECTED METRICS
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`py-2 text-xs font-mono font-black rounded-lg transition-colors cursor-pointer ${
            activeTab === 'rules' ? 'bg-[#FF4E00]/20 text-red-200' : 'text-[#cbc3d7]/40 hover:text-[#cbc3d7]/70'
          }`}
        >
          📋 FIELD INTERVENTION DIRECTIVES
        </button>
      </div>

      {/* Dynamic Tabs Content panels */}
      <div className="rounded-2xl border border-white/10 bg-[#0c0c12] p-5 shadow-2xl text-left">
        {activeTab === 'details' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 text-cyan-400 font-bold text-xs">
              <Activity className="w-4 h-4" />
              <span className="font-mono text-[9px] tracking-widest uppercase font-black">AI LESION ANOMALIES DIAGNOSIS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1 bg-[#111116] border border-white/5 p-3 rounded-xl sm:col-span-2">
                <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase block font-bold tracking-wider">AI Grounded Observations</span>
                <span className="font-sans font-bold text-white block leading-relaxed">{resolvedPresetData.anomalies}</span>
              </div>

              <div className="space-y-1 bg-[#111116] border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase block font-bold tracking-wider">Triage Urgency Rating</span>
                <span className={`font-sans font-bold block tracking-tight leading-none text-sm uppercase ${
                  resolvedPresetData.severity === 'Critical' ? 'text-[#FF4E00]' :
                  resolvedPresetData.severity === 'Urgent' ? 'text-amber-400' : 'text-green-400'
                }`}>
                  {resolvedPresetData.severity || 'Moderate'}
                </span>
              </div>

              <div className="space-y-1 bg-[#111116] border border-white/5 p-3 rounded-xl">
                <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase block font-bold tracking-wider">Interpretation Veracity</span>
                <span className={`font-sans font-bold block tracking-tight leading-none text-sm ${
                  resolvedPresetData.confidence < 65 ? 'text-amber-500' : 'text-[#00F2FF]'
                }`}>
                  {resolvedPresetData.confidence < 65 ? 'AI CONFIDENCE LIMITED' : `SCAN VERIFIED // ${resolvedPresetData.confidence}%`}
                </span>
              </div>
            </div>

            {/* Geographical details */}
            <div className="p-3 bg-[#111116] border border-white/5 rounded-xl text-left space-y-1 text-xs">
              <span className="text-[9.5px] font-mono text-[#cbc3d7]/40 uppercase block font-bold">Ground Landmarks & Loc</span>
              <p className="text-white leading-relaxed">
                Landmark: <em className="text-cyan-400 not-italic font-semibold">{draft?.landmark || "Unnamed"}</em> • Location context: <em className="text-white font-serif">{draft?.notes || "No extra contextual notes"}</em>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-white/5 text-[#FF4E00] font-bold text-xs">
              <ShieldCheck className="w-4.5 h-4.5" />
              <span className="font-mono text-[9px] tracking-widest uppercase font-black">FIRST-AID FIELD INTERVENTIONS</span>
            </div>

            <ul className="space-y-3 font-sans text-xs text-[#cbc3d7] leading-relaxed">
              {resolvedPresetData.directives.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="h-4.5 w-4.5 bg-cyan-400/10 border border-cyan-400/35 text-cyan-400 font-mono text-[10px] rounded flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Deploy dispatch command block */}
      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
        <button
          onClick={() => onNavigate(Screen.VoiceReporting)}
          className="py-3.5 rounded-xl font-mono text-xs font-bold text-[#cbc3d7] bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          RE-DRAFT INTEL
        </button>

        <button
          onClick={() => {
            setIsDispatched(true);
            const rId = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
            const isDog = resolvedPresetData.id === 'dog';
            reportNewCase({
              id: rId,
              type: isDog ? 'Critical Trauma / Road Accident' : 'Severe Feline Sick Triage',
              location: draft?.landmark || userLocation.name || 'Sector Sighting Area',
              distance: '0.2 km',
              timeAgo: 'Just now',
              priority: draft?.severity || 'Critical',
              status: 'Dispatched',
              animalProfile: {
                species: isDog ? 'Dog' : 'Cat',
                name: isDog ? 'Unnamed Dog' : 'Unnamed Cat',
                age: isDog ? 'Adult' : 'Kitten',
                healthStatus: draft?.severity || 'Critical'
              },
              medicalRecords: [{
                condition: draft?.notes || resolvedPresetData.anomalies,
                diagnosis: 'AI Predicted Diagnostics',
                treatment: 'Dispatch Team Sent',
                vetId: 'Unassigned',
                cost: 0
              }],
              timeline: [{
                status: 'Sighting Reported',
                description: 'Citizen triggered smartphone AI ocular scan and voice dispatch.',
                timestamp: 'Just now'
              }]
            });
            addNotification(
              'Case Dispatch Processed',
              `Mobile field alert ${rId} successfully published to central NGO crisis response dispatchers.`,
              'Critical'
            );
          }}
          className="py-3.5 rounded-xl bg-[#FF4E00] text-white font-display font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-1.5 shadow-[0_4px_25px_rgba(255,78,0,0.35)] cursor-pointer"
        >
          <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
          ACTIVATE DISPATCH RED FLEET
        </button>
      </div>

    </div>
  );
};


/* ==========================================================================
   3. VET CLINICAL COORDINATION DASHBOARD
   ========================================================================== */
interface VetDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export const VetDashboardView: React.FC<VetDashboardProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="space-y-1 text-left">
        <h2 className="font-display font-extrabold text-[#e4e1e9] text-xl">
          Clinical Coordinator
        </h2>
        <p className="text-xs text-[#cbc3d7]/85 font-medium leading-relaxed">
          Veterinary queue & live telemetry dispatch board.
        </p>
      </div>

      {/* Clinical active stats widgets */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-[#1f1f25] border border-white/5 p-3 text-center">
          <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase tracking-wider block">IN PATIENT</span>
          <span className="font-display font-black text-xl text-white">{getDemoMode() ? "05" : "00"}</span>
        </div>

        <div className="rounded-xl bg-[#1f1f25] border border-white/5 p-3 text-center">
          <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider block">TRIAGE</span>
          <span className="font-display font-black text-xl text-red-400">{getDemoMode() ? "02" : "00"}</span>
        </div>

        <div className="rounded-xl bg-[#1f1f25] border border-white/5 p-3 text-center">
          <span className="text-[9px] font-mono text-[#4cd7f6] uppercase tracking-wider block">ON WAY</span>
          <span className="font-display font-black text-xl text-[#4cd7f6]">{getDemoMode() ? "01" : "00"}</span>
        </div>
      </div>

      {/* Clinical priority list section */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-bold tracking-wider text-[#cbc3d7]/40 uppercase block text-left">
          Clinical Priorities & Admissions
        </span>

        {getDemoMode() ? (
          <>
            {/* Barnaby List Row as requested */}
            <div 
              className="p-4 bg-gradient-to-r from-red-500/10 via-transparent to-transparent border border-red-500/20 rounded-2xl flex items-center justify-between transition-all group text-left relative"
            >
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=150" 
                    alt="Barnaby" 
                    className="w-11 h-11 object-cover rounded-xl border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-[#131318] animate-ping" />
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-display font-extrabold text-sm text-red-200 flex items-center gap-2">
                    Barnaby
                    <span className="inline-block text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">Demo Data</span>
                  </h4>
                  <p className="text-[10px] text-[#cbc3d7]/65">
                    Shih Tzu Mix • Trauma Triage Unit
                  </p>
                  <p className="text-[9px] font-mono text-red-400 uppercase font-semibold">
                    Priority 1 - Severe Limb Bleeding
                  </p>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-red-450/40" />
            </div>

            {/* Extra Vet Admissions */}
            <div className="space-y-2">
              {[
                { name: 'Maximus', breed: 'Husky Mix', desc: 'Moderate Dehydration recovery', badge: 'Stable', col: 'text-green-400 bg-green-500/5' },
                { name: 'Chloe', breed: 'Kitten stray', desc: 'Hypothermia monitoring', badge: 'Observation', col: 'text-[#4cd7f6] bg-[#4cd7f6]/5' }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-[#1b1b20] border border-white/5 rounded-2xl flex items-center justify-between text-left"
                >
                  <div className="space-y-0.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold inline-block mb-1 ${item.col}`}>
                      {item.badge}
                    </span>
                    <h4 className="font-display font-bold text-xs text-white flex items-center gap-2">
                      {item.name}
                      <span className="inline-block text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">Demo Data</span>
                    </h4>
                    <p className="text-[10px] text-[#cbc3d7]/65">{item.breed} • {item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#cbc3d7]/20" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
            <Clock className="w-10 h-10 text-white/20 mx-auto mb-2 animate-pulse" />
            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Queue status empty</h4>
            <p className="text-[10.5px] text-[#cbc3d7]/60 max-w-xs mx-auto mt-1 leading-normal">
              No active trauma admissions or triage patient files are currently pending in the clinical database queue.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

/* Mini helper mock component representing a truck */
const TruckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19 16c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zM7 16c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm17-3v4c0 .55-.45 1-1 1h-2.1c-.46-1.16-1.57-2-2.9-2s-2.44.84-2.9 2H10c-.46-1.16-1.57-2-2.9-2s-2.43.84-2.9 1.96H4c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h11c1.1 0 2 .9 2 2v5l5.25 3.51c.47.31.75.83.75 1.49zm-13-4V4H4v8h7l-.01-3.01z" />
  </svg>
);

export default VetDashboardView;
