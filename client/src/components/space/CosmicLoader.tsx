import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { soundManager } from './SoundManager';

interface CosmicLoaderProps {
  onComplete: () => void;
}

export const CosmicLoader: React.FC<CosmicLoaderProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [telemetryText, setTelemetryText] = useState('INITIALIZING DEEP-SPACE SENSORS');

  useEffect(() => {
    // If user prefers reduced motion or has already booted in this session, skip intro immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasBooted = sessionStorage.getItem('quazar_initial_boot');

    if (prefersReducedMotion || hasBooted) {
      onComplete();
      return;
    }

    // Stage 1 -> 2: Ignition (at 400ms)
    const t1 = setTimeout(() => {
      setStage(2);
      setTelemetryText('CALIBRATING ORBITAL TELEMETRY');
      soundManager.playTelemetryChirp(620, 0.05);
    }, 450);

    // Stage 2 -> 3: Orbit Nominal (at 900ms)
    const t2 = setTimeout(() => {
      setStage(3);
      setTelemetryText('ORBIT NOMINAL. ENTERING QUAZAR LABS');
      soundManager.playTelemetryChirp(920, 0.08);
    }, 900);

    // Complete (at 1250ms)
    const t3 = setTimeout(() => {
      sessionStorage.setItem('quazar_initial_boot', 'true');
      onComplete();
    }, 1250);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        sessionStorage.setItem('quazar_initial_boot', 'true');
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070B16] overflow-hidden select-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Subtle radial ambient atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.12)_0%,_rgba(7,11,22,1)_70%)] pointer-events-none" />

      {/* Center Monogram & Orbiting Ring */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Fine orbital ring */}
        <div className="absolute w-48 h-48 rounded-full border border-cosmic-cyan/20 animate-spin-slow pointer-events-none" />
        <div className="absolute w-64 h-64 rounded-full border border-dashed border-white/5 pointer-events-none" />

        {/* Core Quazar Monogram Emblem */}
        <motion.div
          animate={stage === 3 ? { scale: 1.05 } : { scale: [0.98, 1.02, 0.98] }}
          transition={{ duration: 0.8, repeat: stage < 3 ? Infinity : 0, ease: 'easeInOut' }}
          className="relative z-10 w-20 h-20 flex items-center justify-center rounded-2xl bg-[#0D1424] border border-cosmic-cyan/30 shadow-glow-cyan"
        >
          <svg viewBox="0 0 100 100" className="w-12 h-12">
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeDasharray="8 4"
            />
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="15"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2.2"
              transform="rotate(-28 50 50)"
            />
            <circle cx="50" cy="50" r="14" fill="#0D1424" stroke="#22D3EE" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
          </svg>
        </motion.div>

        {/* Brand Label */}
        <div className="mt-6 text-center z-10">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl font-space font-extrabold tracking-[0.2em] text-white">
              QUAZAR
            </span>
            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-cosmic-cyan/15 border border-cosmic-cyan/40 text-cosmic-cyan font-semibold">
              LABS
            </span>
          </div>

          {/* Telemetry Stage Message */}
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan animate-pulse" />
            <span className="tracking-wider text-[11px] uppercase">{telemetryText}</span>
          </div>

          {/* Fine Progress Bar */}
          <div className="mt-3 w-44 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-cosmic-violet via-cosmic-cyan to-white"
              initial={{ width: '10%' }}
              animate={{ width: stage === 1 ? '35%' : stage === 2 ? '75%' : '100%' }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Quick Skip Prompt */}
        <button
          onClick={() => {
            sessionStorage.setItem('quazar_initial_boot', 'true');
            onComplete();
          }}
          className="mt-6 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors tracking-widest uppercase cursor-pointer"
        >
          [Press Esc or Tap to Skip]
        </button>
      </div>
    </motion.div>
  );
};
