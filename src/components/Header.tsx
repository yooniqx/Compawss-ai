import React from 'react';
import { Sparkles, Bell, AlertTriangle } from 'lucide-react';
import { Screen } from '../types';
import { CompawssLogo } from './CompawssLogo';

interface HeaderProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  unreadNotificationsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  setScreen,
  unreadNotificationsCount = 1,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#08080C]/85 backdrop-blur-md border-b border-white/10 py-3.5 px-5">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-between">
        {/* Brand logo & title */}
        <div
          onClick={() => setScreen(Screen.Home)}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-11 h-11 p-0.5 rounded-full transition-transform active:scale-95 duration-150">
            {/* Signal radar wave glow element behind header logo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF4E00] to-[#00F2FF] opacity-10 group-hover:opacity-25 blur-sm transition-opacity" />
            <CompawssLogo size={42} animate={true} className="relative z-10 filter drop-shadow-[0_0_8px_rgba(255,184,0,0.25)]" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-[15px] leading-tight tracking-tight text-white group-hover:text-[#FFE5A3] transition-all">
              Compawss AI
            </span>
            <span className="text-[8.5px] font-mono tracking-widest text-[#FF4E00] font-black uppercase">
              HUMANITARIAN SATELLITE
            </span>
          </div>
        </div>

        {/* Utilities header */}
        <div className="flex items-center gap-3">
          {/* Quick Assistant Access */}
          <button 
            onClick={() => setScreen(Screen.AIAssistant)}
            title="AI Assistant"
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
              currentScreen === Screen.AIAssistant 
                ? 'bg-[#00F2FF]/10 border-[#00F2FF] text-[#00F2FF]' 
                : 'bg-white/5 border-white/10 text-[#cbc3d7] hover:border-[#00F2FF]/50 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* SOS Shortcut */}
          <button 
            onClick={() => setScreen(Screen.SOS)}
            title="SOS Trigger"
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all ${
              currentScreen === Screen.SOS
                ? 'bg-gradient-to-r from-[#FF4E00] to-red-600 border-transparent text-white pulse-accent'
                : 'bg-white/5 border-white/10 text-[#FF4E00] hover:bg-[#FF4E00]/10 hover:border-[#FF4E00]'
            }`}
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </button>

          {/* Notification bell */}
          <button 
            onClick={() => setScreen(Screen.Notifications)}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10 text-[#cbc3d7] hover:border-[#FF4E00]/50 hover:text-white transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF4E00] text-[10px] font-bold text-white shadow-[0_0_8px_rgba(255,78,0,0.5)]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
