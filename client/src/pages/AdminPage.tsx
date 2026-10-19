import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  BookOpen,
  Calendar,
  Video,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Compass,
  FileText,
  Tag,
  Link as LinkIcon,
} from 'lucide-react';
import { api } from '../services/api';
import {
  LearningPath,
  Workshop,
  Week,
  Session,
  SiteSetting,
  DashboardMetrics,
} from '../types';
import { extractYouTubeId, getEmbedUrl } from '../utils/youtube';
import { PlanetVisual } from '../components/space/PlanetVisual';
import { soundManager } from '../components/space/SoundManager';

export const AdminPage: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Active view tab in admin
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'paths' | 'workshops' | 'curriculum' | 'settings'
  >('dashboard');

  // Dashboard Data
  const [dashboardData, setDashboardData] = useState<{
    metrics: DashboardMetrics;
    recentWorkshops: any[];
  } | null>(null);

  // Data lists
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('');
  const [selectedWorkshopWeeks, setSelectedWorkshopWeeks] = useState<Week[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSetting | null>(null);

  // Modal / Form states
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<Partial<LearningPath> | null>(null);

  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Partial<Workshop> | null>(null);

  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<Partial<Week> | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Partial<Session> | null>(null);
  const [sessionPreviewId, setSessionPreviewId] = useState<string>('');

  // Notification / Toast
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check initial session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.getMe();
        setIsAuthenticated(res.authenticated);
        if (res.authenticated) {
          loadAllAdminData();
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function loadAllAdminData() {
    try {
      const [dash, pathList, workshopList, settingsData] = await Promise.all([
        api.getDashboard(),
        api.getAdminPaths(),
        api.getAdminWorkshops(),
        api.getAdminSettings(),
      ]);
      setDashboardData(dash);
      setPaths(pathList);
      setWorkshops(workshopList);
      setSiteSettings(settingsData);
      if (workshopList.length > 0 && !selectedWorkshopId) {
        setSelectedWorkshopId(workshopList[0].id);
      }
    } catch (err: any) {
      console.error('Error loading admin station data:', err);
    }
  }

  // Load weeks when selected workshop changes in curriculum tab
  useEffect(() => {
    if (selectedWorkshopId) {
      api.getAdminWeeks(selectedWorkshopId)
        .then(setSelectedWorkshopWeeks)
        .catch(console.error);
    }
  }, [selectedWorkshopId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSubmitting(true);
    soundManager.playTelemetryChirp(650, 0.05);

    try {
      await api.login({ username: usernameInput, password: passwordInput });
      setIsAuthenticated(true);
      showNotification('success', 'Station authorized. Welcome to Dharma Command.');
      loadAllAdminData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrative credentials.');
      soundManager.playTelemetryChirp(350, 0.1);
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setIsAuthenticated(false);
      soundManager.playTelemetryChirp(500, 0.08);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // ==========================================
  // LEARNING PATH HANDLERS
  // ==========================================
  const handleSavePath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPath) return;

    try {
      if (editingPath.id) {
        await api.updateAdminPath(editingPath.id, editingPath);
        showNotification('success', 'Learning path updated successfully.');
      } else {
        await api.createAdminPath(editingPath);
        showNotification('success', 'New learning path created in orbit.');
      }
      setIsPathModalOpen(false);
      setEditingPath(null);
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDeletePath = async (id: string, title: string) => {
    if (
      !confirm(
        `CAUTION: Deleting "${title}" will permanently remove all associated workshops, weeks, and sessions. Are you sure?`
      )
    ) {
      return;
    }
    try {
      await api.deleteAdminPath(id);
      showNotification('success', 'Learning path removed from orbit.');
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // ==========================================
  // WORKSHOP HANDLERS
  // ==========================================
  const handleSaveWorkshop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkshop) return;

    try {
      if (editingWorkshop.id) {
        await api.updateAdminWorkshop(editingWorkshop.id, editingWorkshop);
        showNotification('success', 'Workshop updated.');
      } else {
        await api.createAdminWorkshop(editingWorkshop);
        showNotification('success', 'Workshop published to station roster.');
      }
      setIsWorkshopModalOpen(false);
      setEditingWorkshop(null);
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteWorkshop = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete workshop "${title}"?`)) return;
    try {
      await api.deleteAdminWorkshop(id);
      showNotification('success', 'Workshop removed.');
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDuplicateWorkshop = async (id: string) => {
    try {
      await api.duplicateAdminWorkshop(id);
      showNotification('success', 'Workshop duplicated as draft copy.');
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // ==========================================
  // CURRICULUM WEEK & SESSION HANDLERS
  // ==========================================
  const handleSaveWeek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeek || !selectedWorkshopId) return;

    try {
      if (editingWeek.id) {
        await api.updateAdminWeek(editingWeek.id, editingWeek);
        showNotification('success', 'Week curriculum updated.');
      } else {
        await api.createAdminWeek({ ...editingWeek, workshopId: selectedWorkshopId });
        showNotification('success', 'New week added to workshop.');
      }
      setIsWeekModalOpen(false);
      setEditingWeek(null);
      const updated = await api.getAdminWeeks(selectedWorkshopId);
      setSelectedWorkshopWeeks(updated);
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteWeek = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" and all its sessions?`)) return;
    try {
      await api.deleteAdminWeek(id);
      showNotification('success', 'Week removed.');
      const updated = await api.getAdminWeeks(selectedWorkshopId);
      setSelectedWorkshopWeeks(updated);
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    try {
      if (editingSession.id) {
        await api.updateAdminSession(editingSession.id, editingSession);
        showNotification('success', 'Session updated.');
      } else {
        await api.createAdminSession(editingSession);
        showNotification('success', 'New session published.');
      }
      setIsSessionModalOpen(false);
      setEditingSession(null);
      const updated = await api.getAdminWeeks(selectedWorkshopId);
      setSelectedWorkshopWeeks(updated);
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to remove this session?')) return;
    try {
      await api.deleteAdminSession(id);
      showNotification('success', 'Session removed.');
      const updated = await api.getAdminWeeks(selectedWorkshopId);
      setSelectedWorkshopWeeks(updated);
      loadAllAdminData();
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // ==========================================
  // SITE SETTINGS HANDLER
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;

    try {
      await api.updateAdminSettings(siteSettings);
      showNotification('success', 'Station site settings updated.');
    } catch (err: any) {
      showNotification('error', err.message);
    }
  };

  // Loading state during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-[#050816]">
        <div className="w-10 h-10 border-2 border-cosmic-cyan border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-cosmic-cyan">Verifying Command Credentials...</p>
      </div>
    );
  }

  // ==========================================
  // LOGIN SCREEN (UNAUTHENTICATED)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#050816] relative z-10">
        <div className="max-w-md w-full glass-panel rounded-3xl p-8 sm:p-10 border border-cosmic-cyan/30 shadow-glow-cyan/40 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-cosmic-card border border-cosmic-cyan/40 flex items-center justify-center mx-auto shadow-glow-cyan">
              <Shield className="w-7 h-7 text-cosmic-cyan" />
            </div>
            <h1 className="text-2xl font-space font-extrabold text-white tracking-wider">
              DHARMA COMMAND
            </h1>
            <p className="text-xs font-mono text-slate-400">
              Quazar Labs Administrative Management Portal
            </p>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Commander Username
              </label>
              <input
                type="text"
                required
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="Enter admin identifier"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Command Key (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cosmic-violet via-purple-600 to-cosmic-cyan text-white font-space font-bold text-sm shadow-glow-cyan hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authorizing...</span>
                </>
              ) : (
                <span>Authenticate Station Access</span>
              )}
            </button>
          </form>

          <p className="text-[11px] font-mono text-center text-slate-500">
            Protected endpoint &bull; Rate-limited authentication sequence
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED ADMIN DASHBOARD PORTAL
  // ==========================================
  return (
    <div className="min-h-screen bg-[#050816] text-[#F8FAFC] pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 relative z-10">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border text-sm font-mono shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin Station Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cosmic-cyan mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>COMMAND STATION ONLINE &bull; ROUTE: /dharma</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-space font-extrabold text-white">
            Quazar Mission Control
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadAllAdminData();
              soundManager.playTelemetryChirp(700, 0.05);
            }}
            className="p-2 rounded-xl glass-hud text-slate-300 hover:text-white"
            title="Refresh Station Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Station (Logout)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/5">
        {[
          { id: 'dashboard', label: 'Telemetry Overview', icon: Layers },
          { id: 'paths', label: 'Learning Paths', icon: Compass },
          { id: 'workshops', label: 'Workshops', icon: BookOpen },
          { id: 'curriculum', label: 'Curriculum & Sessions', icon: Video },
          { id: 'settings', label: 'Station Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                soundManager.playTelemetryChirp(600, 0.04);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-space font-medium shrink-0 transition-all ${
                isActive
                  ? 'bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan font-bold shadow-glow-cyan/20'
                  : 'glass-card text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: TELEMETRY OVERVIEW DASHBOARD
      ======================================================== */}
      {activeTab === 'dashboard' && dashboardData && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 space-y-2 border border-white/5">
              <p className="text-xs font-mono text-slate-400 uppercase">Learning Paths</p>
              <p className="text-3xl font-space font-bold text-white">
                {dashboardData.metrics.paths.total}
              </p>
              <p className="text-xs font-mono text-emerald-400">
                {dashboardData.metrics.paths.published} Published &bull; {dashboardData.metrics.paths.draft} Drafts
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2 border border-white/5">
              <p className="text-xs font-mono text-slate-400 uppercase">Total Workshops</p>
              <p className="text-3xl font-space font-bold text-cosmic-cyan">
                {dashboardData.metrics.workshops.total}
              </p>
              <p className="text-xs font-mono text-slate-400">
                {dashboardData.metrics.workshops.published} Published
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2 border border-white/5">
              <p className="text-xs font-mono text-slate-400 uppercase">Curriculum Weeks</p>
              <p className="text-3xl font-space font-bold text-cosmic-violet">
                {dashboardData.metrics.weeks.total}
              </p>
              <p className="text-xs font-mono text-slate-400">Across all workshops</p>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-2 border border-white/5">
              <p className="text-xs font-mono text-slate-400 uppercase">Recorded Sessions</p>
              <p className="text-3xl font-space font-bold text-rose-400">
                {dashboardData.metrics.sessions.total}
              </p>
              <p className="text-xs font-mono text-slate-400">
                {dashboardData.metrics.sessions.published} YouTube Deep Dives
              </p>
            </div>
          </div>

          {/* Quick Publishing Workflow Guide */}
          <div className="glass-hud rounded-2xl p-6 border-cosmic-cyan/30 space-y-3">
            <h3 className="font-space font-bold text-base text-cosmic-cyan flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Weekly Session Publishing Telemetry</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              To publish a recorded YouTube session: Navigate to <strong>Curriculum & Sessions</strong>, select the target workshop and week, click <strong>Add Session</strong>, paste the YouTube URL (video ID is extracted automatically), provide markdown notes, and toggle status to <strong>PUBLISHED</strong>. It will immediately be live on the public portal.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: LEARNING PATHS CRUD
      ======================================================== */}
      {activeTab === 'paths' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-space font-bold text-white">Planetary Learning Paths</h2>
            <button
              onClick={() => {
                setEditingPath({
                  title: '',
                  slug: '',
                  description: '',
                  learningObjectives: '',
                  planetTheme: 'purple-gas-giant',
                  accentColor: '#8B5CF6',
                  publicationStatus: 'PUBLISHED',
                  featured: false,
                  displayOrder: paths.length + 1,
                });
                setIsPathModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan hover:bg-cosmic-cyan/30 text-xs font-mono font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Learning Path</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(path => (
              <div
                key={path.id}
                className="glass-card rounded-2xl p-6 space-y-4 border border-white/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <PlanetVisual theme={path.planetTheme} size="sm" />
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        path.publicationStatus === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {path.publicationStatus}
                    </span>
                  </div>

                  <h3 className="text-lg font-space font-bold text-white mb-1">{path.title}</h3>
                  <p className="text-xs font-mono text-cosmic-cyan mb-2">/paths/{path.slug}</p>
                  <p className="text-xs text-slate-300 line-clamp-2">{path.description}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">Order: #{path.displayOrder}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPath(path);
                        setIsPathModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg glass-hud text-slate-300 hover:text-white"
                      title="Edit Path"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePath(path.id, path.title)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Delete Path"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: WORKSHOPS CRUD
      ======================================================== */}
      {activeTab === 'workshops' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-space font-bold text-white">Workshops Manager</h2>
            <button
              onClick={() => {
                setEditingWorkshop({
                  learningPathId: paths[0]?.id || '',
                  title: '',
                  slug: '',
                  description: '',
                  difficulty: 'Beginner',
                  estimatedDuration: '4 Weeks',
                  publicationStatus: 'PUBLISHED',
                  displayOrder: workshops.length + 1,
                });
                setIsWorkshopModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan hover:bg-cosmic-cyan/30 text-xs font-mono font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Workshop</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workshops.map(w => (
              <div
                key={w.id}
                className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cosmic-violet/20 text-cosmic-violet border border-cosmic-violet/40">
                      {w.learningPath?.title || 'Learning Path'}
                    </span>
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded ${
                        w.publicationStatus === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {w.publicationStatus}
                    </span>
                  </div>

                  <h3 className="text-lg font-space font-bold text-white mb-1">{w.title}</h3>
                  <p className="text-xs font-mono text-cosmic-cyan mb-2">/workshops/{w.slug}</p>
                  <p className="text-xs text-slate-300 line-clamp-2">{w.description}</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400">{w.difficulty} &bull; {w.estimatedDuration}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDuplicateWorkshop(w.id)}
                      className="p-1.5 rounded-lg glass-hud text-slate-300 hover:text-white"
                      title="Duplicate Workshop"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingWorkshop(w);
                        setIsWorkshopModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg glass-hud text-slate-300 hover:text-white"
                      title="Edit Workshop"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkshop(w.id, w.title)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      title="Delete Workshop"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: CURRICULUM WEEKS & SESSIONS
      ======================================================== */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Workshop Selector */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                Select Active Workshop to Manage:
              </label>
              <select
                value={selectedWorkshopId}
                onChange={e => setSelectedWorkshopId(e.target.value)}
                className="bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-space focus:outline-none focus:border-cosmic-cyan"
              >
                {workshops.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.title} ({w.publicationStatus})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingWeek({
                  workshopId: selectedWorkshopId,
                  weekNumber: selectedWorkshopWeeks.length + 1,
                  title: '',
                  description: '',
                  publicationStatus: 'PUBLISHED',
                  displayOrder: selectedWorkshopWeeks.length + 1,
                });
                setIsWeekModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cosmic-violet/20 border border-cosmic-violet text-cosmic-violet hover:bg-cosmic-violet/30 text-xs font-mono font-bold transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Week</span>
            </button>
          </div>

          {/* Weeks Accordion in Admin */}
          <div className="space-y-6">
            {selectedWorkshopWeeks.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center text-slate-400">
                No weeks found for this workshop. Click &quot;Add New Week&quot; above to create Week 01.
              </div>
            ) : (
              selectedWorkshopWeeks.map(week => (
                <div key={week.id} className="glass-card rounded-2xl p-6 space-y-4 border border-white/5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-xs font-mono text-cosmic-cyan uppercase font-bold">
                        Week 0{week.weekNumber}
                      </span>
                      <h3 className="text-lg font-space font-bold text-white">{week.title}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSession({
                            weekId: week.id,
                            title: '',
                            description: '',
                            youtubeUrl: '',
                            youtubeVideoId: '',
                            duration: '45m 00s',
                            topics: '',
                            lessonNotes: '',
                            publicationStatus: 'PUBLISHED',
                            displayOrder: (week.sessions?.length || 0) + 1,
                          });
                          setSessionPreviewId('');
                          setIsSessionModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cosmic-cyan/15 border border-cosmic-cyan/40 text-cosmic-cyan text-xs font-mono hover:bg-cosmic-cyan/25"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Session</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingWeek(week);
                          setIsWeekModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg glass-hud text-slate-300 hover:text-white"
                        title="Edit Week"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteWeek(week.id, week.title)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="Delete Week"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Sessions in this week */}
                  <div className="space-y-2">
                    {!week.sessions || week.sessions.length === 0 ? (
                      <p className="text-xs font-mono text-slate-500 italic">
                        No sessions added to this week yet.
                      </p>
                    ) : (
                      week.sessions.map(session => (
                        <div
                          key={session.id}
                          className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                              <Video className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-space font-bold text-white truncate">
                                {session.title}
                              </p>
                              <p className="text-xs font-mono text-slate-400 truncate">
                                ID: {session.youtubeVideoId} &bull; {session.duration || 'N/A'} &bull; {session.publicationStatus}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingSession(session);
                                setSessionPreviewId(session.youtubeVideoId);
                                setIsSessionModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg glass-hud text-slate-300 hover:text-white"
                              title="Edit Session"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                              title="Delete Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: SITE SETTINGS
      ======================================================== */}
      {activeTab === 'settings' && siteSettings && (
        <form onSubmit={handleSaveSettings} className="glass-panel rounded-2xl p-8 space-y-6 max-w-3xl">
          <h2 className="text-xl font-space font-bold text-white">Public Station Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Hero Main Heading</label>
              <input
                type="text"
                value={siteSettings.heroHeading}
                onChange={e => setSiteSettings({ ...siteSettings, heroHeading: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Hero Subtitle</label>
              <textarea
                rows={2}
                value={siteSettings.heroSubtitle}
                onChange={e => setSiteSettings({ ...siteSettings, heroSubtitle: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">About Section Ethos</label>
              <textarea
                rows={4}
                value={siteSettings.aboutText}
                onChange={e => setSiteSettings({ ...siteSettings, aboutText: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={siteSettings.contactEmail}
                  onChange={e => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={siteSettings.githubUrl}
                  onChange={e => setSiteSettings({ ...siteSettings, githubUrl: e.target.value })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Discord Invite</label>
                <input
                  type="url"
                  value={siteSettings.discordUrl}
                  onChange={e => setSiteSettings({ ...siteSettings, discordUrl: e.target.value })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">YouTube Channel</label>
                <input
                  type="url"
                  value={siteSettings.youtubeUrl}
                  onChange={e => setSiteSettings({ ...siteSettings, youtubeUrl: e.target.value })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan font-space font-bold text-sm hover:bg-cosmic-cyan/30 transition-all"
          >
            Save Public Station Settings
          </button>
        </form>
      )}

      {/* ========================================================
          MODAL: LEARNING PATH FORM
      ======================================================== */}
      {isPathModalOpen && editingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSavePath}
            className="max-w-xl w-full glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-cosmic-cyan/40 my-8"
          >
            <h3 className="text-xl font-space font-bold text-white">
              {editingPath.id ? 'Edit Learning Path' : 'Create Planetary Learning Path'}
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Path Title</label>
              <input
                type="text"
                required
                value={editingPath.title || ''}
                onChange={e => setEditingPath({ ...editingPath, title: e.target.value })}
                placeholder="e.g. Planet C++: Systems & Fundamentals"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Unique Slug</label>
              <input
                type="text"
                required
                value={editingPath.slug || ''}
                onChange={e => setEditingPath({ ...editingPath, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. planet-cpp"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={editingPath.description || ''}
                onChange={e => setEditingPath({ ...editingPath, description: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Planet Theme</label>
                <select
                  value={editingPath.planetTheme || 'purple-gas-giant'}
                  onChange={e => setEditingPath({ ...editingPath, planetTheme: e.target.value })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
                >
                  <option value="blue-terrestrial">Blue Terrestrial (C++)</option>
                  <option value="purple-gas-giant">Purple Gas Giant (DSA)</option>
                  <option value="cyber-ringed">Cyber Ringed (Cybersecurity)</option>
                  <option value="nebula-red">Nebula Red (AI)</option>
                  <option value="cosmic-cyan">Cosmic Cyan (Web)</option>
                  <option value="quantum-gold">Quantum Gold (Pulsar)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Publication Status</label>
                <select
                  value={editingPath.publicationStatus || 'PUBLISHED'}
                  onChange={e => setEditingPath({ ...editingPath, publicationStatus: e.target.value as any })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
                >
                  <option value="PUBLISHED">PUBLISHED (Public)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsPathModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan text-xs font-mono font-bold hover:bg-cosmic-cyan/30"
              >
                Save Learning Path
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: WORKSHOP FORM
      ======================================================== */}
      {isWorkshopModalOpen && editingWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveWorkshop}
            className="max-w-xl w-full glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-cosmic-cyan/40 my-8"
          >
            <h3 className="text-xl font-space font-bold text-white">
              {editingWorkshop.id ? 'Edit Workshop' : 'Create New Space Workshop'}
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Learning Path</label>
              <select
                required
                value={editingWorkshop.learningPathId || ''}
                onChange={e => setEditingWorkshop({ ...editingWorkshop, learningPathId: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              >
                {paths.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Workshop Title</label>
              <input
                type="text"
                required
                value={editingWorkshop.title || ''}
                onChange={e => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                placeholder="e.g. Deep Space C++: Systems Programming From Scratch"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Unique Slug</label>
              <input
                type="text"
                required
                value={editingWorkshop.slug || ''}
                onChange={e => setEditingWorkshop({ ...editingWorkshop, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. deep-space-cpp"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Description</label>
              <textarea
                required
                rows={3}
                value={editingWorkshop.description || ''}
                onChange={e => setEditingWorkshop({ ...editingWorkshop, description: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Difficulty</label>
                <select
                  value={editingWorkshop.difficulty || 'Beginner'}
                  onChange={e => setEditingWorkshop({ ...editingWorkshop, difficulty: e.target.value as any })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={editingWorkshop.estimatedDuration || '4 Weeks'}
                  onChange={e => setEditingWorkshop({ ...editingWorkshop, estimatedDuration: e.target.value })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Status</label>
                <select
                  value={editingWorkshop.publicationStatus || 'PUBLISHED'}
                  onChange={e => setEditingWorkshop({ ...editingWorkshop, publicationStatus: e.target.value as any })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsWorkshopModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan text-xs font-mono font-bold hover:bg-cosmic-cyan/30"
              >
                Save Workshop
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: WEEK FORM
      ======================================================== */}
      {isWeekModalOpen && editingWeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveWeek}
            className="max-w-md w-full glass-panel rounded-2xl p-6 space-y-4 border border-cosmic-cyan/40"
          >
            <h3 className="text-lg font-space font-bold text-white">
              {editingWeek.id ? 'Edit Curriculum Week' : 'Add Curriculum Week'}
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Week Number</label>
              <input
                type="number"
                min="1"
                required
                value={editingWeek.weekNumber || 1}
                onChange={e => setEditingWeek({ ...editingWeek, weekNumber: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Week Title</label>
              <input
                type="text"
                required
                value={editingWeek.title || ''}
                onChange={e => setEditingWeek({ ...editingWeek, title: e.target.value })}
                placeholder="e.g. Week 01: Launch Sequence & Memory Architecture"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                rows={2}
                value={editingWeek.description || ''}
                onChange={e => setEditingWeek({ ...editingWeek, description: e.target.value })}
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsWeekModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan text-xs font-mono font-bold"
              >
                Save Week
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: SESSION FORM WITH INSTANT YOUTUBE PREVIEW
      ======================================================== */}
      {isSessionModalOpen && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <form
            onSubmit={handleSaveSession}
            className="max-w-2xl w-full glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-cosmic-cyan/40 my-8 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-space font-bold text-white">
              {editingSession.id ? 'Edit Session' : 'Publish Recorded YouTube Session'}
            </h3>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">Session Title</label>
              <input
                type="text"
                required
                value={editingSession.title || ''}
                onChange={e => setEditingSession({ ...editingSession, title: e.target.value })}
                placeholder="e.g. Session 01: The Spacecraft Computer & Compilation Pipeline"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cosmic-cyan"
              />
            </div>

            {/* YouTube URL with Instant Extraction & Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300">
                YouTube URL (watch / youtu.be / shorts / embed)
              </label>
              <input
                type="text"
                required
                value={editingSession.youtubeUrl || ''}
                onChange={e => {
                  const url = e.target.value;
                  const extracted = extractYouTubeId(url);
                  setEditingSession({
                    ...editingSession,
                    youtubeUrl: url,
                    youtubeVideoId: extracted || editingSession.youtubeVideoId,
                  });
                  if (extracted) {
                    setSessionPreviewId(extracted);
                  }
                }}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cosmic-cyan"
              />

              {sessionPreviewId && (
                <div className="pt-2">
                  <p className="text-[11px] font-mono text-emerald-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Extracted Video ID: {sessionPreviewId} (Preview Verified)</span>
                  </p>
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
                    <iframe
                      src={getEmbedUrl(sessionPreviewId)}
                      title="Preview"
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Estimated Duration</label>
                <input
                  type="text"
                  value={editingSession.duration || ''}
                  onChange={e => setEditingSession({ ...editingSession, duration: e.target.value })}
                  placeholder="e.g. 48m 15s"
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Publication Status</label>
                <select
                  value={editingSession.publicationStatus || 'PUBLISHED'}
                  onChange={e => setEditingSession({ ...editingSession, publicationStatus: e.target.value as any })}
                  className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                >
                  <option value="PUBLISHED">PUBLISHED (Live)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Key Topics (Comma-separated)
              </label>
              <input
                type="text"
                value={editingSession.topics || ''}
                onChange={e => setEditingSession({ ...editingSession, topics: e.target.value })}
                placeholder="Compilers, Memory Layout, Preprocessor, Pointers"
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Lesson Notes / Architecture Summary (Markdown Supported)
              </label>
              <textarea
                rows={6}
                value={editingSession.lessonNotes || ''}
                onChange={e => setEditingSession({ ...editingSession, lessonNotes: e.target.value })}
                placeholder="### Mission Briefing&#10;&#10;Key architecture points and code snippets..."
                className="w-full bg-[#0A1024] border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-cosmic-cyan/20 border border-cosmic-cyan text-cosmic-cyan text-xs font-mono font-bold hover:bg-cosmic-cyan/30"
              >
                Save & Publish Session
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
