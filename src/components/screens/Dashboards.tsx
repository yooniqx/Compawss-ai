import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Inbox, 
  Check, 
  Package, 
  Calendar, 
  Award, 
  Flame, 
  Plus, 
  Info, 
  User, 
  Sparkles, 
  Bell, 
  CheckSquare, 
  Square,
  Activity,
  ArrowRight,
  Search,
  GraduationCap,
  Mic
} from 'lucide-react';
import { Screen } from '../../types';
import { ACTIVE_FOSTER, VOLUNTEER_MISSIONS, VOLUNTEER_COMMUNITY_FEED, MY_PETS, getDemoMode } from '../../data';

/* ==========================================================================
   1. FOSTER DASHBOARD
   ========================================================================== */
interface FosterDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export const FosterDashboardView: React.FC<FosterDashboardProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState(ACTIVE_FOSTER.tasks);

  const toggleTask = (id: string) => {
    setTasks((prev) => 
      prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  };

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Active Foster Header Card */}
      <div className="rounded-2xl bg-[#1b1b20] border border-white/5 overflow-hidden shadow-2xl">
        <div className="h-64 relative">
          <img 
            src={ACTIVE_FOSTER.image} 
            alt={ACTIVE_FOSTER.name} 
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b20] via-transparent to-transparent" />
          <span className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-[#4cd7f6]/20 text-[#4cd7f6] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
            CURRENT FOSTER
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-display font-black text-2xl text-white">
              {ACTIVE_FOSTER.name}
            </h3>
            <p className="text-sm font-medium text-[#cbc3d7]/70">
              {ACTIVE_FOSTER.breed} • {ACTIVE_FOSTER.gender} • {ACTIVE_FOSTER.age}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#cbc3d7]/65">Status</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-[#cbc3d7]/50 font-mono">Ready for Adoption in</span>
              <span className="font-display font-black text-3xl text-[#4cd7f6] tracking-tight">
                0{ACTIVE_FOSTER.daysLeft}
              </span>
              <span className="text-xs text-[#cbc3d7]/85 font-semibold">Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Adopter Enquiries list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-md text-white flex items-center gap-2">
            Adopter Enquiries
            <MessageSquare className="w-4 h-4 text-[#4cd7f6]" />
          </h3>
          <span className="text-[10px] font-mono text-[#cbc3d7]/40">Active Chats</span>
        </div>

        <div className="space-y-2">
          {ACTIVE_FOSTER.inquiries.map((enq, idx) => (
            <div 
              key={idx}
              className="p-4 bg-[#1b1b20]/90 border border-white/5 rounded-xl hover:border-white/10 transition-all text-left"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-white">{enq.name}</span>
                <span className="text-[10px] text-[#cbc3d7]/40 font-mono">{enq.time}</span>
              </div>
              <p className="text-xs text-[#cbc3d7]/75 italic leading-relaxed">
                "{enq.message}"
              </p>
            </div>
          ))}

          <button 
            onClick={() => alert("Loading foster chat matrices...")}
            className="w-full py-2.5 rounded-lg text-xs font-bold text-[#cbc3d7]/80 bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
          >
            View All Messages
          </button>
        </div>
      </div>

      {/* Daily Care Tasks checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pl-1">
          <h3 className="font-display font-bold text-md text-white">Daily Care Tasks</h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#4078ff]/15 text-[#4cd7f6] border border-[#4078ff]/20">
            {completedCount}/{tasks.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-left transition-all cursor-pointer ${
                task.completed 
                  ? 'bg-green-500/5 border-green-500/20 text-[#cbc3d7]/50'
                  : 'bg-[#1b1b20] border-white/5 text-[#cbc3d7] hover:border-white/10'
              }`}
            >
              <button className="mt-0.5 shrink-0 text-[#d0bcff]">
                {task.completed ? (
                  <CheckSquare className="w-5 h-5 text-green-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <div className="space-y-0.5">
                <h4 className={`text-xs font-bold leading-tight ${task.completed ? 'line-through text-[#cbc3d7]/35' : 'text-white'}`}>
                  {task.text}
                </h4>
                <p className="text-[11px] text-[#cbc3d7]/60 leading-relaxed">
                  {task.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplies needed list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-md text-white flex items-center gap-2">
            Supplies Needed
            <Package className="w-4 h-4 text-amber-400" />
          </h3>
          <span className="text-[10px] font-mono text-[#cbc3d7]/40">Inventory Tracker</span>
        </div>

        <div className="space-y-2.5">
          {ACTIVE_FOSTER.supplies.map((sup, idx) => (
            <div 
              key={idx}
              className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-center justify-between text-left"
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">{sup.name}</h4>
                <p className="text-[10px] text-[#cbc3d7]/60">{sup.desc}</p>
              </div>
              <span className="text-xs font-semibold text-[#cbc3d7] pl-3">
                {sup.quantity}
              </span>
            </div>
          ))}

          {/* Submit supply button */}
          <button 
            onClick={() => alert("Supply request submitted to NGO supply hub!")}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            <span>Submit Supply Request</span>
          </button>
        </div>
      </div>

    </div>
  );
};

