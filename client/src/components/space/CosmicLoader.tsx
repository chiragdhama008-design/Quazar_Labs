import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from './SoundManager';

interface CosmicLoaderProps {
  onComplete: () => void;
}

export const CosmicLoader: React.FC<CosmicLoaderProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [telemetryText, setTelemetryText] = useState('ALIGNING DEEP SPACE SENSORS...');

  useEffect(() => {
    // Stage 1 -> 2: Ignition
    const t1 = setTimeout(() => {
      setStage(2);
      setTelemetryText('IGNITING QUAZAR CORE...');
      soundManager.playTelemetryChirp(520, 0.08);
    }, 700);

    // Stage 2 -> 3: Warp Drive
    const t2 = setTimeout(() => {
      setStage(3);
      setTelemetryText('ENGAGING HYPERSPACE DRIVE...');
      soundManager.playTelemetryChirp(780, 0.12);
    }, 1500);

    // Stage 3 -> 4: Universe Revealed
    const t3 = setTimeout(() => {
      setStage(4);
      setTelemetryText('ORBIT ACHIEVED. ENTERING QUAZAR LABS.');
      soundManager.playTelemetryChirp(1040, 0.15);
    }, 2200);

    // Complete
    const t4 = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050816] overflow-hidden select-none"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background radial cosmic glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.15)_0%,_rgba(5,8,22,1)_70%)] pointer-events-none" />

      {/* Stage Visuals */}
      <div className="relative flex flex-col items-center justify-center">
        {/* Stage 1: The Void & Pulsing Star Seeds */}
        {stage >= 1 && (
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            className="absolute w-96 h-96 rounded-full border border-cosmic-cyan/10 animate-ping"
            style={{ animationDuration: '3s' }}
          />
        )}

        {/* Stage 2: Quazar Ignition Rings */}
        {stage >= 2 && (
          <>
            <motion.div
              initial={{ scale: 0, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 180, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-64 h-64 rounded-full border-2 border-dashed border-cosmic-cyan/40"
            />
            <motion.div
              initial={{ scale: 0, rotate: 45, opacity: 0 }}
              animate={{ scale: 1.2, rotate: -180, opacity: 0.6 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute w-72 h-72 rounded-full border border-cosmic-violet/50"
            />
          </>
        )}

        {/* Center Quazar Monogram / Core Emblem */}
        <motion.div
          animate={
            stage === 3
              ? { scale: [1, 1.4, 0.9], rotate: [0, 90, 180] }
              : stage === 4
              ? { scale: 1.1, filter: 'drop-shadow(0 0 30px rgba(34, 211, 238, 0.8))' }
              : { scale: [0.95, 1.05, 0.95] }
          }
          transition={{ duration: 0.7, repeat: stage === 1 ? Infinity : 0 }}
          className="relative z-10 w-24 h-24 flex items-center justify-center rounded-2xl bg-[#0A1024]/80 border border-cosmic-cyan/40 shadow-glow-cyan backdrop-blur-xl"
        >
          <svg viewBox="0 0 100 100" className="w-16 h-16">
            {/* Outer Orbit Path */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              className="animate-spin-slow"
              style={{ transformOrigin: '50px 50px' }}
            />
            {/* Tilted Ring */}
            <ellipse
              cx="50"
              cy="50"
              rx="40"
              ry="14"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2"
              transform="rotate(-28 50 50)"
            />
            {/* Core Q / Quazar Emblem */}
            <circle cx="50" cy="50" r="16" fill="url(#core-grad)" />
            <circle cx="50" cy="50" r="7" fill="#FFFFFF" opacity="0.9" />
            <defs>
              <linearGradient id="core-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22D3EE" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Brand Title Stagger */}
        <div className="mt-8 text-center z-10">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-space font-bold tracking-widest text-white uppercase"
          >
            QUAZAR <span className="text-cosmic-cyan font-mono">LABS</span>
          </motion.h1>

          {/* Telemetry Stage Log */}
          <div className="mt-3 flex items-center justify-center gap-2 font-mono text-xs text-cosmic-cyan/80">
            <span className="w-2 h-2 rounded-full bg-cosmic-cyan animate-ping" />
            <span className="tracking-wider">{telemetryText}</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-56 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-cosmic-violet via-cosmic-cyan to-white"
              initial={{ width: '0%' }}
              animate={{ width: stage === 1 ? '25%' : stage === 2 ? '55%' : stage === 3 ? '85%' : '100%' }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* Polite Skip Button */}
      <button
        onClick={onComplete}
        className="absolute bottom-8 px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono text-slate-400 hover:text-white hover:border-cosmic-cyan/40 transition-colors z-20"
      >
        [ SKIP SEQUENCE ]
      </button>
    </motion.div>
  );
};
