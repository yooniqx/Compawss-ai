import React from 'react';
import { 
  Eye, 
  Smile, 
  Volume2, 
  Type, 
  Sliders, 
  Mic 
} from 'lucide-react';
import { Screen } from '../../types';

interface AccessibilitySettingsProps {
  onNavigate: (screen: Screen) => void;
  simpleView: boolean;
  setSimpleView: (val: boolean) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  textSize: number;
  setTextSize: (val: number) => void;
  colorFilter: string;
  setColorFilter: (val: string) => void;
  voiceCommands: boolean;
  setVoiceCommands: (val: boolean) => void;
  audioHaptics: boolean;
  setAudioHaptics: (val: boolean) => void;
  themeMode: 'dark' | 'light' | 'system';
  setThemeMode: (val: 'dark' | 'light' | 'system') => void;
}

export const AccessibilitySettingsView: React.FC<AccessibilitySettingsProps> = ({ 
  onNavigate,
  simpleView,
  setSimpleView,
  highContrast,
  setHighContrast,
  textSize,
  setTextSize,
  colorFilter,
  setColorFilter,
  voiceCommands,
  setVoiceCommands,
  audioHaptics,
  setAudioHaptics,
  themeMode,
  setThemeMode,
}) => {
  return (
    <div className="flex-1 pb-44 overflow-y-auto w-full px-4 md:px-8 max-w-md mx-auto pt-4 space-y-6 animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="space-y-1 text-left">
        <h2 className="font-display font-black text-xl text-white">
          Personalize Your Experience
        </h2>
        <p className="text-xs text-[#cbc3d7]/85 font-medium leading-relaxed">
          Adjust settings to make Compawss AI work best for your needs.
        </p>
      </div>

      {/* Simple View custom container card */}
      <div 
        onClick={() => setSimpleView(!simpleView)}
        className={`p-5 glass-panel border flex items-start gap-4 cursor-pointer transition ${
          simpleView 
            ? 'border-[#FF4E00] bg-[#FF4E00]/5' 
            : 'border-white/10 hover:border-[#FF4E00]/50 hover:bg-[#FF4E00]/5'
        }`}
      >
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
          simpleView ? 'bg-[#FF4E00]/20 text-[#FF4E00]' : 'bg-[#00F2FF]/10 text-[#00F2FF]'
        }`}>
          <Smile className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left space-y-1">
          <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
            Simple View
            {simpleView && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF4E00]/20 text-[#FF4E00] uppercase font-black tracking-wider">Active</span>}
          </h3>
          <p className="text-[11px] text-[#cbc3d7]/70 leading-relaxed">
            Reduces clutter and simplifies terminology for low-literacy users.
          </p>
        </div>
        <input 
          type="checkbox"
          checked={simpleView}
          onChange={() => {}} // custom handled by container click
          className="h-5 w-5 rounded-md border-white/20 bg-white/5 text-[#FF4E00] focus:ring-0 cursor-pointer self-center accent-[#FF4E00]"
        />
      </div>

      {/* Visual Preferences Category header */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF4E00] block text-left">
          Visual Preferences
        </span>

        {/* High Contrast Mode switch */}
        <div className={`p-4 glass-panel border space-y-3 transition ${
          highContrast ? 'border-[#00F2FF]' : 'border-white/10'
        }`}>
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4.5 h-4.5 text-[#00F2FF]" />
              <span className="text-xs font-bold text-white flex items-center gap-2">
                High Contrast Mode
                {highContrast && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00F2FF]/20 text-[#00F2FF] uppercase font-black tracking-wider">On</span>}
              </span>
            </div>
            
            {/* Custom switch */}
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                highContrast ? 'bg-[#FF4E00]' : 'bg-white/10'
              }`}
            >
              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                highContrast ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <p className="text-[11px] text-[#cbc3d7]/65 text-left leading-relaxed">
            Enhances readability by maximizing color distinction between elements and background.
          </p>
        </div>

        {/* App Theme System */}
        <div className="p-4 glass-panel border border-white/10 space-y-3.5 text-left transition">
          <div className="flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-[#00F2FF]" />
            <span className="text-xs font-bold text-white">App Theme</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[10px] font-bold">
            {[
              { id: 'dark', label: 'Dark Mode' },
              { id: 'light', label: 'Light Mode' },
              { id: 'system', label: 'System Default' },
            ].map((themeOpt) => {
              const active = themeMode === themeOpt.id;
              return (
                <button
                  key={themeOpt.id}
                  onClick={() => setThemeMode(themeOpt.id as any)}
                  className={`py-2 px-1 rounded-lg border text-center transition cursor-pointer ${
                    active 
                      ? 'border-[#00F2FF] bg-[#00F2FF]/10 text-[#00F2FF] drop-shadow-[0_0_8px_rgba(0,242,255,0.2)]'
                      : 'border-white/5 bg-white/5 text-[#cbc3d7]/70 hover:bg-white/10'
                  }`}
                >
                  {themeOpt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Text size slider */}
        <div className="p-4 glass-panel border border-white/10 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4.5 h-4.5 text-[#FF4E00]" />
              <span className="text-xs font-bold text-white">Dynamic Text Size</span>
            </div>
            <span className="text-[10px] font-mono text-[#FF4E00] font-bold uppercase rounded-md bg-[#FF4E00]/10 px-2 py-0.5">Scale: {textSize}/5</span>
          </div>

          <div className="flex justify-between text-[11px] text-[#cbc3d7]/40 px-1 font-mono">
            <span>A</span>
            <span className="text-white font-bold text-xs uppercase">A</span>
          </div>

          <input 
            type="range"
            min="1"
            max="5"
            value={textSize}
            onChange={(e) => setTextSize(Number(e.target.value))}
            className="w-full accent-[#FF4E00] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Color Deficit Filters */}
        <div className="p-4 glass-panel border border-white/10 space-y-3.5 text-left">
          <div className="flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-[#00F2FF]" />
            <span className="text-xs font-bold text-white">Color Deficit Filters</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            {[
              { id: 'none', label: 'None (Reset)' },
              { id: 'protanopia', label: 'Protanopia (Red-Blind)' },
              { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
              { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
            ].map((filter) => {
              const active = colorFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setColorFilter(filter.id)}
                  className={`py-2 px-2.5 rounded-lg border text-left transition cursor-pointer ${
                    active 
                      ? 'border-[#00F2FF] bg-[#00F2FF]/10 text-[#00F2FF] drop-shadow-[0_0_8px_rgba(0,242,255,0.2)]'
                      : 'border-white/5 bg-white/5 text-[#cbc3d7]/70 hover:bg-white/10'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Audio & Interaction Category */}
      <div className="space-y-4">
        <span className="text-[10px] uppercase font-bold tracking-wider text-[#FF4E00] block text-left">
          Audio & Interaction
        </span>

        {/* Voice Commands Switch item */}
        <div className={`p-4 glass-panel border space-y-3 text-left transition ${
          voiceCommands ? 'border-[#00F2FF]' : 'border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Mic className="w-4.5 h-4.5 text-[#00F2FF]" />
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Voice Commands
                {voiceCommands && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00F2FF]/20 text-[#00F2FF] uppercase font-black tracking-wider">Active</span>}
              </span>
            </div>
            
            <button 
              onClick={() => setVoiceCommands(!voiceCommands)}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                voiceCommands ? 'bg-[#FF4E00]' : 'bg-white/10'
              }`}
            >
              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                voiceCommands ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <p className="text-[11px] text-[#cbc3d7]/65 leading-relaxed">
            Navigate the app and input data entirely hands-free using voice recognition.
          </p>
        </div>

        {/* Audio Haptics switch item */}
        <div className={`p-4 glass-panel border space-y-3 text-left transition ${
          audioHaptics ? 'border-[#FF4E00]' : 'border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4.5 h-4.5 text-[#FF4E00]" />
              <span className="text-xs font-bold text-white flex items-center gap-2">
                Audio Haptics
                {audioHaptics && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#FF4E00]/20 text-[#FF4E00] uppercase font-black tracking-wider">On</span>}
              </span>
            </div>
            
            <button 
              onClick={() => setAudioHaptics(!audioHaptics)}
              className={`h-6 w-11 rounded-full p-0.5 transition-colors cursor-pointer ${
                audioHaptics ? 'bg-[#FF4E00]' : 'bg-white/10'
              }`}
            >
              <div className={`h-5 w-5 rounded-full bg-white transition-transform ${
                audioHaptics ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <p className="text-[11px] text-[#cbc3d7]/65 leading-relaxed">
            Play subtle sound cues for button presses, alerts, and successful actions.
          </p>
        </div>
      </div>

    </div>
  );
};
export default AccessibilitySettingsView;
