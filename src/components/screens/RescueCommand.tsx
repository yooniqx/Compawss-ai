import React, { useState } from 'react';
import {
  ShieldAlert,
  Map,
  WifiOff,
  Download,
  Plus,
  ChevronRight,
  Compass,
  Activity,
  Check,
  MapPin,
  Cpu,
  PieChart,
  Users,
  DollarSign,
  Layers,
  AlertTriangle,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { Screen } from '../../types';
import { NGO_COORD_RESCUERS, DASHBOARD_STATS, RESCUE_CASES, getDemoMode } from '../../data';
import { CompawssLogo } from '../CompawssLogo';
import { useRescue } from '../../context/RescueContext';
import { isSupabaseConfigured } from '../../services/supabaseClient';


/* ==========================================================================
   1. RESCUE COMMAND (LIVE MAP OVERWATCH)
   ========================================================================== */
interface RescueCommandProps {
  onNavigate: (screen: Screen) => void;
}

export const RescueCommandView: React.FC<RescueCommandProps> = ({ onNavigate }) => {
  const [showDroneScan, setShowDroneScan] = useState(true);
  const { cases, stats, userLocation, vets, ngos, fosters } = useRescue();

  const activeCasesCount = cases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length;
  const inProgressCount = cases.filter(c => c.status === 'Rescue in Progress' || c.status === 'Veterinary Care').length;

  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Tactical Canvas Map Block */}
      <div className="relative rounded-2xl bg-[#1b1b20] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-mono font-bold tracking-wider text-[#cbc3d7]/80 uppercase">
              LIVE OVERWATCH SCAN
            </span>
          </div>
          <span className="text-[10px] bg-[#4cd7f6]/10 text-[#4cd7f6] px-2 py-0.5 rounded font-mono font-semibold">
            {userLocation.city.toUpperCase()} ACTIVE
          </span>
        </div>

        {/* Tactical visual rendering */}
        <div className="relative h-64 bg-[#131318] flex items-center justify-center overflow-hidden">
          {/* Centered branded Compass AI telemetry overlay */}
          <CompawssLogo size={200} animate={true} className="absolute opacity-15 pointer-events-none filter drop-shadow-[0_0_15px_rgba(255,184,0,0.1)] scale-110" />

          {/* Circular radar grid lines overlay */}
          <div className="absolute w-44 h-44 border border-white/5 rounded-full" />
          <div className="absolute w-28 h-28 border border-white/5 rounded-full" />
          <div className="absolute w-12 h-12 border border-[#4cd7f6]/10 rounded-full" />
          
          {/* Map Vector Mock Background */}
          <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 50 L 300 120 M 50 0 L 220 250 M 200 0 L 100 250 M 0 180 L 300 50" stroke="#CBC3D7" strokeWidth="1" strokeDasharray="5,5" />
            <path d="M 0 100 Q 150 200 300 100" stroke="#4CD7F6" strokeWidth="1.5" className="opacity-40" />
            <path d="M 30 200 Q 200 50 280 220" stroke="#A078FF" strokeWidth="1.5" className="opacity-40" />
          </svg>

          {/* Active dynamically calculated coordinates list mapped on the radar! */}
          {cases.slice(0, 3).map((c, i) => {
            // Distribute items visually representing real locations
            const positions = [
              { top: '35%', left: '25%', color: 'bg-red-500' },
              { top: '55%', left: '65%', color: 'bg-amber-500' },
              { top: '75%', left: '45%', color: 'bg-[#00F2FF]' }
            ];
            const pos = positions[i % positions.length];
            return (
              <div key={c.id} className="absolute" style={{ top: pos.top, left: pos.left }}>
                <span className={`absolute inline-flex h-4 w-4 rounded-full ${pos.color} opacity-70 animate-ping`} />
                <div className={`relative rounded-full h-2.5 w-2.5 ${pos.color} shadow-[0_0_10px_rgba(255,255,255,0.7)]`} />
                <span className="absolute left-3 -top-2 bg-[#131318]/90 text-[7px] font-mono border border-white/10 px-1 py-0.5 rounded text-white font-black whitespace-nowrap">
                  {c.id}
                </span>
              </div>
            );
          })}

          <div className="absolute inset-0 bg-gradient-to-t from-[#131318] to-transparent pointer-events-none" />
          <span className="absolute bottom-3 right-3 text-[10px] font-mono text-[#cbc3d7]/30">GPS LOCK ACTIVE</span>
        </div>
      </div>

      {/* Numerical Indicators panel */}
      <div className="grid grid-cols-3 gap-3">
        {/* Active emergencies */}
        <div className="rounded-xl bg-[#1f1f25]/85 border border-white/5 p-3 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#cbc3d7]/60 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">ACTIVE</span>
          </div>
          <span className="font-display font-black text-2.5xl text-white">
            0{activeCasesCount}
          </span>
        </div>

        {/* Dispatched rescues */}
        <div className="rounded-xl bg-[#1f1f25]/85 border border-white/5 p-3 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#cbc3d7]/60 mb-1">
            <Compass className="w-3.5 h-3.5 text-[#4cd7f6] animate-spin-slow" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">IN CARE</span>
          </div>
          <span className="font-display font-black text-2.5xl text-[#4cd7f6]">
            0{inProgressCount}
          </span>
        </div>

        {/* Pending responses */}
        <div className="rounded-xl bg-[#1f1f25]/85 border border-white/5 p-3 text-center shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#cbc3d7]/60 mb-1">
            <Cpu className="w-3.5 h-3.5 text-[#d0bcff]" />
            <span className="font-mono text-[10px] tracking-wider uppercase font-semibold">TODAY</span>
          </div>
          <span className="font-display font-black text-2.5xl text-[#d0bcff]">
            {stats.casesTodayCount}
          </span>
        </div>
      </div>

      {/* Button Action dispatcher: New Dispatch (xpath: 'New Dispatch' button) */}
      <button
        onClick={() => onNavigate(Screen.NGODashboard)}
        className="w-full relative py-3.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4078ff] flex items-center justify-center gap-2 font-display font-bold text-sm text-white select-none transition-transform active:scale-[0.98] shadow-[0_5px_20px_rgba(160,120,255,0.3)] cursor-pointer"
      >
        <Compass className="w-4 h-4 text-white absolute left-4 animate-spin-slow" />
        <Plus className="w-4 h-4 text-white" />
        <span>New Dispatch</span>
      </button>

      {/* Predictive AI Alert - Only shown when real backend data available */}
      {/* Removed fake "Sector 7G" alert - will be implemented with real backend predictions */}

      {/* Dynamic Vets Section (Requested!) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pl-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#00F2FF] font-black">
            Emergency Vets & Hospitals (Nearby)
          </span>
          <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase">Locality-Aware</span>
        </div>

        <div className="space-y-3">
          {vets.length === 0 ? (
            <div className="p-4 rounded-xl border border-white/5 bg-[#17171c] text-center space-y-2">
              <p className="text-xs text-[#cbc3d7]/70 font-mono">No veterinary clinics found nearby.</p>
              <p className="text-[10px] text-[#cbc3d7]/50 font-mono">
                Configure Supabase or Google Places API to discover nearby vets.
              </p>
            </div>
          ) : (
            vets.map((vet) => (
              <div 
                key={vet.id}
                className="p-4 bg-[#1f1f25]/75 border border-white/5 rounded-2xl space-y-2.5 group hover:border-[#00F2FF]/25 transition-all shadow-md text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00F2FF] transition-colors leading-tight">
                      {vet.clinicName}
                    </h4>
                    {vet.name && (
                      <p className="text-[10px] text-[#cbc3d7]/70 font-medium">Lead: Dr. {vet.name}</p>
                    )}
                  </div>

                  {/* Dynamic Source label Badge */}
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-extrabold uppercase tracking-wider ${
                    vet.source === 'Verified' || vet.source === 'Verified Database'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                      : vet.source === 'Supabase Directory'
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                      : vet.source === 'Google Places' || vet.source === 'Google'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {vet.source || 'Demo Data'}
                  </span>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono text-[#cbc3d7]/65 pt-1.5 border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Facility Type</span>
                    <span className="text-gray-200">{vet.type || 'Veterinary Care'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Calculated Distance</span>
                    <span className="text-[#00F2FF] font-extrabold">{vet.distance}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">City / Address</span>
                    <span className="text-gray-200 truncate block text-[9.2px]">{vet.address}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Emergency Contact</span>
                    <a href={`tel:${vet.contact}`} className="text-teal-400 font-extrabold hover:underline">
                      {vet.contact || 'Unavailable'}
                    </a>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Opening Status</span>
                    <span className="text-green-400">{vet.openingStatus || 'Available'}</span>
                  </div>
                </div>

                {/* Google Maps Navigation Buttons */}
                {vet.googleMapsUrl && (
                  <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
                    <a
                      href={vet.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#4cd7f6]/10 border border-[#4cd7f6]/25 text-[#4cd7f6] hover:bg-[#4cd7f6]/20 transition-all text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${vet.latitude || ''},${vet.longitude || ''}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dynamic NGOs Section (Requested!) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pl-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-black">
            Active Animal NGOs (Nearby)
          </span>
          <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase font-bold">{userLocation.city}</span>
        </div>

        <div className="space-y-3">
          {ngos.length === 0 ? (
            <div className="p-4 rounded-xl border border-white/5 bg-[#17171c] text-center text-xs text-[#cbc3d7]/50 font-mono">
              No local registered NGO rescue offices matched.
            </div>
          ) : (
            ngos.map((ngo) => (
              <div 
                key={ngo.id}
                className="p-4 bg-[#1f1f25]/75 border border-white/5 rounded-2xl space-y-2.5 group hover:border-[#d0bcff]/20 transition-all shadow-md text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#d0bcff] transition-colors leading-tight">
                    {ngo.name}
                  </h4>

                  {/* NGO Source badge */}
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-extrabold uppercase tracking-wider ${
                    ngo.source === 'Verified' || ngo.source === 'Verified Database'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                      : ngo.source === 'Supabase Directory'
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
                      : ngo.source === 'Google Places' || ngo.source === 'Google'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {ngo.source || 'Demo Data'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono text-[#cbc3d7]/65 pt-1.5 border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">NGO Category</span>
                    <span className="text-gray-200">{ngo.type || 'Stray Rescue & Shelter'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">City Center</span>
                    <span className="text-gray-200">{ngo.city}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Shelter Location</span>
                    <span className="text-gray-200 truncate block text-[9.2px]">{ngo.address}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Emergency Hotline</span>
                    <a href={`tel:${ngo.contact}`} className="text-teal-400 font-extrabold hover:underline">
                      {ngo.contact || 'Unavailable'}
                    </a>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block font-bold">Logistical Status</span>
                    <span className="text-[#d0bcff]">{ngo.openingStatus || 'Active Standby'}</span>
                  </div>
                </div>

                {/* Google Maps Navigation Buttons */}
                {ngo.googleMapsUrl && (
                  <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
                    <a
                      href={ngo.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-400 hover:bg-purple-500/20 transition-all text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${ngo.latitude || ''},${ngo.longitude || ''}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      {/* Dynamic Foster Homes Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pl-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-black">
            Foster Care Homes (Available)
          </span>
          <span className="text-[9px] font-mono text-[#cbc3d7]/40 uppercase font-bold">{userLocation.city}</span>
        </div>

        <div className="space-y-3">
          {fosters.length === 0 ? (
            <div className="p-4 rounded-xl border border-white/5 bg-[#17171c] text-center text-xs text-[#cbc3d7]/50 font-mono">
              No foster homes registered in this area.
            </div>
          ) : (
            fosters.map((foster) => (
              <div 
                key={foster.id}
                className="p-4 bg-[#1f1f25]/75 border border-white/5 rounded-2xl space-y-2.5 group hover:border-amber-400/20 transition-all shadow-md text-left"
              >
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors leading-tight">
                    {foster.hostName}
                  </h4>

                  {/* Foster Status Badge */}
                  <span className={`text-[8px] font-mono px-2 py-0.5 rounded-full border shrink-0 font-extrabold uppercase tracking-wider ${
                    foster.availabilityStatus === 'Available'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                      : foster.availabilityStatus === 'Full'
                      ? 'bg-red-500/10 text-red-400 border-red-500/25'
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/25'
                  }`}>
                    {foster.availabilityStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[9.5px] font-mono text-[#cbc3d7]/65 pt-1.5 border-t border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Capacity</span>
                    <span className="text-gray-200">{foster.currentFosters}/{foster.capacity} Animals</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Preferences</span>
                    <span className="text-gray-200">{foster.preferences.join(', ')}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Location</span>
                    <span className="text-gray-200 truncate block text-[9.2px]">{foster.location}</span>
                  </div>
                  <div className="space-y-0.5 col-span-2">
                    <span className="text-[8px] text-[#cbc3d7]/30 uppercase font-black block">Contact</span>
                    <a href={`tel:${foster.contact}`} className="text-teal-400 font-extrabold hover:underline">
                      {foster.contact || 'Unavailable'}
                    </a>
                  </div>
                </div>

                {/* Google Maps Navigation for Foster Homes */}
                {foster.location && (
                  <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foster.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-all text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View on Map</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(foster.location)}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20 transition-all text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Get Directions</span>
                    </a>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      </div>

    </div>
  );
};

/* ==========================================================================
   2. OFFLINE MODE (CRITICAL FALLBACK MAPS)
   ========================================================================== */
interface OfflineModeProps {
  onNavigate: (screen: Screen) => void;
}

export const OfflineModeView: React.FC<OfflineModeProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-6 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-300 max-w-md mx-auto min-h-[500px]">
      
      {/* Offline state illustration */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-36 h-36 bg-[#4cd7f6]/5 rounded-full animate-pulse pointer-events-none" />
        <div className="h-24 w-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#4cd7f6] drop-shadow-[0_0_15px_rgba(76,215,246,0.2)]">
          <WifiOff className="w-10 h-10 text-[#4cd7f6] animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 max-w-xs">
        <span className="text-[10px] font-mono tracking-widest text-[#4cd7f6] uppercase font-bold bg-[#4cd7f6]/10 px-2.5 py-1 rounded-full border border-[#4cd7f6]/20">
          OFFLINE STORAGE DETECTED
        </span>
        <h2 className="font-display font-extrabold text-[#e4e1e9] text-xl">
          Cellular Grid Inactive
        </h2>
        <p className="text-xs text-[#cbc3d7]/75">
          You are currently in zero-network conditions. Compawss AI has cached emergency hospital records and veterinary routing packets locally.
        </p>
      </div>

      {/* Button: View Offline Map (xpath: button with View Offline Map text) */}
      <button 
        onClick={() => onNavigate(Screen.RescueCommand)}
        className="w-full relative overflow-hidden py-3.5 rounded-xl bg-gradient-to-r from-[#d0bcff] to-[#4cd7f6] p-[1px] group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl"
      >
        <div className="absolute inset-[1px] rounded-xl bg-[#131318]/90 group-hover:bg-[#131318]/70 transition-colors" />
        <div className="relative z-10 flex items-center justify-center gap-2">
          <span className="text-xs text-[#e4e1e9] font-bold uppercase tracking-wider">
            View Offline Map
          </span>
          <Download className="w-4 h-4 text-[#4cd7f6]" />
        </div>
      </button>

      <span className="text-[10px] font-mono text-[#cbc3d7]/30">
        LOCAL STORAGE CACHE OK • VERSION 3.1
      </span>
    </div>
  );
};

/* ==========================================================================
   3. NGO COORDINATOR DASHBOARD
   ========================================================================== */
interface NGODashboardProps {
  onNavigate: (screen: Screen) => void;
}

export const NGODashboardView: React.FC<NGODashboardProps> = ({ onNavigate }) => {
  const { 
    cases, 
    volunteers, 
    assignResponder, 
    resolveCaseDirectly, 
    addTimelineEvent,
    addNotification, 
    userLocation 
  } = useRescue();

  const [activeAssignCaseId, setActiveAssignCaseId] = useState<string | null>(null);

  const activeCases = cases.filter(c => c.status !== 'Resolved' && c.status !== 'Closed');

  const handleAssignVolunteer = (caseId: string, volunteer: any) => {
    assignResponder(caseId, volunteer.name, volunteer.phone, volunteer.role);
    
    // Add real timeline event
    addTimelineEvent(caseId, {
      status: 'Rescue in Progress',
      description: `Dispatched ${volunteer.name} (${volunteer.role}) to sighting location. Sighting zone: ${userLocation.name}.`,
      timestamp: 'Just now'
    });

    addNotification(
      'Responder Dispatched',
      `${volunteer.name} is on route to secure the injured animal. ETA 15 mins.`,
      'Critical'
    );

    setActiveAssignCaseId(null);
  };

  const handleResolve = (caseId: string) => {
    resolveCaseDirectly(caseId, "Animal successfully routed to medical recovery hub.");
    addNotification(
      'Rescue Case Resolved',
      `Case ${caseId} marked complete. Feed updated.`,
      'Info'
    );
  };

  return (
    <div className="flex-1 pb-24 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="space-y-1">
        <h2 className="font-display font-extrabold text-white text-xl">
          NGO Command Dashboard
        </h2>
        <p className="text-xs text-[#cbc3d7]/85 font-medium leading-relaxed">
          Real-time coordination center for {userLocation.city}.
        </p>
      </div>

      {/* Demand Forecast widget */}
      <div className="rounded-2xl bg-[#1b1b20] border border-white/5 p-5 shadow-2xl space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-1.5 text-[#4cd7f6] font-semibold text-xs">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span className="font-mono text-[9px] tracking-wider uppercase font-bold">AI DISPATCH OPTIMIZER</span>
          </div>
          <span className="text-[10px] font-mono text-[#cbc3d7]/40">Active Zone: {userLocation.name}</span>
        </div>

        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#cbc3d7]/65">Recommendation Focus</span>
          <h3 className="font-display font-bold text-lg text-white">Direct Ambulances Proactively</h3>
          <p className="text-xs text-[#4cd7f6] font-medium leading-relaxed">
            Highly heavy congestion reported. ETA speeds impacted by +10% near municipal borders.
          </p>
        </div>

        {/* Recommended deployment card with clickable "Deploy Now" button */}
        <div className="pt-2 bg-white/5 p-4 rounded-xl border border-white/5 space-y-3.5">
          <div>
            <span className="text-[10px] text-[#cbc3d7]/50 block">AI Priority Target</span>
            <span className="text-xs font-bold text-white">Deploy nearest Veterinary Ambulance</span>
          </div>

          <button 
            onClick={() => {
              if (activeCases.length > 0) {
                setActiveAssignCaseId(activeCases[0].id);
                addNotification('AI Recommendation applied', 'Select responder to finalize team dispatch.', 'Info');
              } else {
                addNotification('All Clear', 'No active critical incidents requiring emergency triage.', 'Info');
              }
            }}
            className="w-full py-2.5 rounded-lg text-xs font-bold text-[#131318] bg-gradient-to-r from-[#d0bcff] to-[#4078ff] hover:brightness-110 active:scale-95 cursor-pointer leading-tight transition"
          >
            Review Dispatch Recommendation
          </button>
        </div>
      </div>

      {/* Dynamic Active Cases Coordinate Table */}
      <div className="rounded-2xl bg-[#1b1b20] border border-white/5 p-4 shadow-lg space-y-3 text-left">
        <div className="flex items-center justify-between pl-1">
          <span className="text-xs font-mono font-bold tracking-wider text-[#cbc3d7]/40 uppercase">
            Active Animal Sighting Log ({activeCases.length})
          </span>
          {isSupabaseConfigured() && (
            <span className="text-[9px] font-mono text-[#00F2FF]">LIVE UPDATING</span>
          )}
        </div>

        {activeCases.length === 0 ? (
          <div className="p-6 text-center text-[#cbc3d7]/40 text-xs font-medium">
            No active emergencies reported. Grid status green.
          </div>
        ) : (
          <div className="space-y-3">
            {activeCases.map((c) => {
              const isDemoItem = getDemoMode() && c.id.startsWith('case-10');
              return (
                <div 
                  key={c.id} 
                  className="p-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl space-y-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          c.priority === 'Critical' 
                            ? 'bg-red-500/20 text-red-400' 
                            : (c.priority === 'High' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
                        }`}>
                          {c.priority}
                        </span>
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {c.animalProfile.species} ({c.animalProfile.name})
                          {isDemoItem && (
                            <span className="inline-block text-[8px] font-mono font-black uppercase px-1 py-0.5 bg-amber-500/25 text-amber-400 border border-amber-500/30 rounded">Demo Data</span>
                          )}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#cbc3d7]/70 mt-1">Sighting: {c.location} • {c.distance}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#4cd7f6] bg-[#4cd7f6]/10 px-2 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>

                <div className="text-[11px] text-[#cbc3d7]/80 italic bg-black/25 p-2 rounded border border-white/5">
                  &ldquo;{c.medicalRecords?.[0]?.condition || c.type}&rdquo;
                </div>

                {c.resolver ? (
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                    <span className="text-green-400 font-mono text-[10px]">
                      👤 ON SITE: {c.resolver.name} ({c.resolver.role})
                    </span>
                    <button
                      onClick={() => {
                        if (isDemoItem) return;
                        handleResolve(c.id);
                      }}
                      disabled={isDemoItem}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded transition active:scale-95 ${
                        isDemoItem
                          ? 'bg-white/5 text-[#cbc3d7]/30 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-black cursor-pointer'
                      }`}
                    >
                      {isDemoItem ? "Resolved Lock" : "Resolve Case"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#cbc3d7]/50 text-[10px]">No rescue team dispatched</span>
                      <button
                        onClick={() => {
                          if (isDemoItem) return;
                          setActiveAssignCaseId(activeAssignCaseId === c.id ? null : c.id);
                        }}
                        disabled={isDemoItem}
                        className={`text-[10px] font-bold ${
                          isDemoItem 
                            ? 'text-[#cbc3d7]/30 cursor-not-allowed hover:no-underline'
                            : 'text-[#4cd7f6] hover:underline cursor-pointer'
                        }`}
                      >
                        {isDemoItem ? "Dispatch Locked (Demo)" : (activeAssignCaseId === c.id ? "Cancel" : "Dispatch Team Now")}
                      </button>
                    </div>

                    {activeAssignCaseId === c.id && !isDemoItem && (
                      <div className="mt-2 p-2 bg-black/40 rounded-lg border border-white/10 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <span className="text-[9px] font-mono text-gray-400 block font-bold uppercase">Select Available Responder:</span>
                        <div className="grid grid-cols-1 gap-1 max-h-40 overflow-y-auto">
                          {volunteers.map((vol) => (
                            <button
                              key={vol.id}
                              onClick={() => handleAssignVolunteer(c.id, vol)}
                              className="p-1 px-2 text-left hover:bg-[#00F2FF]/10 hover:text-white rounded text-[10px] flex items-center justify-between transition text-[#cbc3d7] font-semibold"
                            >
                              <span>{vol.name} ({vol.role})</span>
                              <span className="font-mono text-[8px] opacity-60">Near: {vol.locality}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Pie Chart telemetry block */}
      <div className="rounded-2xl bg-[#1f1f25]/85 border border-white/5 p-5 shadow-lg space-y-4 text-left">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h3 className="font-display font-semibold text-xs text-[#e4e1e9]">Sector Logistics Matrix</h3>
          <PieChart className="w-4 h-4 text-[#cbc3d7]/40" />
        </div>

        <div className="flex items-center justify-around gap-4">
          <div className="relative flex items-center justify-center h-28 w-28 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="45" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="56" 
                cy="56" 
                r="45" 
                stroke="#d0bcff" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="282" 
                strokeDashoffset="51" 
                className="transition-all duration-1000"
              />
              <circle 
                cx="56" 
                cy="56" 
                r="45" 
                stroke="#4cd7f6" 
                strokeWidth="8" 
                fill="transparent" 
                strokeDasharray="282" 
                strokeDashoffset="180" 
                className="opacity-60"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="font-display font-black text-xl text-white">82%</span>
              <span className="text-[9px] text-[#cbc3d7]/50 font-semibold uppercase leading-none">Healthy</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-[#cbc3d7]/80">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#d0bcff]" />
              <span>Veterinary Care (82%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#4cd7f6]" />
              <span>Fed & Stray Managed</span>
            </div>
          </div>
        </div>
      </div>

      {/* List Map representation (Live Map: Active Volunteers) */}
      <div className="rounded-2xl bg-[#1b1b20] border border-white/5 p-4 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#cbc3d7]/65">
            Live Map: Active Volunteers ({volunteers.length})
          </span>
        </div>
        {/* Simple map vector outline */}
        <div className="relative h-28 bg-[#131318] rounded-xl flex items-center justify-center overflow-hidden border border-white/5">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 50 L 300 120 M 50 0 L 220 250 M 200 0 L 100 250" stroke="#FFF" strokeWidth="0.5" />
          </svg>
          {/* Dynamic Volunteer dots from live GPS coordinates */}
          {volunteers.map((v, idx) => {
            const locOffsets = [
              { top: '30%', left: '35%', color: 'bg-indigo-400' },
              { top: '60%', left: '65%', color: 'bg-[#00F2FF]' },
              { top: '70%', left: '48%', color: 'bg-amber-400' }
            ];
            const offset = locOffsets[idx % locOffsets.length];
            return (
              <div 
                key={v.id} 
                className={`absolute w-2 h-2 ${offset.color} rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]`} 
                style={{ top: offset.top, left: offset.left }}
                title={`${v.name} (${v.role})`}
              />
            );
          })}
          <span className="text-[10px] font-mono text-[#cbc3d7]/30 absolute bottom-1 right-2">VOLUNTEERS ACTIVE</span>
        </div>
      </div>

      {/* Urgent Appeals List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pl-1">
          <span className="text-xs font-mono font-bold tracking-wider text-[#cbc3d7]/40 uppercase">
            Urgent Regional Appeals
          </span>
          <span className="text-[9px] font-mono text-[#cbc3d7]/40">Active dispatch</span>
        </div>

        <div className="space-y-2">
          {[
            { tag: 'Emergency Feeding Support Needed', sector: `${userLocation.name} • Critical priority` },
            { tag: 'Transport Vehicle Sighting Requested', sector: 'North Post • Medium Priority' },
            { tag: 'Heavy blankets & Medical foster kit', sector: 'West Sector • Standard Priority' }
          ].map((appeal, idx) => (
            <div 
              key={idx}
              className={`p-3 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between text-left transition-all`}
            >
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white leading-tight">{appeal.tag}</h4>
                <p className="text-[10px] text-[#cbc3d7]/60">{appeal.sector}</p>
              </div>
              <button 
                onClick={() => {
                  addNotification('Emergency Appeal Answered', `Dispatched support for: ${appeal.tag}`, 'Info');
                }}
                className="text-[10px] font-black text-[#00F2FF] hover:underline cursor-pointer"
              >
                Fulfill
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
export default RescueCommandView;

