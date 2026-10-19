import React from 'react';

interface PlanetVisualProps {
  theme?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  interactive?: boolean;
}

export const PlanetVisual: React.FC<PlanetVisualProps> = ({
  theme = 'purple-gas-giant',
  size = 'md',
  className = '',
  interactive = true,
}) => {
  const sizeMap = {
    sm: 'w-16 h-16',
    md: 'w-28 h-28',
    lg: 'w-44 h-44',
    xl: 'w-64 h-64 md:w-80 md:h-80',
  };

  const getPlanetConfig = () => {
    switch (theme) {
      case 'blue-terrestrial':
        return {
          id: 'blue',
          baseGradient: ['#0369A1', '#0C4A6E', '#0284C7', '#082F49'],
          glowColor: '#38BDF8',
          accentColor: '#7DD3FC',
          hasRings: false,
          hasAtmosphere: true,
          surfacePattern: 'earth',
        };
      case 'cyber-ringed':
        return {
          id: 'cyber',
          baseGradient: ['#047857', '#064E3B', '#10B981', '#022C22'],
          glowColor: '#10B981',
          accentColor: '#34D399',
          hasRings: true,
          hasAtmosphere: true,
          surfacePattern: 'cyber',
        };
      case 'nebula-red':
        return {
          id: 'red',
          baseGradient: ['#BE123C', '#881337', '#F43F5E', '#4C0519'],
          glowColor: '#F43F5E',
          accentColor: '#FDA4AF',
          hasRings: false,
          hasAtmosphere: true,
          surfacePattern: 'flare',
        };
      case 'cosmic-cyan':
        return {
          id: 'cyan',
          baseGradient: ['#0E7490', '#164E63', '#06B6D4', '#083344'],
          glowColor: '#22D3EE',
          accentColor: '#67E8F9',
          hasRings: true,
          hasAtmosphere: true,
          surfacePattern: 'ice',
        };
      case 'quantum-gold':
        return {
          id: 'gold',
          baseGradient: ['#B45309', '#78350F', '#F59E0B', '#451A03'],
          glowColor: '#F59E0B',
          accentColor: '#FDE68A',
          hasRings: true,
          hasAtmosphere: true,
          surfacePattern: 'pulsar',
        };
      case 'purple-gas-giant':
      default:
        return {
          id: 'purple',
          baseGradient: ['#6D28D9', '#4C1D95', '#8B5CF6', '#2E1065'],
          glowColor: '#8B5CF6',
          accentColor: '#C4B5FD',
          hasRings: true,
          hasAtmosphere: true,
          surfacePattern: 'jupiter',
        };
    }
  };

  const cfg = getPlanetConfig();

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeMap[size]} ${className} ${
        interactive ? 'transition-transform duration-500 hover:scale-105' : ''
      }`}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full overflow-visible drop-shadow-2xl"
      >
        <defs>
          {/* Main sphere gradient */}
          <radialGradient id={`planet-grad-${cfg.id}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor={cfg.accentColor} />
            <stop offset="40%" stopColor={cfg.baseGradient[0]} />
            <stop offset="85%" stopColor={cfg.baseGradient[1]} />
            <stop offset="100%" stopColor={cfg.baseGradient[3]} />
          </radialGradient>

          {/* Atmospheric rim glow */}
          <radialGradient id={`atmo-glow-${cfg.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="transparent" />
            <stop offset="95%" stopColor={cfg.glowColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={cfg.glowColor} stopOpacity="0" />
          </radialGradient>

          {/* Gas Giant Bands Mask / Pattern */}
          <linearGradient id={`bands-${cfg.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={cfg.baseGradient[0]} stopOpacity="0.4" />
            <stop offset="25%" stopColor={cfg.baseGradient[2]} stopOpacity="0.8" />
            <stop offset="50%" stopColor={cfg.baseGradient[1]} stopOpacity="0.5" />
            <stop offset="75%" stopColor={cfg.accentColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={cfg.baseGradient[3]} stopOpacity="0.9" />
          </linearGradient>

          {/* Shadow Overlay */}
          <radialGradient id={`shadow-${cfg.id}`} cx="80%" cy="80%" r="65%">
            <stop offset="0%" stopColor="#050816" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#050816" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Ring Gradient */}
          <linearGradient id={`ring-grad-${cfg.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.accentColor} stopOpacity="0.85" />
            <stop offset="45%" stopColor={cfg.glowColor} stopOpacity="0.6" />
            <stop offset="70%" stopColor="transparent" />
            <stop offset="100%" stopColor={cfg.glowColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Back of Rings (if present) */}
        {cfg.hasRings && (
          <g transform="rotate(-25 100 100)">
            <ellipse
              cx="100"
              cy="100"
              rx="92"
              ry="26"
              fill="none"
              stroke={`url(#ring-grad-${cfg.id})`}
              strokeWidth="10"
              strokeDasharray="4 2"
              opacity="0.75"
              className="animate-spin-slow"
            />
            <ellipse
              cx="100"
              cy="100"
              rx="82"
              ry="22"
              fill="none"
              stroke={cfg.glowColor}
              strokeWidth="2"
              opacity="0.5"
            />
          </g>
        )}

        {/* Ambient Outer Halo */}
        <circle
          cx="100"
          cy="100"
          r="68"
          fill={cfg.glowColor}
          opacity="0.15"
          className="blur-md animate-pulse-slow"
        />

        {/* Planet Core Sphere */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill={`url(#planet-grad-${cfg.id})`}
        />

        {/* Surface texture bands */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill={`url(#bands-${cfg.id})`}
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* Planet Nightside Shadow */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill={`url(#shadow-${cfg.id})`}
        />

        {/* Atmosphere Rim Highlight */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill={`url(#atmo-glow-${cfg.id})`}
        />

        {/* Front of Rings (overlapping front of planet) */}
        {cfg.hasRings && (
          <g transform="rotate(-25 100 100)">
            <path
              d="M 8 100 A 92 26 0 0 0 192 100"
              fill="none"
              stroke={`url(#ring-grad-${cfg.id})`}
              strokeWidth="10"
              strokeDasharray="4 2"
              opacity="0.9"
            />
            <path
              d="M 18 100 A 82 22 0 0 0 182 100"
              fill="none"
              stroke={cfg.glowColor}
              strokeWidth="2"
              opacity="0.7"
            />
          </g>
        )}

        {/* Tiny orbiting satellite / moonlet */}
        <g className="animate-orbital" style={{ transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="22" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="100" cy="22" r="6" fill={cfg.glowColor} opacity="0.4" className="animate-ping" />
        </g>
      </svg>
    </div>
  );
};
