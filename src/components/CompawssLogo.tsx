import React from 'react';

interface CompawssLogoProps {
  size?: number | string;
  animate?: boolean;
  className?: string;
}

export const CompawssLogo: React.FC<CompawssLogoProps> = ({
  size = 120,
  animate = true,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} select-none`}
    >
      <defs>
        {/* Glowing gradients matching the official rich gold, amber, and tech cyan colors */}
        <radialGradient id="compawss-ambient-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFAE00" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#FF4E00" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#08080C" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="compawss-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF1CC" />
          <stop offset="35%" stopColor="#E9C164" />
          <stop offset="70%" stopColor="#C49B3C" />
          <stop offset="100%" stopColor="#8C6507" />
        </linearGradient>

        <linearGradient id="compawss-gold-light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFEAA5" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        <linearGradient id="compawss-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FF" />
          <stop offset="100%" stopColor="#006680" />
        </linearGradient>

        {/* Brand Glow Filters */}
        <filter id="compawss-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="compawss-cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 1. Underlying ambient gold-amber radial halo */}
      <circle cx="200" cy="200" r="170" fill="url(#compawss-ambient-glow)" />

      {/* 2. Real-Time Rotating Constellation Web (Exact original orange/cyan satellite network) */}
      <g className={animate ? 'animate-spin-slow' : ''} style={{ transformOrigin: '200px 200px', animationDuration: '35s' }}>
        {/* Outer orbital boundary rings */}
        <circle cx="200" cy="200" r="150" stroke="#E9C164" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.3" />
        <circle cx="200" cy="200" r="135" stroke="#00F2FF" strokeWidth="0.5" strokeDasharray="1 6" strokeOpacity="0.4" />
        <circle cx="200" cy="200" r="165" stroke="#E9C164" strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Complex cybernetic network links - identical visual geometry to the official graphic */}
        <path d="M 200,50 L 306,94 L 350,200 L 306,306 L 200,350 L 94,306 L 50,200 L 94,94 Z" stroke="#E9C164" strokeWidth="0.75" strokeOpacity="0.25" />
        <path d="M 200,50 L 350,200 L 200,350 L 50,200 Z" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.2" />
        <path d="M 94,94 L 306,94 L 306,306 L 94,306 Z" stroke="#E9C164" strokeWidth="0.6" strokeOpacity="0.18" />
        
        {/* Core telemetry lines meeting in the golden center point */}
        <line x1="200" y1="50" x2="200" y2="350" stroke="#E9C164" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="50" y1="200" x2="350" y2="200" stroke="#E9C164" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="94" y1="94" x2="306" y2="306" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.15" />
        <line x1="94" y1="306" x2="306" y2="94" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.15" />

        {/* Secondary network bridges */}
        <path d="M 200,90 L 278,122 L 310,200 L 278,278 L 200,310 L 122,278 L 90,200 L 122,122 Z" stroke="#00F2FF" strokeWidth="0.4" strokeOpacity="0.15" />
        
        {/* Glowing network hub joints (scattered orange/cyan nodes) */}
        <circle cx="147" cy="85" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" opacity="0.8" />
        <circle cx="253" cy="85" r="2.5" fill="#E9C164" opacity="0.7" />
        <circle cx="315" cy="147" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" opacity="0.8" />
        <circle cx="315" cy="253" r="2.5" fill="#E9C164" opacity="0.7" />
        <circle cx="253" cy="315" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" opacity="0.8" />
        <circle cx="147" cy="315" r="2.5" fill="#E9C164" opacity="0.7" />
        <circle cx="85" cy="253" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" opacity="0.8" />
        <circle cx="85" cy="147" r="2.5" fill="#E9C164" opacity="0.7" />

        <circle cx="200" cy="90" r="2" fill="#E9C164" />
        <circle cx="310" cy="200" r="2" fill="#00F2FF" />
        <circle cx="200" cy="310" r="2" fill="#E9C164" />
        <circle cx="90" cy="200" r="2" fill="#00F2FF" />
      </g>

      {/* 3. Concentric radar telemetry dials & tick marks */}
      <circle cx="200" cy="200" r="118" stroke="url(#compawss-gold)" strokeWidth="1.25" strokeOpacity="0.32" />
      <circle cx="200" cy="200" r="108" stroke="#00F2FF" strokeWidth="0.75" strokeDasharray="12 4" strokeOpacity="0.35" />
      <circle cx="200" cy="200" r="102" stroke="url(#compawss-gold)" strokeWidth="0.5" strokeDasharray="2 3" strokeOpacity="0.4" />
      <circle cx="200" cy="200" r="88" stroke="#FFEAA5" strokeWidth="0.5" strokeOpacity="0.15" />

      {/* 4. Slender Cardinal Gold Compass Needles (Points EXACTED exactly as in the attachment) */}
      <g filter="url(#compawss-gold-glow)">
        {/* North Pointer Needle */}
        <path d="M 200,200 L 200,70 L 188,200 Z" fill="#8C6507" stroke="url(#compawss-gold)" strokeWidth="0.5" />
        <path d="M 200,200 L 200,70 L 212,200 Z" fill="url(#compawss-gold-light)" stroke="url(#compawss-gold)" strokeWidth="0.5" />

        {/* South Pointer Needle */}
        <path d="M 200,200 L 200,330 L 188,200 Z" fill="url(#compawss-gold-light)" stroke="url(#compawss-gold)" strokeWidth="0.5" />
        <path d="M 200,200 L 200,330 L 212,200 Z" fill="#8C6507" stroke="url(#compawss-gold)" strokeWidth="0.5" />

        {/* East Pointer Needle */}
        <path d="M 200,200 L 330,200 L 200,188 Z" fill="#8C6507" stroke="url(#compawss-gold)" strokeWidth="0.5" />
        <path d="M 200,200 L 330,200 L 200,212 Z" fill="url(#compawss-gold-light)" stroke="url(#compawss-gold)" strokeWidth="0.5" />

        {/* West Pointer Needle */}
        <path d="M 200,200 L 70,200 L 200,188 Z" fill="url(#compawss-gold-light)" stroke="url(#compawss-gold)" strokeWidth="0.5" />
        <path d="M 200,200 L 70,200 L 200,212 Z" fill="#8C6507" stroke="url(#compawss-gold)" strokeWidth="0.5" />

        {/* Central glowing cyan highlight/accents on key nodes for high-tech look */}
        <circle cx="200" cy="70" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" />
        <circle cx="200" cy="330" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" />
        <circle cx="330" cy="200" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" />
        <circle cx="70" cy="200" r="2.5" fill="#00F2FF" filter="url(#compawss-cyan-glow)" />
      </g>

      {/* Compass Letters (Positioned on the inner concentric telemetry ring with heavy dark stroke outlines for crisp contrast) */}
      <text x="200" y="115" textAnchor="middle" fill="#FFFFFF" stroke="#08080C" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round" strokeLinecap="round" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0">N</text>
      <text x="288" y="204" textAnchor="middle" fill="#FFFFFF" stroke="#08080C" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round" strokeLinecap="round" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0">E</text>
      <text x="200" y="298" textAnchor="middle" fill="#FFFFFF" stroke="#08080C" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round" strokeLinecap="round" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0">S</text>
      <text x="112" y="204" textAnchor="middle" fill="#FFFFFF" stroke="#08080C" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round" strokeLinecap="round" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0">W</text>

      {/* 5. Center Core Shield & Official Paw-Heart Symbol */}
      {/* Underlying dark shield backing */}
      <circle cx="200" cy="200" r="72" fill="#08080C" stroke="url(#compawss-gold)" strokeWidth="1.25" opacity="0.95" />
      <circle cx="200" cy="200" r="66" stroke="#00F2FF" strokeWidth="0.5" strokeDasharray="3 6" strokeOpacity="0.4" />
      
      {/* Glowing heart-paw centerpiece inside the circular shield - Mathematically centered with equal vertical padding */}
      <g filter="url(#compawss-gold-glow)" transform="translate(200, 206) scale(1.28)">
        
        {/* Core Heart Pad (Bottom larger segment of paw - Smooth Palm Shape) */}
        <path
          d="M 0,-8
             C -8,-18 -26,-18 -26,-4
             C -26,8 -18,20 -8,27
             C -4,30 4,30 8,27
             C 18,20 26,8 26,-4
             C 26,-18 8,-18 0,-8
             Z"
          fill="url(#compawss-gold-light)"
          stroke="#08080C"
          strokeWidth="1"
        />

        {/* Inner cutout heart creating the perfect official hollow emblem feel */}
        <path
          d="M 0,-4
             C -6,-12 -18,-12 -18,-2
             C -18,6 -12,14 -5,19
             C -2,21 2,21 5,19
             C 12,14 18,6 18,-2
             C 18,-12 6,-12 0,-4
             Z"
          fill="#08080C"
          stroke="url(#compawss-gold)"
          strokeWidth="1.2"
        />

        {/* 4 Brand Toe Pads (Perfect custom golden ovals attached visually with uniform, clean spacing and no overlaps) */}
        {/* Extreme Left Toe */}
        <ellipse cx="-26" cy="-21" rx="4.5" ry="7.5" transform="rotate(-28, -26, -21)" fill="url(#compawss-gold-light)" />
        {/* Center-Left Toe */}
        <ellipse cx="-11" cy="-30" rx="5" ry="8.5" transform="rotate(-9, -11, -30)" fill="url(#compawss-gold-light)" />
        {/* Center-Right Toe */}
        <ellipse cx="11" cy="-30" rx="5" ry="8.5" transform="rotate(9, 11, -30)" fill="url(#compawss-gold-light)" />
        {/* Extreme Right Toe */}
        <ellipse cx="26" cy="-21" rx="4.5" ry="7.5" transform="rotate(28, 26, -21)" fill="url(#compawss-gold-light)" />
      </g>

      {/* 6. Perimeter Circular Sub-Icons - EXACT original functional design */}
      {/* Positioned at exact 45-degree steps along outer constellation circle (R = 150) */}
      
      {/* TOP (0° - NORTH): Rescuer Corps (Three people silhouettes) */}
      <g transform="translate(200, 50)" className="cursor-pointer">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(0, -1) scale(0.95)" fill="url(#compawss-gold-light)">
          {/* Middle figure */}
          <circle cx="0" cy="-4" r="2.5" />
          <path d="M -4.5,4 C -4.5,1.5 -2.5,0.5 0,0.5 C 2.5,0.5 4.5,1.5 4.5,4 Z" />
          {/* Left figure */}
          <circle cx="-5.5" cy="-2" r="2" />
          <path d="M -9,5 C -9,2.8 -7.5,1.8 -5.5,1.8 C -3.5,1.8 -2,2.8 -2,5 Z" opacity="0.8" />
          {/* Right figure */}
          <circle cx="5.5" cy="-2" r="2" />
          <path d="M 2,5 C 2,2.8 3.5,1.8 5.5,1.8 C 7.5,1.8 9,2.8 9,5 Z" opacity="0.8" />
        </g>
      </g>

      {/* NORTHEAST (45°): GIS Map Pointer */}
      <g transform="translate(306, 94)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(0, -1)" fill="none" stroke="url(#compawss-gold-light)" strokeWidth="1.5">
          <path d="M 0,-7.5 C -4,-7.5 -6.5,-5 -6.5,-1 C -6.5,3.5 0,7.5 0,7.5 C 0,7.5 6.5,3.5 6.5,-1 C 6.5,-5 4,-7.5 0,-7.5 Z" />
          <circle cx="0" cy="-1.5" r="2" fill="url(#compawss-gold-light)" />
        </g>
      </g>

      {/* EAST (90°): ECG Pulse Wave */}
      <g transform="translate(350, 200)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <path d="M -9,0 L -5,0 L -3,-5.5 L 0.5,7 L 3.5, -4 L 5.5,0 L 9,0" stroke="#00F2FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#compawss-cyan-glow)" />
      </g>

      {/* SOUTHEAST (135°): Emergency Doctor with Stethoscope & Cross */}
      <g transform="translate(306, 306)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(0, -1)" fill="url(#compawss-gold-light)">
          {/* Physician Profile */}
          <circle cx="-1" cy="-4" r="2.8" />
          <path d="M -6.5,4 C -6.5,1.2 -3.5,0 0,0 C 3.5,0 5.5,1.2 5.5,4 Z" />
          {/* Stethoscope */}
          <path d="M-3.5,0.5 C-3.5,2.5 -1.5,4 0.5,4 C 2.5,4 3.5,2.5 3.5,0.5" fill="none" stroke="#00F2FF" strokeWidth="0.8" />
          <circle cx="3.5" cy="-0.5" r="0.8" fill="#00F2FF" />
          {/* Doctor lapel outline cross */}
          <path d="M 5.8,-4 L 8.8,-4 M 7.3,-5.5 L 7.3,-2.5" fill="none" stroke="url(#compawss-gold-light)" strokeWidth="1" />
        </g>
      </g>

      {/* SOUTH (180°): Long-Haired Volunteer Coordinator */}
      <g transform="translate(200, 350)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(0, -1)" fill="url(#compawss-gold-light)">
          {/* Female silhouette with profile hair sweep */}
          <circle cx="0" cy="-4.2" r="2.6" />
          {/* Hair back sweep shape */}
          <path d="M 1.8,-5.5 C 3.2,-4 3.8,-1.5 3,-0.2 C 2.2,1 1,1 0.8,1.5" fill="none" stroke="url(#compawss-gold-light)" strokeWidth="1.2" />
          <path d="M -5.5,5 C -5.5,2.2 -3,0.8 0,0.8 C 3,0.8 5,2.2 5,5 Z" />
        </g>
      </g>

      {/* SOUTHWEST (225°): Shelter Home / Foster Sanctuary */}
      <g transform="translate(94, 306)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(0, 0.5)">
          {/* Chimney */}
          <rect x="-6" y="-7" width="2" height="4" fill="url(#compawss-gold-light)" />
          {/* Roof */}
          <path d="M -8.5,-3 L 0,-10 L 8.5,-3 L 7,-1.5 L 0,-7.2 L -7,-1.5 Z" fill="url(#compawss-gold-light)" />
          {/* Base walls */}
          <path d="M -6,-2 L -6,6 L 6,6 L 6,-2 Z" fill="none" stroke="url(#compawss-gold-light)" strokeWidth="1.2" />
          {/* Open passage door */}
          <path d="M -2,6 L -2,1.5 L 2,1.5 L 2,6 Z" fill="url(#compawss-gold-light)" />
        </g>
      </g>

      {/* WEST (270°): Integrated Citizen Family (silhouettes holding hands) */}
      <g transform="translate(50, 200)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(-1, -1) scale(0.92)" fill="url(#compawss-gold-light)">
          {/* Father figure */}
          <circle cx="-3" cy="-4.2" r="2.2" />
          <path d="M -6.5,4.5 C -6.5,2 -4.5,1 0,1 C 0.5,1 -0.5,1 -1.5,4.5 Z" />
          {/* Mother figure */}
          <circle cx="3" cy="-3.8" r="2" />
          <path d="M 0,4.5 C 0.5,2.1 2,1.2 4.5,1.2 C 5.5,1.2 6.5,2 6.5,4.5 Z" />
          {/* Child holding hands */}
          <circle cx="8" cy="-1.5" r="1.5" />
          <path d="M 5.8,5 C 5.8,3.2 6.8,2.5 8,2.5 C 9.2,2.5 10.2,3.2 10.2,5 Z" opacity="0.9" />
        </g>
      </g>

      {/* NORTHWEST (315°): Dispatch Command Operator Pair */}
      <g transform="translate(94, 94)">
        <circle cx="0" cy="0" r="17" fill="#0C0D12" stroke="url(#compawss-gold)" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="15" stroke="#00F2FF" strokeWidth="0.5" strokeOpacity="0.4" />
        <g transform="translate(0, -1) scale(0.95)" fill="url(#compawss-gold-light)">
          {/* First Specialist */}
          <circle cx="-3" cy="-3.5" r="2.4" />
          <path d="M -7,4.2 C -7,1.8 -5,0.7 -1.5,0.7 C -0.5,0.7 -0.5,1.5 -1.5,4.2 Z" />
          {/* Second Specialist */}
          <circle cx="3" cy="-3" r="2.2" />
          <path d="M -1,4.2 C -0.5,1.8 1.5,0.9 4.5,0.9 C 7,0.9 8,1.8 8,4.2 Z" opacity="0.85" stroke="#0C0D12" strokeWidth="0.5" />
        </g>
      </g>

    </svg>
  );
};
