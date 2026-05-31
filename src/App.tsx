import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Screen } from './types';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';

// Imports of screen components
import { Splash } from './components/screens/Splash';
import { HomeView, NotificationsView, SOSView, AIAssistantView } from './components/screens/Home';
import { RescueCommandView, OfflineModeView, NGODashboardView } from './components/screens/RescueCommand';
import { FosterDashboardView, VolunteerDashboardView, OwnerDashboardView } from './components/screens/Dashboards';
import { VoiceReportingView, InjuryAnalysisView, VetDashboardView } from './components/screens/InjuryAnalysis';
import { AccessibilitySettingsView } from './components/screens/AccessibilitySettings';

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.Splash);
  const [transitionType, setTransitionType] = useState<'push' | 'none'>('none');

  // Set up state for all global accessibility and theme preferences
  const [simpleView, setSimpleView] = useState<boolean>(() => {
    return localStorage.getItem('compawss_simpleView') !== 'false';
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('compawss_highContrast') === 'true';
  });
  const [textSize, setTextSize] = useState<number>(() => {
    return Number(localStorage.getItem('compawss_textSize') || '3');
  });
  const [colorFilter, setColorFilter] = useState<string>(() => {
    return localStorage.getItem('compawss_colorFilter') || 'none';
  });
  const [voiceCommands, setVoiceCommands] = useState<boolean>(() => {
    return localStorage.getItem('compawss_voiceCommands') !== 'false';
  });
  const [audioHaptics, setAudioHaptics] = useState<boolean>(() => {
    return localStorage.getItem('compawss_audioHaptics') === 'true';
  });
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('compawss_themeMode') as 'dark' | 'light' | 'system') || 'dark';
  });

  const handleSetThemeMode = (val: 'dark' | 'light' | 'system') => {
    setThemeMode(val);
    localStorage.setItem('compawss_themeMode', val);
  };

  // Apply visual settings to document head and DOM attributes
  useEffect(() => {
    // 1. Persist preferences
    localStorage.setItem('compawss_simpleView', String(simpleView));
    localStorage.setItem('compawss_highContrast', String(highContrast));
    localStorage.setItem('compawss_textSize', String(textSize));
    localStorage.setItem('compawss_colorFilter', colorFilter);
    localStorage.setItem('compawss_voiceCommands', String(voiceCommands));
    localStorage.setItem('compawss_audioHaptics', String(audioHaptics));

    // 2. Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // 3. Scale base text size globally
    const sizePercent = {
      1: '78%',
      2: '88%',
      3: '100%',
      4: '114%',
      5: '128%',
    }[textSize] || '100%';
    document.documentElement.style.fontSize = sizePercent;

    // 4. Color accessibility filters simulation
    document.documentElement.classList.remove('filter-protanopia', 'filter-deuteranopia', 'filter-tritanopia');
    if (colorFilter !== 'none') {
      document.documentElement.classList.add(`filter-${colorFilter}`);
    }

    // 5. Light Mode & Dark Mode theme calculation
    const determineIfLightMode = () => {
      // If we are on the Splash/landing page, it must ALWAYS open in Dark Mode unless the user has manually chose and saved 'light'
      if (screen === Screen.Splash) {
        return localStorage.getItem('compawss_themeMode') === 'light';
      }

      if (themeMode === 'light') return true;
      if (themeMode === 'dark') return false;
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    };

    if (determineIfLightMode()) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [simpleView, highContrast, textSize, colorFilter, voiceCommands, audioHaptics, themeMode, screen]);

  // Sync with OS Theme changes when themeMode is 'system'
  useEffect(() => {
    if (themeMode !== 'system') return;

    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (screen === Screen.Splash && localStorage.getItem('compawss_themeMode') !== 'light') {
        document.documentElement.classList.remove('light-mode');
        return;
      }
      if (query.matches) {
        document.documentElement.classList.add('light-mode');
      } else {
        document.documentElement.classList.remove('light-mode');
      }
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [themeMode, screen]);

  // Let's create an elegant wrapper that forces transition types elegantly!
  const navigateTo = (nextScreen: Screen, type: 'push' | 'none' = 'none') => {
    setTransitionType(type);
    setScreen(nextScreen);
  };

  // Dedicated screen renderer
  const renderScreen = () => {
    switch (screen) {
      case Screen.Splash:
        return <Splash onGetStarted={() => navigateTo(Screen.Home, 'push')} />;

      case Screen.Home:
        return <HomeView onNavigate={(s) => navigateTo(s, s === Screen.SOS ? 'push' : 'none')} />;

      case Screen.Notifications:
        return (
          <NotificationsView 
            onNavigate={(s) => navigateTo(s, s === Screen.RescueCommand ? 'push' : 'none')} 
          />
        );

      case Screen.SOS:
        return <SOSView onNavigate={(s) => navigateTo(s, 'push')} />; // goes to VoiceReporting

      case Screen.VoiceReporting:
        return (
          <VoiceReportingView 
            onNavigate={(s) => navigateTo(s, s === Screen.InjuryAnalysis ? 'push' : 'none')} 
          />
        );

      case Screen.InjuryAnalysis:
        return (
          <InjuryAnalysisView 
            onNavigate={(s) => navigateTo(s, s === Screen.VetDashboard ? 'push' : 'none')} 
          />
        );

      case Screen.VetDashboard:
        return (
          <VetDashboardView 
            onNavigate={(s) => navigateTo(s, s === Screen.InjuryAnalysis ? 'push' : 'none')} 
          />
        );

      case Screen.RescueCommand:
        return (
          <RescueCommandView 
            onNavigate={(s) => navigateTo(s, s === Screen.NGODashboard ? 'push' : 'none')} 
          />
        );

      case Screen.OfflineMode:
        return (
          <OfflineModeView 
            onNavigate={(s) => navigateTo(s, s === Screen.RescueCommand ? 'push' : 'none')} 
          />
        );

      case Screen.NGODashboard:
        return (
          <NGODashboardView 
            onNavigate={(s) => navigateTo(s, s === Screen.VolunteerDashboard ? 'push' : 'none')} 
          />
        );

      case Screen.VolunteerDashboard:
        return (
          <VolunteerDashboardView 
            onNavigate={(s) => navigateTo(s, s === Screen.RescueCommand ? 'push' : 'none')} 
          />
        );

      case Screen.FosterDashboard:
        return <FosterDashboardView onNavigate={(s) => navigateTo(s, 'none')} />;

      case Screen.OwnerDashboard:
        return (
          <OwnerDashboardView 
            onNavigate={(s) => navigateTo(s, s === Screen.InjuryAnalysis ? 'push' : 'none')} 
          />
        );

      case Screen.AIAssistant:
        return (
          <AIAssistantView 
            onNavigate={(s) => navigateTo(s, 'push')} 
          />
        );

      case Screen.AccessibilitySettings:
        return (
          <AccessibilitySettingsView 
            onNavigate={(s) => navigateTo(s, 'none')}
            simpleView={simpleView}
            setSimpleView={setSimpleView}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
            textSize={textSize}
            setTextSize={setTextSize}
            colorFilter={colorFilter}
            setColorFilter={setColorFilter}
            voiceCommands={voiceCommands}
            setVoiceCommands={setVoiceCommands}
            audioHaptics={audioHaptics}
            setAudioHaptics={setAudioHaptics}
            themeMode={themeMode}
            setThemeMode={handleSetThemeMode}
          />
        );

      default:
        return <HomeView onNavigate={(s) => navigateTo(s, 'none')} />;
    }
  };

  // Whether to show general chrome/frame (Navbar + Header)
  const showChrome = screen !== Screen.Splash;

  // Render transitions beautifully with motion layout
  const animationVariants = {
    initial: (type: 'push' | 'none') => ({
      opacity: 0,
      x: type === 'push' ? 120 : 0,
      scale: type === 'push' ? 0.98 : 1,
    }),
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: [0.16, 1, 0.3, 1],
      }
    },
    exit: (type: 'push' | 'none') => ({
      opacity: 0,
      x: type === 'push' ? -120 : 0,
      scale: type === 'push' ? 0.98 : 1,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
      }
    })
  };

  return (
    <div className="bg-[#08080C] text-[#E0E0E6] min-h-screen w-full font-sans antialiased overflow-x-hidden relative flex flex-col selection:bg-immersive-accent/30 selection:text-white">
      
      {/* Immersive Theme Ambient Atmosphere */}
      <div className="atmosphere" />
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-10" 
        style={{
          backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(circle at center, black, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 90%)',
        }}
      />

      {/* Shared Header Chrome */}
      {showChrome && (
        <Header 
          currentScreen={screen} 
          setScreen={(s) => navigateTo(s, 'none')} 
        />
      )}

      {/* Main viewport Container with transitions */}
      <main className={`relative z-10 flex-1 flex flex-col ${showChrome ? 'pt-4' : ''}`}>
        <AnimatePresence mode="wait" custom={transitionType}>
          <motion.div
            key={screen}
            custom={transitionType}
            variants={animationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col w-full"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Shared Bottom Navbar Chrome */}
      {showChrome && (
        <Navbar 
          currentScreen={screen} 
          onNavigate={(s) => navigateTo(s, 'none')} 
        />
      )}


      {/* SVG Color Blindness filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0  0.558, 0.442, 0, 0, 0  0, 0.242, 0.758, 0, 0  0, 0, 0, 1, 0"/>
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0  0.7, 0.3, 0, 0, 0  0, 0.3, 0.7, 0, 0  0, 0, 0, 1, 0"/>
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0  0, 0.433, 0.567, 0, 0  0, 0.475, 0.525, 0, 0  0, 0, 0, 1, 0"/>
        </filter>
      </svg>
    </div>
  );
}
