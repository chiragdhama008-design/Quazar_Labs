import React from 'react';

export interface PlanetVisualProps {
  theme?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  interactive?: boolean;
  showCoordinates?: boolean;
}

export const PlanetVisual: React.FC<PlanetVisualProps> = ({
  theme = 'purple-gas-giant',
  size = 'md',
  className = '',
  interactive = true,
  showCoordinates = false,
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96',
  };

  const getPlanetConfig = () => {
    switch (theme) {
      case 'blue-terrestrial':
        return {
          id: 'blue',
          name: 'PLANET C++',
          coords: 'RA 18h 44m // DEC +22°',
          baseGradient: ['#0284C7', '#0369A1', '#0C4A6E', '#082F49'],
          glowColor: '#38BDF8',
          accentColor: '#BAE6FD',
          hasRings: false,
          ringColor: '#38BDF8',
          inclination: '12.4°',
        };
      case 'cyber-ringed':
        return {
          id: 'cyber',
          name: 'CYBER ORBIT',
          coords: 'RA 21h 12m // DEC -16°',
          baseGradient: ['#10B981', '#059669', '#047857', '#022C22'],
          glowColor: '#34D399',
          accentColor: '#A7F3D0',
          hasRings: true,
          ringColor: '#10B981',
          inclination: '24.8°',
        };
      case 'nebula-red':
        return {
          id: 'red',
          name: 'AI GALAXY',
          coords: 'RA 05h 35m // DEC -05°',
          baseGradient: ['#F43F5E', '#E11D48', '#9F1239', '#4C0519'],
          glowColor: '#FB7185',
          accentColor: '#FECDD3',
          hasRings: false,
          ringColor: '#F43F5E',
          inclination: '08.1°',
        };
      case 'quantum-gold':
        return {
          id: 'gold',
          name: 'QUANTUM CORE',
          coords: 'RA 19h 50m // DEC +08°',
          baseGradient: ['#F59E0B', '#D97706', '#92400E', '#451A03'],
          glowColor: '#FBBF24',
          accentColor: '#FDE68A',
          hasRings: true,
          ringColor: '#F59E0B',
          inclination: '18.5°',
        };
      case 'cosmic-cyan':
        return {
          id: 'cyan',
          name: 'BINARY NEBULA',
          coords: 'RA 02h 19m // DEC +42°',
          baseGradient: ['#06B6D4', '#0891B2', '#0E7490', '#083344'],
          glowColor: '#22D3EE',
          accentColor: '#CFFAFE',
          hasRings: true,
          ringColor: '#22D3EE',
          inclination: '31.2°',
        };
      case 'purple-gas-giant':
      default:
        return {
          id: 'purple',
          name: 'QUAZAR PRIME',
          coords: 'RA 14h 29m // DEC -62°',
          baseGradient: ['#8B5CF6', '#7C3AED', '#5B21B6', '#1E1035'],
          glowColor: '#C084FC',
          accentColor: '#EDE9FE',
          hasRings: true,
          ringColor: '#8B5CF6',
          inclination: '26.7°',
        };
    }
  };

  const cfg = getPlanetConfig();

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className} ${
        interactive ? 'transition-transform duration-500 hover:scale-[1.03]' : ''
      }`}
    >
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full overflow-visible drop-shadow-2xl"
      >
        <defs>
          {/* Main sphere spherical shading */}
          <radialGradient id={`planet-body-${cfg.id}`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor={cfg.accentColor} stopOpacity="0.95" />
            <stop offset="25%" stopColor={cfg.baseGradient[0]} />
            <stop offset="60%" stopColor={cfg.baseGradient[1]} />
            <stop offset="85%" stopColor={cfg.baseGradient[2]} />
            <stop offset="100%" stopColor={cfg.baseGradient[3]} />
          </radialGradient>

          {/* Atmospheric Fresnel Rim Glow */}
          <radialGradient id={`atmo-rim-${cfg.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="78%" stopColor="transparent" />
            <stop offset="94%" stopColor={cfg.glowColor} stopOpacity="0.65" />
            <stop offset="100%" stopColor={cfg.accentColor} stopOpacity="0.1" />
          </radialGradient>

          {/* Nightside Terminator Shadow */}
          <radialGradient id={`terminator-${cfg.id}`} cx="78%" cy="75%" r="68%">
            <stop offset="0%" stopColor="#070B16" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#070B16" stopOpacity="0.7" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Atmospheric Gas Bands */}
          <linearGradient id={`gas-bands-${cfg.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cfg.baseGradient[0]} stopOpacity="0.3" />
            <stop offset="20%" stopColor={cfg.baseGradient[2]} stopOpacity="0.7" />
            <stop offset="35%" stopColor={cfg.accentColor} stopOpacity="0.5" />
            <stop offset="50%" stopColor={cfg.baseGradient[1]} stopOpacity="0.3" />
            <stop offset="65%" stopColor={cfg.baseGradient[3]} stopOpacity="0.8" />
            <stop offset="80%" stopColor={cfg.baseGradient[0]} stopOpacity="0.5" />
            <stop offset="100%" stopColor={cfg.baseGradient[2]} stopOpacity="0.6" />
          </linearGradient>

          {/* Planetary Ring Gradient */}
          <linearGradient id={`ring-gradient-${cfg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.accentColor} stopOpacity="0.9" />
            <stop offset="30%" stopColor={cfg.ringColor} stopOpacity="0.6" />
            <stop offset="55%" stopColor="transparent" stopOpacity="0.1" />
            <stop offset="70%" stopColor={cfg.ringColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={cfg.glowColor} stopOpacity="0.8" />
          </linearGradient>

          {/* Planet Shadow on Ring */}
          <linearGradient id={`ring-shadow-${cfg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="35%" stopColor="#070B16" stopOpacity="0.85" />
            <stop offset="65%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Back Half of Planetary Rings (Behind Planet Sphere) */}
        {cfg.hasRings && (
          <g transform="rotate(-22 120 120)">
            {/* Outer Ring Arc (Back) */}
            <ellipse
              cx="120"
              cy="120"
              rx="110"
              ry="32"
              fill="none"
              stroke={`url(#ring-gradient-${cfg.id})`}
              strokeWidth="9"
              opacity="0.8"
            />
            {/* Cassini Division Gap (Back) */}
            <ellipse
              cx="120"
              cy="120"
              rx="98"
              ry="28"
              fill="none"
              stroke="#070B16"
              strokeWidth="2.5"
            />
            {/* Inner Ring Arc (Back) */}
            <ellipse
              cx="120"
              cy="120"
              rx="90"
              ry="25"
              fill="none"
              stroke={cfg.glowColor}
              strokeWidth="4"
              opacity="0.45"
            />
          </g>
        )}

        {/* Subtle Ambient Outer Aura */}
        <circle
          cx="120"
          cy="120"
          r="76"
          fill={cfg.glowColor}
          opacity="0.12"
          className="blur-md pointer-events-none"
        />

        {/* Sphere Base Shading */}
        <circle
          cx="120"
          cy="120"
          r="68"
          fill={`url(#planet-body-${cfg.id})`}
        />

        {/* Surface Atmospheric Bands */}
        <circle
          cx="120"
          cy="120"
          r="68"
          fill={`url(#gas-bands-${cfg.id})`}
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* Nightside Terminator Shadow */}
        <circle
          cx="120"
          cy="120"
          r="68"
          fill={`url(#terminator-${cfg.id})`}
        />

        {/* Atmospheric Limb Rim Lighting */}
        <circle
          cx="120"
          cy="120"
          r="68"
          fill={`url(#atmo-rim-${cfg.id})`}
        />

        {/* Front Half of Planetary Rings (Overlapping Planet Sphere) */}
        {cfg.hasRings && (
          <g transform="rotate(-22 120 120)">
            {/* Front Ring Outer Arc */}
            <path
              d="M 10 120 A 110 32 0 0 0 230 120"
              fill="none"
              stroke={`url(#ring-gradient-${cfg.id})`}
              strokeWidth="9"
              opacity="0.95"
            />
            {/* Front Cassini Division */}
            <path
              d="M 22 120 A 98 28 0 0 0 218 120"
              fill="none"
              stroke="#070B16"
              strokeWidth="2.5"
            />
            {/* Front Ring Inner Arc */}
            <path
              d="M 30 120 A 90 25 0 0 0 210 120"
              fill="none"
              stroke={cfg.glowColor}
              strokeWidth="4"
              opacity="0.65"
            />
            {/* Cast Shadow of Planet on Front Rings */}
            <path
              d="M 80 120 A 40 15 0 0 0 160 120"
              fill="none"
              stroke="#070B16"
              strokeWidth="12"
              opacity="0.6"
            />
          </g>
        )}

        {/* Precision Telemetry Orbital Tracking Moonlet / Node */}
        <g className="animate-orbital pointer-events-none" style={{ transformOrigin: '120px 120px' }}>
          <circle cx="120" cy="28" r="3.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="120" cy="28" r="7" fill={cfg.glowColor} opacity="0.3" className="animate-pulse" />
        </g>
      </svg>

      {/* Optional Technical Telemetry Stamp */}
      {showCoordinates && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none">
          <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            {cfg.name} &bull; INC {cfg.inclination}
          </p>
          <p className="text-[9px] font-mono text-cosmic-cyan/70 tracking-wider">
            {cfg.coords}
          </p>
        </div>
      )}
    </div>
  );
};
