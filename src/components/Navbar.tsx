import React from 'react';
import { Home, Map, Mic, Settings, Navigation } from 'lucide-react';
import { Screen } from '../types';

interface NavbarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreen, onNavigate }) => {
  // Let's define navigation mappings helper
  const navItems = [
    { label: 'Home', screen: Screen.Home, icon: Home },
    { label: 'Map', screen: Screen.RescueCommand, icon: Map },
    { label: 'Report', screen: Screen.VoiceReporting, icon: Mic },
    { label: 'Tracking', screen: Screen.AIAssistant, icon: Navigation }, // Can double as Tracking/AI
    { label: 'Settings', screen: Screen.AccessibilitySettings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08080C]/95 backdrop-blur-xl border-t border-white/10 py-2 px-4 shadow-[0_-15px_30px_rgba(0,0,0,0.7)]">
      <div className="max-w-md md:max-w-xl mx-auto flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            currentScreen === item.screen ||
            (item.screen === Screen.RescueCommand && currentScreen === Screen.OfflineMode) ||
            (item.screen === Screen.VoiceReporting && currentScreen === Screen.SOS);

          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative group min-w-[64px]"
              aria-label={item.label}
            >
              {/* Active glow indicator */}
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#FF4E00] to-[#00F2FF] rounded-full shadow-[0_0_12px_rgba(255,78,0,0.9)] animate-pulse" />
              )}
              
              <div 
                className={`p-1.5 rounded-lg transition-all ${
                  isActive 
                    ? 'text-[#FF4E00] bg-[#FF4E00]/10 scale-110 drop-shadow-[0_0_8px_rgba(255,78,0,0.4)]' 
                    : 'text-[#cbc3d7]/60 group-hover:text-white group-hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span 
                className={`text-[10px] font-medium tracking-wide mt-0.5 transition-colors ${
                  isActive ? 'text-[#FF4E00] font-bold' : 'text-[#cbc3d7]/50 group-hover:text-[#cbc3d7]/80'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
export default Navbar;
