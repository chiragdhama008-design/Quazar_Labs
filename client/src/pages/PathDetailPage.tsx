import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, CheckCircle, ArrowRight, Layers, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { LearningPath } from '../types';
import { PlanetVisual } from '../components/space/PlanetVisual';
import { soundManager } from '../components/space/SoundManager';

export const PathDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPath() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await api.getLearningPath(slug);
        setPath(data);
      } catch (err: any) {
        setError(err.message || 'Learning path not found.');
      } finally {
        setLoading(false);
      }
    }
    loadPath();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <PlanetVisual theme="purple-gas-giant" size="md" />
        <p className="font-mono text-sm text-cosmic-cyan animate-pulse">Acquiring Planetary Orbit...</p>
      </div>
    );
  }

  if (error || !path) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-space font-bold text-white mb-2">Planetary Coordinates Not Found</h2>
        <p className="text-slate-400 mb-6">{error || 'This learning path does not exist or has been decommissioned.'}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cosmic-cyan/15 text-cosmic-cyan border border-cosmic-cyan/30 text-sm font-space"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Explore Missions</span>
        </Link>
      </div>
    );
  }

  // Parse learning objectives if split by semicolon or newline
  const objectives = path.learningObjectives
    ? path.learningObjectives
        .split(/;|\n/)
        .map(o => o.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">Orbit</Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-white transition-colors">Missions</Link>
        <span>/</span>
        <span className="text-cosmic-cyan">{path.title.split(':')[0]}</span>
      </div>

      {/* Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: path.accentColor }}
        />

        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <Compass className="w-3.5 h-3.5 text-cosmic-cyan" />
            <span>PRIMARY EXPLORATION ZONE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-space font-extrabold text-white leading-tight">
            {path.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {path.description}
          </p>

          {objectives.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="font-space text-xs font-semibold uppercase tracking-wider text-slate-400">
                Core Mission Objectives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 flex items-center justify-center">
          <PlanetVisual theme={path.planetTheme} size="lg" />
        </div>
      </div>

      {/* Associated Workshops */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-space font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cosmic-cyan" />
            <span>Associated Workshops ({path.workshops?.length || 0})</span>
          </h2>
        </div>

        {!path.workshops || path.workshops.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
            No published workshops are currently scheduled under this planetary zone.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {path.workshops.map(workshop => (
              <Link
                key={workshop.id}
                to={`/workshops/${workshop.slug}`}
                onClick={() => soundManager.playTelemetryChirp(700, 0.05)}
                className="group glass-card rounded-2xl p-6 border border-white/5 hover:border-cosmic-cyan/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
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

                  <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {workshop.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-cosmic-cyan">
                  <span>Enter Workshop Curriculum</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
