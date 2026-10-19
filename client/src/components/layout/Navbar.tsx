import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Menu, X, Volume2, VolumeX } from 'lucide-react';
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSound = () => {
    const nextState = soundManager.toggle();
    setSoundActive(nextState);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Missions', href: '/explore' },
    { label: 'About Station', href: '/#about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#050816]/80 backdrop-blur-md border-b border-white/10 shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <Link
            to="/"
            className="flex items-center gap-3 group select-none"
            onClick={() => soundManager.playTelemetryChirp(600, 0.05)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cosmic-card to-cosmic-dark border border-cosmic-cyan/30 flex items-center justify-center shadow-glow-cyan/50 group-hover:border-cosmic-cyan group-hover:scale-105 transition-all">
              <svg viewBox="0 0 100 100" className="w-6 h-6">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#8B5CF6" strokeWidth="6" strokeDasharray="10 5" />
                <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke="#22D3EE" strokeWidth="5" transform="rotate(-28 50 50)" />
                <circle cx="50" cy="50" r="16" fill="#22D3EE" />
                <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-space font-extrabold text-lg tracking-wider text-white group-hover:text-cosmic-cyan transition-colors">
                  QUAZAR
                </span>
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-cosmic-violet/20 border border-cosmic-violet/40 text-cosmic-violet">
                  LABS
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase hidden sm:block">
                Deep Space Academy
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive =
                link.href === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.href.replace('/#', ''));

              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'text-cosmic-cyan bg-cosmic-cyan/10 border border-cosmic-cyan/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => soundManager.playTelemetryChirp(700, 0.04)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs & Sound HUD */}
          <div className="hidden md:flex items-center gap-3">
            {/* Audio Ambience Synthesizer Toggle */}
            <button
              onClick={toggleSound}
              title={soundActive ? 'Mute ambient space sound' : 'Enable ambient space sound'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                soundActive
                  ? 'border-cosmic-cyan/40 bg-cosmic-cyan/15 text-cosmic-cyan shadow-glow-cyan/50'
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

            {/* Main Action CTA */}
            <Link
              to="/explore"
              onClick={() => soundManager.playTelemetryChirp(840, 0.08)}
              className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cosmic-violet via-purple-600 to-cosmic-cyan text-white text-sm font-space font-semibold shadow-glow-violet/50 hover:shadow-glow-cyan/80 hover:scale-[1.02] transition-all"
            >
              <Compass className="w-4 h-4 text-cosmic-cyan" />
              <span>Start Exploring</span>
              <Sparkles className="w-3.5 h-3.5 text-white/80" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-white"
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

      {/* Mobile Animated Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-3 pb-6 mt-3 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.label}
                to={link.href}
                className="px-4 py-3 rounded-lg text-base font-medium text-slate-200 hover:text-cosmic-cyan hover:bg-white/5 border border-transparent hover:border-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2">
            <Link
              to="/explore"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-cosmic-violet to-cosmic-cyan text-white font-space font-semibold"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Missions</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
