import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Play,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  FileText,
  ExternalLink,
  Code,
  Download,
  Clock,
  Tag,
  ArrowLeft,
  Menu,
  X,
  Sparkles,
  Radio,
  BookOpen,
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { api } from '../services/api';
import { Workshop, Session, Week } from '../types';
import { soundManager } from '../components/space/SoundManager';
import { getEmbedUrl } from '../utils/youtube';

export const WorkshopDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({});
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWorkshop() {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await api.getWorkshop(slug);
        setWorkshop(data);

        // Auto open all weeks by default
        const initialOpen: Record<string, boolean> = {};
        let firstSession: Session | null = null;

        if (data.weeks && data.weeks.length > 0) {
          data.weeks.forEach(w => {
            initialOpen[w.id] = true;
            if (!firstSession && w.sessions && w.sessions.length > 0) {
              firstSession = w.sessions[0];
            }
          });
        }
        setOpenWeeks(initialOpen);
        if (firstSession) {
          setSelectedSession(firstSession);
        }
      } catch (err: any) {
        setError(err.message || 'Workshop not found or unpublished.');
      } finally {
        setLoading(false);
      }
    }
    loadWorkshop();
  }, [slug]);

  // Compute all published sessions across weeks in order for previous/next navigation
  const allOrderedSessions: Session[] = [];
  workshop?.weeks?.forEach(w => {
    w.sessions?.forEach(s => {
      allOrderedSessions.push(s);
    });
  });

  const currentIndex = selectedSession
    ? allOrderedSessions.findIndex(s => s.id === selectedSession.id)
    : -1;
  const previousSession = currentIndex > 0 ? allOrderedSessions[currentIndex - 1] : null;
  const nextSession =
    currentIndex !== -1 && currentIndex < allOrderedSessions.length - 1
      ? allOrderedSessions[currentIndex + 1]
      : null;

  const toggleWeek = (weekId: string) => {
    setOpenWeeks(prev => ({ ...prev, [weekId]: !prev[weekId] }));
    soundManager.playTelemetryChirp(550, 0.03);
  };

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session);
    setMobileDrawerOpen(false);
    soundManager.playTelemetryChirp(720, 0.04);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-cosmic-cyan border-t-transparent animate-spin" />
        <p className="font-mono text-xs text-cosmic-cyan tracking-widest uppercase animate-pulse">
          Loading Workshop Telemetry & Curriculum...
        </p>
      </div>
    );
  }

  if (error || !workshop) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-2xl font-space font-bold text-white mb-2">Workshop Signal Lost</h2>
        <p className="text-slate-400 mb-6 text-sm">{error || 'This workshop is unavailable or private.'}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cosmic-cyan/15 text-cosmic-cyan border border-cosmic-cyan/30 text-sm font-space font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Missions</span>
        </Link>
      </div>
    );
  }

  // Sanitize Markdown notes
  const renderedNotes = selectedSession?.lessonNotes
    ? DOMPurify.sanitize(marked.parse(selectedSession.lessonNotes) as string)
    : '';

  // Parse topics
  const topicsList = selectedSession?.topics
    ? selectedSession.topics
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    : [];

  // Find the week corresponding to the selected session
  const currentWeek = workshop.weeks?.find(w =>
    w.sessions?.some(s => s.id === selectedSession?.id)
  );

  return (
    <div className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Breadcrumb & Mobile Drawer Trigger */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
          <Link to="/explore" className="hover:text-white transition-colors">Workshops</Link>
          <span>/</span>
          {workshop.learningPath && (
            <>
              <Link to={`/paths/${workshop.learningPath.slug}`} className="hover:text-white transition-colors">
                {workshop.learningPath.title.split(':')[0]}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-cosmic-cyan truncate">{workshop.title}</span>
        </div>

        {/* Mobile Curriculum Trigger Button */}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-hud border-cosmic-cyan/40 text-cosmic-cyan text-xs font-mono shrink-0 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>View Curriculum ({allOrderedSessions.length})</span>
        </button>
      </div>

      {/* Workshop Header Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-cosmic-cyan/10 border border-cosmic-cyan/30 text-cosmic-cyan font-semibold">
            {workshop.difficulty}
          </span>
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{workshop.estimatedDuration || '4 Weeks'}</span>
          </span>
          <span className="text-xs font-mono text-cosmic-violet font-semibold">
            {workshop.weeks?.length || 0} Weeks Curriculum &bull; {allOrderedSessions.length} Sessions
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-space font-extrabold text-white">
          {workshop.title}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-4xl">
          {workshop.description}
        </p>
      </div>

      {/* Main Two-Column Layout: Video & Content (Left/Center), Curriculum Drawer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content: Video Player + Notes + Resources (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {selectedSession ? (
            <div className="space-y-6">
              {/* Responsive 16:9 YouTube Video Embed Frame with Transmission Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                  <div className="flex items-center gap-2 text-cosmic-cyan">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-cosmic-cyan" />
                    <span className="tracking-widest uppercase">TRANSMISSION FEED &bull; ON-DEMAND</span>
                  </div>
                  {currentWeek && (
                    <span className="text-slate-400">
                      WEEK 0{currentWeek.weekNumber} &bull; SESSION {selectedSession.displayOrder}
                    </span>
                  )}
                </div>

                <div className="relative aspect-video w-full rounded-2xl overflow-hidden glass-panel border border-cosmic-cyan/30 shadow-glow-cyan bg-black">
                  <iframe
                    src={getEmbedUrl(selectedSession.youtubeVideoId)}
                    title={selectedSession.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              {/* Session Details Header */}
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-cosmic-cyan/15 text-cosmic-cyan text-xs font-mono font-bold tracking-wider">
                      ACTIVE TRANSMISSION
                    </span>
                    {selectedSession.duration && (
                      <span className="text-xs font-mono text-slate-400">
                        Duration: {selectedSession.duration}
                      </span>
                    )}
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-space font-bold text-white">
                  {selectedSession.title}
                </h2>

                {selectedSession.description && (
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {selectedSession.description}
                  </p>
                )}

                {/* Topics Covered */}
                {topicsList.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <p className="text-xs font-mono text-slate-400 uppercase flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-cosmic-cyan" />
                      <span>Key Topics Covered:</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {topicsList.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-slate-300"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Notes / Markdown Content */}
              {renderedNotes && (
                <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-white font-space font-bold text-lg">
                    <FileText className="w-5 h-5 text-cosmic-cyan" />
                    <span>Lesson Notes & Code Architecture</span>
                  </div>
                  <div
                    className="prose-cosmic"
                    dangerouslySetInnerHTML={{ __html: renderedNotes }}
                  />
                </div>
              )}

              {/* Downloadable / External Resources */}
              {selectedSession.resources && selectedSession.resources.length > 0 && (
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-white font-space font-bold text-lg">
                    <Download className="w-5 h-5 text-cosmic-violet" />
                    <span>Session Resources & Downloads</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSession.resources.map(res => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-cosmic-cyan/40 hover:bg-white/10 transition-all flex items-start gap-3 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-cosmic-cyan/10 border border-cosmic-cyan/30 flex items-center justify-center text-cosmic-cyan shrink-0 mt-0.5">
                          {res.resourceType === 'CODE' ? (
                            <Code className="w-4 h-4" />
                          ) : (
                            <ExternalLink className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono text-cosmic-cyan uppercase">{res.resourceType}</p>
                          <p className="text-sm font-space font-bold text-white group-hover:text-cosmic-cyan transition-colors truncate">
                            {res.title}
                          </p>
                          {res.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{res.description}</p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Previous / Next Session Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
                {previousSession ? (
                  <button
                    onClick={() => handleSelectSession(previousSession)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl glass-card text-left text-xs sm:text-sm hover:border-cosmic-cyan/40 transition-all group max-w-[48%] cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5 text-cosmic-cyan shrink-0 group-hover:-translate-x-1 transition-transform" />
                    <div className="truncate">
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Previous Session</p>
                      <p className="font-space font-semibold text-white truncate">{previousSession.title}</p>
                    </div>
                  </button>
                ) : (
                  <div />
                )}

                {nextSession ? (
                  <button
                    onClick={() => handleSelectSession(nextSession)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl glass-card text-right text-xs sm:text-sm hover:border-cosmic-cyan/40 transition-all group max-w-[48%] ml-auto cursor-pointer"
                  >
                    <div className="truncate">
                      <p className="text-[10px] font-mono text-slate-400 uppercase">Next Session</p>
                      <p className="font-space font-semibold text-white truncate">{nextSession.title}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cosmic-cyan shrink-0 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-cosmic-cyan" />
              <p className="text-lg font-space font-bold text-white">No Sessions Scheduled</p>
              <p className="text-sm">This workshop does not yet contain published sessions.</p>
            </div>
          )}
        </div>

        {/* Desktop Curriculum Sidebar (4 cols) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-28 space-y-4">
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4 max-h-[82vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-space font-bold text-base text-white">Course Curriculum</h3>
              <span className="font-mono text-xs text-cosmic-cyan">
                {allOrderedSessions.length} Sessions Total
              </span>
            </div>

            {/* Weeks Accordion */}
            <div className="space-y-3">
              {workshop.weeks?.map(week => {
                const isOpen = openWeeks[week.id] !== false;
                return (
                  <div
                    key={week.id}
                    className="rounded-xl border border-white/5 bg-[#0D1424]/60 overflow-hidden"
                  >
                    {/* Week Header */}
                    <button
                      onClick={() => toggleWeek(week.id)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-mono text-cosmic-cyan uppercase font-semibold">
                          Week 0{week.weekNumber}
                        </p>
                        <p className="text-sm font-space font-bold text-white leading-snug">
                          {week.title}
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {/* Sessions List */}
                    {isOpen && week.sessions && week.sessions.length > 0 && (
                      <div className="px-2 pb-2 space-y-1">
                        {week.sessions.map(session => {
                          const isCurrent = selectedSession?.id === session.id;
                          return (
                            <button
                              key={session.id}
                              onClick={() => handleSelectSession(session)}
                              className={`w-full px-3 py-2.5 rounded-lg text-left text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-cosmic-cyan/15 text-cosmic-cyan border border-cosmic-cyan/40 font-semibold shadow-glow-cyan/20'
                                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                  isCurrent ? 'bg-cosmic-cyan text-black' : 'bg-white/10 text-slate-400'
                                }`}
                              >
                                <Play className="w-2.5 h-2.5 fill-current" />
                              </div>
                              <div className="truncate flex-1">
                                <p className="truncate">{session.title}</p>
                              </div>
                              {session.duration && (
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {session.duration}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Curriculum Modal / Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm lg:hidden">
          <div className="w-full max-h-[85vh] glass-panel rounded-t-3xl p-6 overflow-y-auto space-y-4 border-t border-cosmic-cyan/30 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-space font-bold text-lg text-white">Workshop Curriculum</h3>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {workshop.weeks?.map(week => (
                <div key={week.id} className="space-y-2">
                  <p className="text-xs font-mono text-cosmic-cyan font-bold uppercase">
                    Week 0{week.weekNumber}: {week.title}
                  </p>
                  <div className="space-y-1">
                    {week.sessions?.map(session => (
                      <button
                        key={session.id}
                        onClick={() => handleSelectSession(session)}
                        className={`w-full p-3 rounded-xl text-left text-sm flex items-center gap-3 cursor-pointer ${
                          selectedSession?.id === session.id
                            ? 'bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan font-bold'
                            : 'bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <Play className="w-4 h-4 shrink-0 fill-current" />
                        <span className="truncate flex-1">{session.title}</span>
                        {session.duration && (
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {session.duration}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
