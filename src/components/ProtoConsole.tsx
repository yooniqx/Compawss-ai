import React, { useState } from 'react';
import { Terminal, Sliders, ChevronDown, ChevronUp, Layers, HelpCircle } from 'lucide-react';
import { Screen } from '../types';

interface ProtoConsoleProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const ProtoConsole: React.FC<ProtoConsoleProps> = ({ currentScreen, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const screenGroups = [
    {
      title: 'General & Core',
      screens: [
        { label: 'Splash Screen', val: Screen.Splash },
        { label: 'Home Feed', val: Screen.Home },
        { label: 'AI Assistant', val: Screen.AIAssistant },
        { label: 'Notifications', val: Screen.Notifications },
        { label: 'Accessibility Settings', val: Screen.AccessibilitySettings },
      ],
    },
    {
      title: 'Emergency Actions',
      screens: [
        { label: 'SOS Alert Info', val: Screen.SOS },
        { label: 'Voice Emergency Reporting', val: Screen.VoiceReporting },
        { label: 'Injury Diagnosis (CV)', val: Screen.InjuryAnalysis },
        { label: 'Rescue Command Map', val: Screen.RescueCommand },
        { label: 'Offline Mode Maps', val: Screen.OfflineMode },
      ],
    },
    {
      title: 'User Role Dashboards',
      screens: [
        { label: 'Owner Dashboard', val: Screen.OwnerDashboard },
        { label: 'Volunteer Dashboard', val: Screen.VolunteerDashboard },
        { label: 'Vet Dashboard', val: Screen.VetDashboard },
        { label: 'Foster Dashboard', val: Screen.FosterDashboard },
        { label: 'NGO Coordinator Board', val: Screen.NGODashboard },
      ],
    },
  ];

  const isSplash = currentScreen === Screen.Splash;

  return (
    <div className={`fixed z-50 flex flex-col items-end transition-all duration-300 ${
      isSplash ? 'top-4 right-4' : 'bottom-18 right-4'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#3c0091] to-[#003640] border border-white/20 hover:border-[#4cd7f6]/50 text-white shadow-2xl transition-all cursor-pointer backdrop-blur-md"
      >
        <Terminal className="w-4 h-4 text-[#4cd7f6] animate-pulse" />
        <span className="text-xs font-mono font-bold tracking-wider">PROTOTYPE NAVIGATOR</span>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[#cbc3d7]" /> : <ChevronUp className="w-4 h-4 text-[#cbc3d7]" />}
      </button>

      {/* Expanded Console Panel */}
      {isOpen && (
        <div className="mt-2 w-[320px] max-h-[420px] overflow-y-auto rounded-2xl bg-[#1b1b20]/95 border border-white/10 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-[#cbc3d7] font-mono">
              <Layers className="w-3.5 h-3.5 text-[#d0bcff]" />
              <span>ACTIVE SYSTEM STATE</span>
            </div>
            <span className="text-[10px] bg-[#4cd7f6]/20 text-[#4cd7f6] px-1.5 py-0.5 rounded font-mono">
              15 SCREENS
            </span>
          </div>

          <div className="space-y-4">
            {screenGroups.map((group) => (
              <div key={group.title} className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#cbc3d7]/40 block pl-1">
                  {group.title}
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {group.screens.map((s) => {
                    const isSelected = currentScreen === s.val;
                    return (
                      <button
                        key={s.val}
                        onClick={() => {
                          onNavigate(s.val);
                          // Option to auto-close or leave open
                        }}
                        className={`text-left text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#a078ff] to-[#03b5d3] text-white font-semibold shadow-md'
                            : 'bg-white/5 text-[#cbc3d7] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{s.label}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 mt-4 pt-2.5 flex items-center justify-between text-[10px] text-[#cbc3d7]/50 font-mono">
            <span>COMPAWSS AI CORE v1.4</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
              <span>PROD SIMULATION</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