/* ==========================================================================
   2. VOLUNTEER DASHBOARD (READY FOR DEPLOYMENT)
   ========================================================================== */
interface VolunteerDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export const VolunteerDashboardView: React.FC<VolunteerDashboardProps> = ({ onNavigate }) => {
  const primaryMission = VOLUNTEER_MISSIONS[0];

  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Page header */}
      <div className="space-y-1 text-left">
        <h2 className="font-display font-extrabold text-[#e4e1e9] text-xl">
          Volunteer Dashboard
        </h2>
        <p className="text-xs text-[#cbc3d7]/85 font-medium leading-relaxed">
          Ready for deployment.
        </p>
      </div>

      {/* Button controls */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => alert("Searching local missions directory...")}
          className="py-2.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
        >
          <Search className="w-3.5 h-3.5 text-white" />
          Find Missions
        </button>
        
        <button 
          onClick={() => alert("Launching foster training center course module...")}
          className="py-2.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
        >
          <GraduationCap className="w-4 h-4 text-white" />
          Training
        </button>
      </div>

      {/* Active Mission card that triggers Rescue Command */}
      {/* Element (xpath: `//button[contains(., 'View Details')]`) -> Rescue Command */}
      <div className="rounded-2xl bg-[#1b1b20] border border-[#4cd7f6]/20 p-5 shadow-2xl relative overflow-hidden">
        <span className="absolute top-0 right-0 w-24 h-24 bg-[#4cd7f6]/5 rounded-full blur-xl pointer-events-none" />

        <div className="space-y-4 relative z-10">
          <div className="space-y-0.5 text-left">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#4cd7f6] font-bold">
              ACTIVE MISSION
            </span>
            <h3 className="font-display font-extrabold text-sm text-white">
              {primaryMission.title}
            </h3>
            <p className="text-[11px] text-[#cbc3d7]/60 leading-relaxed">
              {primaryMission.eta} • {primaryMission.route}
            </p>
          </div>

          <button 
            onClick={() => onNavigate(Screen.RescueCommand)}
            className="w-full py-3.5 rounded-xl text-xs font-bold text-[#131318] bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] hover:brightness-110 active:scale-95 flex items-center justify-center gap-1.5 shadow-lg transition cursor-pointer"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>

      {/* Stats container */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[#1f1f25]/80 border border-white/5 p-4 text-center">
          <span className="text-[10px] font-mono tracking-wider text-[#cbc3d7]/50 uppercase">Total Rescues</span>
          <span className="font-display font-black text-3xl text-white block mt-1">42</span>
        </div>

        <div className="rounded-2xl bg-[#1f1f25]/80 border border-white/5 p-4 text-center">
          <span className="text-[10px] font-mono tracking-wider text-[#cbc3d7]/50 uppercase">Hours Contributed</span>
          <span className="font-display font-black text-3xl text-[#4cd7f6] block mt-1">128</span>
        </div>
      </div>

      {/* Social Community Feed */}
      <div className="space-y-3.5">
        <h3 className="font-display font-bold text-md text-[#e4e1e9] flex items-center gap-2 text-left">
          Community Feed
          <MessageSquare className="w-4.5 h-4.5 text-[#d0bcff]" />
        </h3>

        <div className="space-y-4">
          {VOLUNTEER_COMMUNITY_FEED.map((feed) => (
            <div 
              key={feed.id}
              className="rounded-2xl bg-[#1b1b20] border border-white/5 overflow-hidden shadow-xl"
            >
              {/* Image with overlay badge */}
              <div className="h-44 relative">
                <img 
                  src={feed.image} 
                  alt="Feed animal photo" 
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <p className="absolute bottom-3 left-4 text-xs font-medium text-white leading-relaxed">
                  {feed.message}
                </p>
              </div>

              {/* Author footer */}
              <div className="p-3 px-4 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center font-bold text-[10px] text-white">
                    {feed.author.substring(0,2).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">{feed.author}</span>
                    <span className="text-[9px] text-[#cbc3d7]/40 block leading-none">{feed.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#cbc3d7]/50 font-mono">
                  <span className="hover:text-red-400 transition cursor-pointer flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-400" /> {feed.likes}
                  </span>
                  <span className="hover:text-[#4cd7f6] transition cursor-pointer flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-[#4cd7f6]" /> {feed.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

/* ==========================================================================
   3. OWNER DASHBOARD
   ========================================================================== */
interface OwnerDashboardProps {
  onNavigate: (screen: Screen) => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardProps> = ({ onNavigate }) => {
  const maxPet = MY_PETS[0];
  const lunaPet = MY_PETS[1];

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loggedStatus, setLoggedStatus] = useState<string | null>(null);
  const [speechTranscript, setSpeechTranscript] = useState<string | null>(null);
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);

  const triggerQuickLog = (incidentType: string) => {
    setLoggedStatus(`Initializing cellular broadcast slot... Saved draft: [${incidentType}]. Local queue sync OK. SMS payload generated.`);
    setTimeout(() => {
      setLoggedStatus(null);
    }, 5000);
  };

  const simulateSpeech = () => {
    setIsListeningSpeech(true);
    setSpeechTranscript("Listening and matching...");
    setTimeout(() => {
      setSpeechTranscript("Transcribed: 'Found stray dog bleeding from neck near Sector 5 market...'");
      setIsListeningSpeech(false);
    }, 2000);
  };

  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Greetings heading */}
      <div className="space-y-1 text-left">
        <h2 className="font-display font-black text-white text-xl">
          Citizen Rescue Center
        </h2>
        <p className="text-xs text-[#cbc3d7]/85 font-medium leading-relaxed">
          Log wildlife and stray animal emergencies instantly. Empower local medical NGO dispatch teams.
        </p>
      </div>

      {/* 1. ONE-TAP EMERGENCY LOGGER */}
      <div className="p-4 rounded-2xl bg-[#08080C] border border-white/10 text-left space-y-3 shadow-lg">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF4E00] block">
          One-Tap Emergency Logger
        </span>
        <p className="text-[11px] text-[#cbc3d7]/60 leading-relaxed">
          Witness an incident? Click any category below to immediately save a local survival draft and queue for responder dispatch.
        </p>
        
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Critical Trauma / Bleeding", code: "TRAUMA_BLEED" },
            { label: "Trapped / Stranded Species", code: "TRAPPED_SPECIES" },
            { label: "Poison / Severe Abuse", code: "ABUSE_POISON" },
            { label: "Endangered Orphaned Stray", code: "ABANDONED_STRAY" }
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => triggerQuickLog(item.label)}
              className="py-2.5 px-3 bg-white/5 border border-white/5 hover:border-[#FF4E00]/30 hover:bg-[#FF4E00]/5 rounded-xl text-[10.5px] font-bold text-white transition text-left leading-snug cursor-pointer"
            >
              🚀 {item.label}
            </button>
          ))}
        </div>

        {loggedStatus && (
          <div className="p-2.5 rounded-lg bg-[#FF4E00]/10 border border-[#FF4E00]/30 text-[10px] text-white font-mono animate-pulse mt-2">
            {loggedStatus}
          </div>
        )}
      </div>

      {/* 2. ANONYMOUS REPORTING & SPEECH TRANSCRIPT BLOCK */}
      <div className="p-4 rounded-2xl bg-[#08080C] border border-white/10 text-left space-y-3 shadow-lg">
        {/* Toggle option */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#00F2FF] tracking-wider block">ANONYMOUS WITNESS INTAKE</span>
            <p className="text-[10px] text-[#cbc3d7]/65">Encrypts and strips GPS and IP identification data.</p>
          </div>
          
          <button 
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`h-5 w-10 rounded-full p-0.5 transition-colors cursor-pointer ${
              isAnonymous ? 'bg-[#FF4E00]' : 'bg-white/15'
            }`}
          >
            <div className={`h-4 w-4 rounded-full bg-white transition-transform ${
              isAnonymous ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Voice navigation shortcut */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] font-mono text-white/50 block">MULTILINGUAL VOICE PORTAL</span>
            <span className="text-xs font-bold text-white">Tap to speak report info</span>
          </div>
          <button
            onClick={simulateSpeech}
            className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-all ${
              isListeningSpeech 
                ? 'bg-[#FF4E00]/20 border-[#FF4E00] text-[#FF4E00]' 
                : 'bg-white/5 border-white/10 text-[#00F2FF] hover:border-[#00F2FF]/50'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>

        {speechTranscript && (
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-[11px] text-[#cbc3d7] italic font-mono">
            {speechTranscript}
          </div>
        )}
      </div>

      {getDemoMode() && maxPet && lunaPet ? (
        <>
          <div className="space-y-3 pl-1">
            <span className="text-xs font-mono font-bold tracking-wider text-[#cbc3d7]/40 uppercase block text-left flex items-center gap-2">
              Your Reported Stray Incidents
              <span className="inline-block text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">Demo Data</span>
            </span>

            {/* 1. Max Pet Detail wrapper repurposed as Stray Incident Case */}
            <div className="rounded-2xl bg-[#1b1b20] border border-white/5 overflow-hidden shadow-2xl space-y-4">
              <div className="h-52 relative">
                <img 
                  src={maxPet.image} 
                  alt="Barnaby Stray Shih Tzu" 
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1b20] via-transparent to-transparent" />
                
                {/* Stable notification dot badge */}
                <span className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide bg-red-500/10 border border-red-500/20 text-red-400 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  PRIORITY TRIAGE
                </span>
              </div>

              <div className="p-4 pt-0 space-y-4">
                <div className="text-left space-y-0.5">
                  <h3 className="font-display font-black text-xl text-white">
                    Barnaby
                  </h3>
                  <p className="text-xs text-[#cbc3d7]/65 font-medium">
                    Male Shih Tzu stray • Found bleeding near Sector 4 Alleyway
                  </p>
                </div>

                {/* Vitals insight card */}
                <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2 relative">
                  <span className="text-[10px] font-mono uppercase text-[#4cd7f6] font-bold tracking-widest block text-left">
                    EMERGENCY TELEMETRY PROFILE
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-left text-xs text-[#cbc3d7]/80">
                    <div>
                      <span className="text-[10px] text-[#cbc3d7]/40 block font-mono">Heart Rate</span>
                      <span className="font-bold text-white text-sm">145 bpm (Shock)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#cbc3d7]/40 block font-mono">Mobility Risk</span>
                      <span className="font-bold text-white text-sm">Severe Limping</span>
                    </div>
                  </div>
                </div>

                {/* Button 1: View Full Report -> Injury Analysis (Disable for demo data) */}
                <button
                  disabled={true}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-[#cbc3d7]/30 bg-white/5 border border-white/5 cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span>View Full Report (Disabled - Demo Data)</span>
                </button>
              </div>
            </div>

            {/* 2. Luna Pet summary card repurposed as Calico stray progress */}
            <div className="rounded-2xl bg-[#1b1b20] border border-white/5 p-5 shadow-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <img 
                    src={lunaPet.image} 
                    alt="Luna stray Calico" 
                    className="w-12 h-12 object-cover rounded-xl border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <h4 className="font-display font-bold text-sm text-white">Calico Kitten</h4>
                    <p className="text-[10px] text-[#cbc3d7]/65">Kitten Stray • Found shivering in rain</p>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#4cd7f6]/10 text-[#4cd7f6]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                  RECOVERY OBSERVATION
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/5 space-y-1.5 text-left text-xs text-[#cbc3d7]">
                <span className="text-[10px] font-mono uppercase font-bold text-[#cbc3d7]/45 tracking-widest">
                  Rehabilitation Routine
                </span>
                <div>
                  <span className="text-[10px] text-[#cbc3d7]/40 block leading-none">Vitals Observation</span>
                  <span className="font-bold text-white">Daily Temperature Control Logs</span>
                </div>
              </div>

              <button 
                disabled={true}
                className="w-full py-2.5 rounded-lg text-xs font-bold text-[#cbc3d7]/30 bg-white/5 border border-white/5 cursor-not-allowed"
              >
                Log Treatment Progress Update (Disabled - Demo Data)
              </button>
            </div>
          </div>

          {/* Upcoming Visits schedule timeline */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#cbc3d7]/40 uppercase tracking-widest pl-1 font-bold flex items-center gap-2">
                Dispatched Admissions Milestones
                <span className="inline-block text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">Demo Data</span>
              </span>
              <Calendar className="w-4.5 h-4.5 text-[#cbc3d7]/30" />
            </div>

            <div className="p-4 bg-[#1b1b20] border border-white/5 rounded-2xl relative space-y-4 text-xs">
              <div className="absolute left-6 top-8 bottom-8 w-[1.5px] bg-[#d0bcff]/20" />

              {/* Visit Item 1 */}
              <div className="flex gap-4 relative">
                <div className="h-4.5 w-4.5 shrink-0 rounded-full bg-[#d0bcff] flex items-center justify-center border-4 border-[#1b1b20] shadow-[0_0_8px_rgba(208,188,255,0.6)] z-10" />
                <div className="space-y-1 text-left">
                  <h4 className="font-bold text-white">Trauma Unit Specialist Admission</h4>
                  <p className="text-[10px] text-[#d0bcff] font-semibold">Tomorrow, 10:00 AM</p>
                  <p className="text-xs text-[#cbc3d7]/70">Barnaby follow-up limb assessment checkup.</p>
                </div>
              </div>

              {/* Visit Item 2 */}
              <div className="flex gap-4 relative">
                <div className="h-4.5 w-4.5 shrink-0 rounded-full bg-[#cbc3d7]/30 flex items-center justify-center border-4 border-[#1b1b20] z-10" />
                <div className="space-y-1 text-left">
                  <h4 className="font-bold text-[#cbc3d7]">Foster Placement Review</h4>
                  <p className="text-[10px] text-[#cbc3d7]/50 font-semibold">Oct 24, 2:30 PM</p>
                  <p className="text-xs text-[#cbc3d7]/60">Calico Stray placement clearance with authorized foster.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Alerts widget */}
          <div className="rounded-2xl bg-gradient-to-r from-red-500/10 via-transparent to-transparent border border-white/5 p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-red-400 animate-pulse" />
              <div className="text-left space-y-0.5">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  Lost Beagle: "Charlie" Alert
                  <span className="inline-block text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">Demo Data</span>
                </h4>
                <p className="text-[10px] text-[#cbc3d7]/60 font-medium">Near Sector 5 • Active Search Squad</p>
              </div>
            </div>
            <span className="text-[9px] bg-red-400/20 text-red-400 font-mono font-bold px-2 py-0.5 rounded uppercase">
              SOS ACTIVE
            </span>
          </div>
        </>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
          <Inbox className="w-10 h-10 text-white/20 mx-auto mb-2 animate-bounce" />
          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">No active rescue incidents</h4>
          <p className="text-[10.5px] text-[#cbc3d7]/60 max-w-xs mx-auto mt-1 leading-normal">
            Your live reported incidents list is empty. Witness an emergency? Submit a localized rescue event to alert our coordinator grids.
          </p>
        </div>
      )}

    </div>
  );
};
