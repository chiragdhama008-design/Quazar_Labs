import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ArrowRight, BookOpen, Layers, Sparkles, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Workshop, LearningPath } from '../types';
import { PlanetVisual } from '../components/space/PlanetVisual';
import { soundManager } from '../components/space/SoundManager';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPath = searchParams.get('path') || '';
  const initialDifficulty = searchParams.get('difficulty') || '';
  const initialSearch = searchParams.get('search') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedPath, setSelectedPath] = useState(initialPath);
  const [selectedDifficulty, setSelectedDifficulty] = useState(initialDifficulty);
  const [selectedSort, setSelectedSort] = useState('order');

  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  // Load paths once
  useEffect(() => {
    async function loadPaths() {
      try {
        const data = await api.getLearningPaths();
        setPaths(data);
      } catch (err) {
        console.error('Failed to load paths:', err);
      }
    }
    loadPaths();
  }, []);

  // Fetch workshops whenever filters change
  useEffect(() => {
    let active = true;
    async function fetchFilteredWorkshops() {
      setLoading(true);
      try {
        const data = await api.getWorkshops({
          search: search.trim() || undefined,
          path: selectedPath || undefined,
          difficulty: selectedDifficulty || undefined,
          sort: selectedSort,
        });
        if (active) {
          setWorkshops(data);
        }
      } catch (err) {
        console.error('Failed to filter workshops:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(fetchFilteredWorkshops, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, selectedPath, selectedDifficulty, selectedSort]);

  // Sync to URL query params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search.trim()) params.search = search.trim();
    if (selectedPath) params.path = selectedPath;
    if (selectedDifficulty) params.difficulty = selectedDifficulty;
    setSearchParams(params, { replace: true });
  }, [search, selectedPath, selectedDifficulty, setSearchParams]);

  const clearFilters = () => {
    setSearch('');
    setSelectedPath('');
    setSelectedDifficulty('');
    setSelectedSort('order');
    soundManager.playTelemetryChirp(600, 0.04);
  };

  const hasActiveFilters = Boolean(search.trim() || selectedPath || selectedDifficulty);

  return (
    <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cosmic-cyan/10 border border-cosmic-cyan/30 text-cosmic-cyan font-mono text-xs uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CURRICULUM EXPLORATION ARCHIVE</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-space font-extrabold text-white tracking-tight">
          Explore Missions & Workshops
        </h1>
        <p className="text-slate-300 max-w-2xl text-base leading-relaxed">
          Browse our open-access catalog of week-wise coding workshops, live recorded lectures, and technical deep-dives across deep-space computing domains.
        </p>
      </div>

      {/* Filter and Search HUD */}
      <div className="glass-panel rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Box (6 cols) */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by topic, keyword, or workshop name..."
              className="w-full bg-[#070B16] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cosmic-cyan/60 font-sans"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Difficulty Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedDifficulty}
              onChange={e => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cosmic-cyan/60 font-sans"
            >
              <option value="">All Difficulty Levels</option>
              <option value="Beginner">Beginner Level</option>
              <option value="Intermediate">Intermediate Level</option>
              <option value="Advanced">Advanced Level</option>
            </select>
          </div>

          {/* Sort Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedSort}
              onChange={e => setSelectedSort(e.target.value)}
              className="w-full bg-[#070B16] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cosmic-cyan/60 font-sans"
            >
              <option value="order">Curated Mission Order</option>
              <option value="recent">Recently Added</option>
              <option value="alpha">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Path Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedPath('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all ${
              selectedPath === ''
                ? 'bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan font-bold shadow-glow-cyan/20'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            All Planets & Zones
          </button>
          {paths.map(path => (
            <button
              key={path.id}
              onClick={() => setSelectedPath(path.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono shrink-0 transition-all flex items-center gap-1.5 ${
                selectedPath === path.slug
                  ? 'bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan font-bold shadow-glow-cyan/20'
                  : 'glass-card text-slate-300 hover:text-white'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: path.accentColor }}
              />
              <span>{path.title.split(':')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span>ACTIVE TELEMETRY FILTERS:</span>
              {search && (
                <span className="px-2 py-0.5 rounded bg-white/10 text-white">
                  Query: &quot;{search}&quot;
                </span>
              )}
              {selectedPath && (
                <span className="px-2 py-0.5 rounded bg-cosmic-cyan/15 text-cosmic-cyan">
                  Path: {selectedPath}
                </span>
              )}
              {selectedDifficulty && (
                <span className="px-2 py-0.5 rounded bg-cosmic-violet/15 text-cosmic-violet">
                  Level: {selectedDifficulty}
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Workshop Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-2xl glass-panel animate-pulse" />
          ))}
        </div>
      ) : workshops.length === 0 ? (
        /* Empty State */
        <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-space font-bold text-white">No Telemetry Matches Found</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            No workshops currently match your search filters. Try adjusting your search query or selecting a different exploration zone.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-cosmic-cyan/15 border border-cosmic-cyan/40 text-cosmic-cyan text-sm font-space font-semibold hover:bg-cosmic-cyan/25 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map(workshop => (
            <Link
              key={workshop.id}
              to={`/workshops/${workshop.slug}`}
              onClick={() => soundManager.playTelemetryChirp(700, 0.04)}
              className="group glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/5 hover:border-cosmic-cyan/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-cosmic-cyan/10 border border-cosmic-cyan/30 text-cosmic-cyan font-semibold">
                    {workshop.difficulty}
                  </span>
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{workshop.estimatedDuration || '4 Weeks'}</span>
                  </span>
                </div>

                <h3 className="text-xl font-space font-bold text-white group-hover:text-cosmic-cyan transition-colors mb-2">
                  {workshop.title}
                </h3>

                <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
                  {workshop.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-cosmic-violet font-semibold">
                  {workshop.learningPath?.title.split(':')[0] || 'Quazar Path'}
                </span>
                <span className="flex items-center gap-1 text-cosmic-cyan group-hover:translate-x-1.5 transition-transform">
                  <span>Enter Workshop</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
