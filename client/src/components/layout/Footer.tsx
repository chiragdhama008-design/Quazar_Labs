import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MessageSquare, Globe, Radio } from 'lucide-react';
import { SiteSetting } from '../../types';

interface FooterProps {
  settings?: SiteSetting | null;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-white/10 bg-[#040612] text-slate-400 overflow-hidden z-10">
      {/* Subtle background cosmic radiation glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-t from-cosmic-violet/10 via-cosmic-cyan/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-cosmic-card border border-cosmic-cyan/30 flex items-center justify-center shadow-glow-cyan/50">
                <svg viewBox="0 0 100 100" className="w-5 h-5">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#8B5CF6" strokeWidth="6" strokeDasharray="10 5" />
                  <ellipse cx="50" cy="50" rx="44" ry="16" fill="none" stroke="#22D3EE" strokeWidth="5" transform="rotate(-28 50 50)" />
                  <circle cx="50" cy="50" r="16" fill="#22D3EE" />
                </svg>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-space font-extrabold text-lg tracking-wider text-white">
                  QUAZAR
                </span>
                <span className="font-mono text-xs font-semibold px-1.5 py-0.5 rounded bg-cosmic-violet/20 border border-cosmic-violet/40 text-cosmic-violet">
                  LABS
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              {settings?.aboutText ||
                'Quazar Labs is an immersive technology education venture crafting hands-on coding sessions, systems workshops, and deep-space software engineering missions for students worldwide.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Station Telemetry Online</span>
              </div>
            </div>
          </div>

          {/* Mission Links */}
          <div className="space-y-3">
            <h3 className="font-space text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
              <Compass className="w-4 h-4 text-cosmic-cyan" />
              <span>Navigation</span>
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-cosmic-cyan transition-colors">
                  Orbital Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-cosmic-cyan transition-colors">
                  Explore Learning Missions
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-cosmic-cyan transition-colors">
                  About Quazar Labs
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-cosmic-cyan transition-colors">
                  Learning Journey
                </a>
              </li>
            </ul>
          </div>

          {/* Interplanetary Comm Grid */}
          <div className="space-y-3">
            <h3 className="font-space text-sm font-semibold text-white tracking-wider uppercase flex items-center gap-2">
              <Radio className="w-4 h-4 text-cosmic-violet" />
              <span>Comm Array</span>
            </h3>
            <ul className="space-y-2 text-sm">
              {settings?.githubUrl && (
                <li>
                  <a
                    href={settings.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    <span>GitHub Constellation</span>
                  </a>
                </li>
              )}
              {settings?.discordUrl && (
                <li>
                  <a
                    href={settings.discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-cosmic-violet" />
                    <span>Discord Command</span>
                  </a>
                </li>
              )}
              {settings?.youtubeUrl && (
                <li>
                  <a
                    href={settings.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>YouTube Broadcasts</span>
                  </a>
                </li>
              )}
              <li>
                <a
                  href={`mailto:${settings?.contactEmail || 'missions@quazarlabs.space'}`}
                  className="flex items-center gap-2 hover:text-cosmic-cyan transition-colors"
                >
                  <Globe className="w-4 h-4 text-cosmic-cyan" />
                  <span>{settings?.contactEmail || 'missions@quazarlabs.space'}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div>
            &copy; {currentYear} Quazar Labs. {settings?.footerText || 'Knowledge Beyond Orbit.'}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-600">Built for spacefarers and builders</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
