import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StarfieldCanvas } from './components/space/StarfieldCanvas';
import { CosmicLoader } from './components/space/CosmicLoader';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PathDetailPage } from './pages/PathDetailPage';
import { WorkshopDetailPage } from './pages/WorkshopDetailPage';
import { AdminPage } from './pages/AdminPage';
import { api } from './services/api';
import { SiteSetting } from './types';
import { ArrowLeft, Compass } from 'lucide-react';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4 relative z-10">
      <div className="w-20 h-20 rounded-2xl glass-hud flex items-center justify-center text-cosmic-cyan mb-4 shadow-glow-cyan">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>
      <h1 className="text-4xl font-space font-extrabold text-white mb-2">404 &bull; Orbit Lost</h1>
      <p className="text-slate-400 max-w-md mb-6 text-sm">
        You have drifted beyond charted Quazar telemetry coordinates into unmapped space.
      </p>
      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cosmic-violet to-cosmic-cyan text-white font-space font-bold text-sm shadow-glow-cyan"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Mission Control</span>
      </a>
    </div>
  );
}

export function App() {
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);

  useEffect(() => {
    api.getSiteSettings()
      .then(setSiteSettings)
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />

      {/* Global Interactive Procedural Starfield (hyperspace warp during loading sequence) */}
      <StarfieldCanvas isWarping={loading} />

      {/* Animated Cosmic Initial Telemetry Sequence */}
      <AnimatePresence>
        {loading && (
          <CosmicLoader onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <div className="relative min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content View */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/paths/:slug" element={<PathDetailPage />} />
            <Route path="/workshops/:slug" element={<WorkshopDetailPage />} />
            <Route path="/dharma" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer settings={siteSettings} />
      </div>
    </BrowserRouter>
  );
}

export default App;
