import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Rocket,
  Shield,
  Cpu,
  Binary,
  Layers,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Activity,
  Code2,
  BookOpen,
  Radio,
} from 'lucide-react';
import { PlanetVisual } from '../components/space/PlanetVisual';
import { soundManager } from '../components/space/SoundManager';
import { api } from '../services/api';
import { LearningPath, Workshop, SiteSetting } from '../types';

export const HomePage: React.FC = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [featuredWorkshops, setFeaturedWorkshops] = useState<Workshop[]>([]);
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCheckpoint, setActiveCheckpoint] = useState<number>(1);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [pathsData, workshopsData, settingsData] = await Promise.all([
          api.getLearningPaths(),
          api.getWorkshops({ sort: 'recent' }),
          api.getSiteSettings(),
        ]);
        setPaths(pathsData);
        setFeaturedWorkshops(workshopsData.slice(0, 4));
        setSettings(settingsData);
      } catch (err) {
        console.error('Failed to load homepage telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const journeyCheckpoints = [
    {
      step: 1,
      title: 'Orbital Ignition: Systems & Architecture',
      subtitle: 'From Bare Metal to Low-Level Mastery',
      description: 'Master pointer mechanics, memory layout, cache behavior, and compiled systems code in Planet C++.',
      icon: Terminal,
      color: '#38BDF8',
      link: '/paths/planet-cpp',
      topics: ['Memory Allocation', 'Pointer Arithmetic', 'Cache Coherence', 'Modern C++20'],
    },
    {
      step: 2,
      title: 'Cosmic Navigation: Algorithmic Routing',
      subtitle: 'Complexity Optimization Across the Stars',
      description: 'Navigate graph traversals, asymptotic efficiency, divide-and-conquer, and dynamic programming.',
      icon: Binary,
      color: '#8B5CF6',
      link: '/paths/binary-nebula',
      topics: ['Graph Theory', 'Dynamic Programming', 'NP-Completeness', 'Asymptotic Proofs'],
    },
    {
      step: 3,
      title: 'Shield Array: Defensive Cyber Orbit',
      subtitle: 'Vulnerability Analysis & Packet Telemetry',
      description: 'Audit network packets, identify threat vectors, conduct binary analysis, and harden mission systems.',
      icon: Shield,
      color: '#10B981',
      link: '/paths/cyber-orbit',
      topics: ['Packet Telemetry', 'Binary Exploitation', 'Cryptographic Handshakes', 'Defensive Hardening'],
    },
    {
      step: 4,
      title: 'Deep Frontier: Autonomous AI Intelligence',
      subtitle: 'Neural Networks & Transformers',
      description: 'Design generative systems, attention mechanics, latent space embeddings, and interplanetary autonomous models.',
      icon: Cpu,
      color: '#F43F5E',
      link: '/paths/ai-galaxy',
      topics: ['Self-Attention Mechanics', 'Backpropagation', 'Latent Vectors', 'LLM Deployment'],
    },
  ];

  return (
    <div className="relative z-10 overflow-hidden">
      {/* ========================================================
          HERO SECTION: ASYMMETRICAL ART-DIRECTED EXPEDITION
      ======================================================== */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle radial cosmic backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] lg:w-[1100px] h-[800px] lg:h-[1100px] bg-[radial-gradient(circle,_rgba(124,58,237,0.12)_0%,_rgba(6,182,212,0.06)_35%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Hero Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Mission Telemetry Indicator */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-hud text-xs font-mono text-cosmic-cyan"
            >
              <Activity className="w-3.5 h-3.5 animate-pulse text-cosmic-cyan" />
              <span className="tracking-widest uppercase">QUAZAR LABS // LEARNING BEYOND LIMITS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-space font-extrabold tracking-tight leading-[1.06] text-white"
            >
              {settings?.heroHeading || 'A universe of skills. A frontier of possibilities.'}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              {settings?.heroSubtitle ||
                'Explore coding, discover new technologies, and turn curiosity into things you can build.'}
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/explore"
                onClick={() => soundManager.playTelemetryChirp(720, 0.06)}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cosmic-violet via-purple-600 to-cosmic-cyan text-white font-space font-bold text-sm sm:text-base shadow-glow-cyan hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <Compass className="w-5 h-5 text-cosmic-cyan group-hover:rotate-45 transition-transform" />
                <span>Explore learning paths</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#about"
                onClick={() => soundManager.playTelemetryChirp(600, 0.04)}
                className="w-full sm:w-auto px-7 py-4 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-cosmic-cyan/40 font-space font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2"
              >
                <Layers className="w-4 h-4 text-cosmic-cyan" />
                <span>Discover our approach</span>
              </a>
            </motion.div>

            {/* Real-time Telemetry Status Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/5 text-left"
            >
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] font-mono text-slate-400 uppercase">FRONTIERS</p>
                <p className="text-sm font-space font-bold text-white">5 Planetary Zones</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] font-mono text-slate-400 uppercase">ACCESS MODEL</p>
                <p className="text-sm font-space font-bold text-cosmic-cyan">100% Open Access</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] font-mono text-slate-400 uppercase">CURRICULUM</p>
                <p className="text-sm font-space font-bold text-white">Week-Wise Rigor</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                <p className="text-[10px] font-mono text-slate-400 uppercase">BROADCASTS</p>
                <p className="text-sm font-space font-bold text-cosmic-violet">YouTube Transmissions</p>
              </div>
            </motion.div>
          </div>

          {/* Hero Visual: Celestial Centerpiece (5 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative select-none"
          >
            <div className="relative">
              {/* Fine orbital trajectory ring */}
              <div className="absolute -inset-10 rounded-full border border-dashed border-cosmic-cyan/25 animate-spin-slow pointer-events-none" />
              <div className="absolute -inset-20 rounded-full border border-cosmic-violet/15 pointer-events-none" />

              {/* Central Majestic Planet */}
              <PlanetVisual theme="purple-gas-giant" size="xl" showCoordinates={true} />

              {/* Satellite Telemetry Card */}
              <div className="absolute -bottom-6 -left-4 sm:bottom-2 sm:-left-6 glass-hud px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-lg pointer-events-none">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <p className="text-[9px] font-mono text-slate-400 uppercase">TARGET DESTINATION</p>
                  <p className="text-xs font-mono font-bold text-white">SECTOR 0x7F &bull; C++ CORE</p>
                </div>
              </div>

              {/* Status Indicator Pill */}
              <div className="absolute -top-4 -right-2 sm:top-2 sm:right-0 glass-hud px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-lg pointer-events-none">
                <Rocket className="w-3.5 h-3.5 text-cosmic-cyan" />
                <span className="text-xs font-mono text-cosmic-cyan font-bold">ALL SYSTEMS LIVE</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          MISSION DISCOVERY: PLANETARY DESTINATIONS
      ======================================================== */}
      <section id="missions" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-cyan/10 border border-cosmic-cyan/30 text-cosmic-cyan font-mono text-xs uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLORATION ZONES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
              Planetary Learning Destinations
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Every technology domain is a distinct planetary frontier. Select an exploration zone to begin your mission.
            </p>
          </div>

          {/* Grid of Learning Paths */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-72 rounded-2xl glass-panel animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paths.map(path => (
                <Link
                  key={path.id}
                  to={`/paths/${path.slug}`}
                  onClick={() => soundManager.playTelemetryChirp(680, 0.04)}
                  className="group relative rounded-2xl glass-card p-6 flex flex-col justify-between overflow-hidden border border-white/5 hover:border-cosmic-cyan/40 transition-all duration-300"
                >
                  {/* Subtle Accent Glow */}
                  <div
                    className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none"
                    style={{ backgroundColor: path.accentColor }}
                  />

                  {/* Top: Planet Art & Badge */}
                  <div className="flex items-start justify-between">
                    <PlanetVisual theme={path.planetTheme} size="sm" />
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 group-hover:text-cosmic-cyan group-hover:border-cosmic-cyan/30 transition-colors">
                      {path.workshopCount || 0} {path.workshopCount === 1 ? 'Workshop' : 'Workshops'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="my-6 space-y-2">
                    <h3 className="text-xl font-space font-bold text-white group-hover:text-cosmic-cyan transition-colors">
                      {path.title}
                    </h3>
                    <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                      {path.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-cosmic-cyan">
                    <span className="tracking-wider">ENTER FRONTIER</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          FEATURED WORKSHOPS: WEEK-WISE MISSIONS
      ======================================================== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#0D1424]/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="font-mono text-xs text-cosmic-violet tracking-widest uppercase flex items-center gap-1.5">
                <Rocket className="w-3.5 h-3.5 text-cosmic-violet" />
                <span>CURRICULUM ROSTER</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-space font-bold text-white tracking-tight">
                Featured Space Workshops
              </h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Structured into week-by-week lessons with recorded YouTube deep-dives, source repositories, and lesson notes.
              </p>
            </div>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 text-sm font-space font-semibold text-cosmic-cyan hover:underline"
            >
              <span>View All Workshops</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredWorkshops.map(workshop => (
              <Link
                key={workshop.id}
                to={`/workshops/${workshop.slug}`}
                onClick={() => soundManager.playTelemetryChirp(700, 0.04)}
                className="group glass-card rounded-2xl p-6 border border-white/5 hover:border-cosmic-cyan/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="text-xs font-mono px-2.5 py-1 rounded bg-cosmic-cyan/10 border border-cosmic-cyan/30 text-cosmic-cyan">
                      {workshop.difficulty}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {workshop.estimatedDuration || '4 Weeks'}
                    </span>
                  </div>

                  <h3 className="text-xl font-space font-bold text-white group-hover:text-cosmic-cyan transition-colors mb-2">
                    {workshop.title}
                  </h3>
                  <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                    {workshop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-cosmic-violet font-semibold">
                    {workshop.learningPath?.title || 'Quazar Path'}
                  </span>
                  <span className="flex items-center gap-1 text-cosmic-cyan group-hover:translate-x-1 transition-transform">
                    <span>Launch Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          INTERACTIVE LEARNING JOURNEY: ORBITAL CHECKPOINTS
      ======================================================== */}
      <section id="journey" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="font-mono text-xs text-cosmic-cyan tracking-widest uppercase">
              MISSION FLIGHT PLAN
            </span>
            <h2 className="text-3xl sm:text-5xl font-space font-bold text-white tracking-tight">
              The Orbital Learning Journey
            </h2>
            <p className="text-slate-300 text-base">
              A progressive expedition taking engineers from ground-zero computer fundamentals to deep-galaxy breakthroughs.
            </p>
          </div>

          {/* Interactive Checkpoint Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Step Selection List (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {journeyCheckpoints.map(cp => {
                const isSelected = activeCheckpoint === cp.step;
                const Icon = cp.icon;
                return (
                  <button
                    key={cp.step}
                    onClick={() => {
                      setActiveCheckpoint(cp.step);
                      soundManager.playTelemetryChirp(600 + cp.step * 60, 0.04);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      isSelected
                        ? 'glass-hud border-cosmic-cyan/60 shadow-glow-cyan scale-[1.02]'
                        : 'glass-card border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0"
                      style={{
                        backgroundColor: `${cp.color}20`,
                        color: cp.color,
                        border: `1px solid ${cp.color}50`,
                      }}
                    >
                      0{cp.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-slate-400 uppercase truncate">{cp.subtitle}</p>
                      <p className="text-sm font-space font-bold text-white truncate">{cp.title}</p>
                    </div>
                    <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Checkpoint Detail Card (7 cols) */}
            <div className="lg:col-span-7">
              {(() => {
                const current = journeyCheckpoints.find(c => c.step === activeCheckpoint) || journeyCheckpoints[0];
                const Icon = current.icon;
                return (
                  <motion.div
                    key={current.step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35 }}
                    className="glass-card rounded-2xl p-8 border border-cosmic-cyan/30 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                      style={{ backgroundColor: current.color }}
                    />

                    <div className="flex items-center gap-3 text-xs font-mono mb-4 text-cosmic-cyan">
                      <span className="w-2 h-2 rounded-full bg-cosmic-cyan animate-pulse" />
                      <span>CHECKPOINT 0{current.step} ACTIVE TELEMETRY</span>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${current.color}20`, color: current.color }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-space font-bold text-white">{current.title}</h3>
                        <p className="text-xs font-mono text-slate-400">{current.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-base text-slate-300 leading-relaxed mb-6">
                      {current.description}
                    </p>

                    {/* Key Core Topics Covered */}
                    <div className="mb-6 space-y-2">
                      <p className="text-xs font-mono text-slate-400 uppercase">Core Expedition Competencies:</p>
                      <div className="flex flex-wrap gap-2">
                        {current.topics.map((t, i) => (
                          <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <Link
                        to={current.link}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-space font-semibold text-sm border border-white/10 transition-colors"
                      >
                        <span>Begin This Mission Stage</span>
                        <ArrowRight className="w-4 h-4 text-cosmic-cyan" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ABOUT QUAZAR LABS: MISSION CONTROL STATION
      ======================================================== */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 bg-[#0D1424]/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <span className="font-mono text-xs text-cosmic-cyan tracking-widest uppercase flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cosmic-cyan" />
              <span>THE QUAZAR ETHOS</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-space font-bold text-white leading-tight">
              Engineering Built for the Cosmic Frontier
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              {settings?.aboutText ||
                'Quazar Labs is an immersive technology education venture crafting hands-on coding sessions, systems workshops, and deep-space software engineering missions for students worldwide.'}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Authentic Architecture:</strong> Real compilation pipelines, actual memory allocators, and production deployments.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cosmic-cyan shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Structured Rigor:</strong> Comprehensive weekly curricula with clear session objectives and downloadable resources.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-cosmic-violet shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">
                  <strong className="text-white">Open Frontier:</strong> Publicly accessible curriculum without intrusive login barriers or paywalls for learners.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="glass-hud rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 font-mono text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span>STATION_LOG_0x82.sys</span>
              </div>

              <div className="font-mono text-xs sm:text-sm text-slate-300 space-y-3 leading-relaxed">
                <p className="text-cosmic-cyan">$ quazar-telemetry --status</p>
                <p className="text-slate-400">[INIT] Deep space sensor array online.</p>
                <p className="text-slate-400">[CORE] Hands-on coding modules verified: C++, DSA, Cyber, AI.</p>
                <p className="text-emerald-400">[SUCCESS] Mission readiness: 100%. All systems nominal.</p>
                <p className="text-slate-400 pt-2 border-t border-white/5">
                  &gt; &quot;Explore the universe. Unlock knowledge. Build the future.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FINAL CTA: APPROACHING THE QUAZAR
      ======================================================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-10 sm:p-16 border border-cosmic-cyan/30 relative overflow-hidden shadow-glow-cyan">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-cyan/15 border border-cosmic-cyan/30 text-cosmic-cyan font-mono text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE EXPEDITION CONTINUES</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-space font-extrabold text-white">
              Ready to Chart Your Course?
            </h2>

            <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
              Step into the Quazar Labs learning ecosystem. Choose your planetary path and write code that reaches beyond orbit.
            </p>

            <div className="pt-4">
              <Link
                to="/explore"
                onClick={() => soundManager.playTelemetryChirp(880, 0.08)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cosmic-violet via-purple-600 to-cosmic-cyan text-white font-space font-bold text-base sm:text-lg shadow-glow-cyan hover:opacity-95 active:scale-[0.98] transition-all"
              >
                <Compass className="w-5 h-5 text-cosmic-cyan" />
                <span>Launch Your Learning Mission</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
