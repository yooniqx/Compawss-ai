import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Screen } from '../../types';
import { CompawssLogo } from '../CompawssLogo';

interface SplashProps {
  onGetStarted: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onGetStarted }) => {
  return (
    <div className="relative h-[100dvh] w-full flex flex-col items-center justify-between px-6 py-6 sm:py-10 md:py-12 overflow-hidden bg-[#08080C]">
      {/* Dynamic theme atmosphere background */}
      <div className="atmosphere" />
      
      {/* Background patterns */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-15" 
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle at center, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 20%, transparent 80%)',
        }}
      />
      
      {/* Ambient background glow dots with red/cyan theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[600px] aspect-square bg-[#FF4E00]/10 rounded-full blur-[110px] pointer-events-none mix-blend-screen animate-ambient z-0" />
      <div className="absolute top-[40%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[40vw] max-w-[300px] aspect-square bg-[#00F2FF]/8 rounded-full blur-[90px] pointer-events-none mix-blend-screen z-0" />

      {/* Top spacer */}
      <div className="flex-1 min-h-[10px]" />

      {/* Center content: Branding & Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 sm:gap-6 w-full max-w-sm">
        
        {/* Signal-wave pulsing outer circles centering Compawss Logo */}
        <div className="relative flex items-center justify-center p-3 sm:p-6 rounded-full">
          {/* Signal wave 1 */}
          <div className="absolute inset-0 rounded-full border border-[#FF4E00]/25 animate-ping opacity-20 pointer-events-none" style={{ animationDuration: '3s' }} />
          {/* Signal wave 2 */}
          <div className="absolute inset-4 rounded-full border border-[#00F2FF]/20 animate-pulse opacity-35 pointer-events-none" style={{ animationDuration: '2s' }} />
          
          {/* Official Core Logo Asset - Responsive size using classes */}
          <CompawssLogo size="100%" animate={true} className="w-36 h-36 sm:w-52 sm:h-52 md:w-[230px] md:h-[230px] max-h-[25vh] max-w-[25vh] drop-shadow-[0_0_35px_rgba(255,184,0,0.18)]" />
        </div>

        {/* Title & Accent */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="font-display text-[26px] sm:text-[38px] md:text-[42px] leading-tight font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-[#FFE5A3] to-[#cbc3d7]">
            Compawss AI
          </h1>
          <p className="text-[9px] sm:text-[10px] font-mono tracking-[0.3em] text-[#00F2FF] font-black uppercase">
            HUMANITARIAN SATELLITE SYSTEM
          </p>
          <div className="h-[2px] w-14 bg-gradient-to-r from-[#FF4E00] to-[#00F2FF] rounded-full mt-1 sm:mt-2" />
        </div>
      </div>

      {/* Bottom Call to Action and tagline */}
      <div className="relative z-10 flex flex-col items-center justify-end w-full max-w-xs gap-3 sm:gap-5 mt-4 sm:mt-12 flex-1 pb-4 sm:pb-6">
        
        {/* Glassmorphic button */}
        <button
          onClick={onGetStarted}
          className="relative flex items-center justify-center w-full h-[52px] rounded-xl bg-gradient-to-r from-[#FF4E00] to-[#00F2FF] p-[1px] group cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_5px_25px_rgba(255,78,0,0.25)]"
        >
          {/* Inner glass overlay */}
          <div className="absolute inset-[1px] rounded-xl bg-[#08080C]/90 backdrop-blur-2xl group-hover:bg-[#08080C]/75 transition-colors z-0" />
          
          <div className="relative z-10 flex items-center justify-center gap-2 w-full h-full px-6">
            <span className="font-sans text-xs text-[#e4e1e9] font-black tracking-widest uppercase">
              ACTIVATE OVERWATCH SYSTEM
            </span>
            <ArrowRight className="w-4 h-4 text-[#00F2FF] group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Tagline */}
        <p className="font-mono text-[9px] text-[#FF4E00]/80 font-bold tracking-[0.25em] uppercase text-center flex items-center gap-1.5 justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          OFFICIAL PROTOCOL ENCRYPTED
        </p>
      </div>
    </div>
  );
};
export default Splash;
