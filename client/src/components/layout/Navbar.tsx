import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X, Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';
import { soundManager } from '../space/SoundManager';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundActive, setSoundActive] = useState(soundManager.getStatus());
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSound = () => {
    const nextState = soundManager.toggle();
    setSoundActive(nextState);
  };

  const navLinks = [
    { label: 'Overview', href: '/' },
    { label: 'Missions & Catalog', href: '/explore' },
    { label: 'Flight Plan', href: '/#journey' },
    { label: 'Mission Control', href: '/#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#070B16]/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Telemetry Indicator */}
          <Link
            to="/"
            className="flex items-center gap-3.5 group select-none"
            onClick={() => soundManager.playTelemetryChirp(600, 0.04)}
          >
            <div className="w-10 h-10 rounded-xl bg-[#0D1424] border border-cosmic-cyan/30 flex items-center justify-center shadow-glow-cyan/40 group-hover:border-cosmic-cyan transition-all">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8B5CF6" strokeWidth="5" strokeDasharray="10 5" />
                <ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="#22D3EE" strokeWidth="4" transform="rotate(-28 50 50)" />
                <circle cx="50" cy="50" r="14" fill="#0D1424" stroke="#22D3EE" strokeWidth="2" />
                <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-space font-extrabold text-lg tracking-wider text-white group-hover:text-cosmic-cyan transition-colors">
                  QUAZAR
                </span>
                <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-cosmic-cyan/15 border border-cosmic-cyan/30 text-cosmic-cyan">
                  LABS
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
                Deep Space Technology Academy
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 glass-panel px-3 py-1.5 rounded-xl border border-white/5">
            {navLinks.map(link => {
              const isAnchor = link.href.includes('#');
              const isActive =
                !isAnchor &&
                (link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href));

              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                    isActive
                      ? 'text-cosmic-cyan bg-cosmic-cyan/15 border border-cosmic-cyan/30 font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => soundManager.playTelemetryChirp(700, 0.03)}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Action CTAs & Sound Synthesizer */}
          <div className="hidden md:flex items-center gap-3">
            {/* Ambient Synthesizer Audio Toggle */}
            <button
              onClick={toggleSound}
              title={soundActive ? 'Mute ambient mission audio' : 'Enable ambient mission audio'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                soundActive
                  ? 'border-cosmic-cyan/40 bg-cosmic-cyan/15 text-cosmic-cyan shadow-glow-cyan'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {soundActive ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cosmic-cyan animate-pulse" />
                  <span>AUDIO ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>AUDIO OFF</span>
                </>
              )}
            </button>

            {/* Launch Missions Action */}
            <Link
              to="/explore"
              onClick={() => soundManager.playTelemetryChirp(840, 0.06)}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cosmic-violet via-purple-600 to-cosmic-cyan text-white text-xs font-space font-bold tracking-wide shadow-glow-cyan hover:opacity-95 active:scale-[0.98] transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-cosmic-cyan" />
              <span>Explore Missions</span>
              <Sparkles className="w-3 h-3 text-white/90" />
            </Link>
          </div>

          {/* Mobile Navigation Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white"
              aria-label="Toggle ambient audio"
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-cosmic-cyan" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:border-cosmic-cyan/40"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-5 pt-4 pb-6 mt-3 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-cosmic-cyan animate-pulse" />
              <span>MISSION NAVIGATION</span>
            </span>
            <span className="text-cosmic-cyan">SECTOR 0x7F</span>
          </div>

          <nav className="flex flex-col space-y-2">
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-3 rounded-xl text-sm font-space font-semibold text-slate-200 hover:text-cosmic-cyan hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-2">
            <Link
              to="/explore"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-cyan text-white font-space font-bold text-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Learning Missions</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
