import {
  LearningPath,
  Workshop,
  Session,
  Week,
  Resource,
  SiteSetting,
  SessionDetailResponse,
  DashboardMetrics,
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Automatically passes HTTP-only session cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Public
  getHealth: () => request<{ status: string; pathsCount: number }>('/public/health'),
  getSiteSettings: () => request<SiteSetting>('/public/site-settings'),
  getLearningPaths: () => request<LearningPath[]>('/public/learning-paths'),
  getLearningPath: (slug: string) => request<LearningPath>(`/public/learning-paths/${slug}`),
  getWorkshops: (params?: { search?: string; path?: string; difficulty?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.path) query.set('path', params.path);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.sort) query.set('sort', params.sort);
    return request<Workshop[]>(`/public/workshops?${query.toString()}`);
  },
  getWorkshop: (slug: string) => request<Workshop>(`/public/workshops/${slug}`),
  getSession: (id: string) => request<SessionDetailResponse>(`/public/sessions/${id}`),

  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<{ success: boolean; user: { username: string; role: string } }>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    request<{ success: boolean }>('/admin/auth/logout', {
      method: 'POST',
    }),
  getMe: () =>
    request<{ success: boolean; authenticated: boolean; user?: { username: string } }>('/admin/auth/me'),

  // Admin CMS
  getDashboard: () =>
    request<{
      metrics: DashboardMetrics;
      recentWorkshops: Array<{
        id: string;
        title: string;
        slug: string;
        learningPathTitle: string;
        publicationStatus: string;
        weekCount: number;
        updatedAt: string;
      }>;
    }>('/admin/dashboard'),

  // Admin Paths
  getAdminPaths: () => request<LearningPath[]>('/admin/learning-paths'),
  createAdminPath: (pathData: Partial<LearningPath>) =>
    request<LearningPath>('/admin/learning-paths', {
      method: 'POST',
      body: JSON.stringify(pathData),
    }),
  updateAdminPath: (id: string, pathData: Partial<LearningPath>) =>
    request<LearningPath>(`/admin/learning-paths/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pathData),
    }),
  deleteAdminPath: (id: string) =>
    request<{ success: boolean }>(`/admin/learning-paths/${id}`, {
      method: 'DELETE',
    }),

  // Admin Workshops
  getAdminWorkshops: () => request<Workshop[]>('/admin/workshops'),
  createAdminWorkshop: (workshopData: Partial<Workshop>) =>
    request<Workshop>('/admin/workshops', {
      method: 'POST',
      body: JSON.stringify(workshopData),
    }),
  updateAdminWorkshop: (id: string, workshopData: Partial<Workshop>) =>
    request<Workshop>(`/admin/workshops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(workshopData),
    }),
  deleteAdminWorkshop: (id: string) =>
    request<{ success: boolean }>(`/admin/workshops/${id}`, {
      method: 'DELETE',
    }),
  duplicateAdminWorkshop: (id: string) =>
    request<Workshop>(`/admin/workshops/${id}/duplicate`, {
      method: 'POST',
    }),

  // Admin Weeks
  getAdminWeeks: (workshopId: string) => request<Week[]>(`/admin/workshops/${workshopId}/weeks`),
  createAdminWeek: (weekData: Partial<Week>) =>
    request<Week>('/admin/weeks', {
      method: 'POST',
      body: JSON.stringify(weekData),
    }),
  updateAdminWeek: (id: string, weekData: Partial<Week>) =>
    request<Week>(`/admin/weeks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(weekData),
    }),
  deleteAdminWeek: (id: string) =>
    request<{ success: boolean }>(`/admin/weeks/${id}`, {
      method: 'DELETE',
    }),

  // Admin Sessions
  getAdminSessions: (weekId: string) => request<Session[]>(`/admin/weeks/${weekId}/sessions`),
  createAdminSession: (sessionData: Partial<Session>) =>
    request<Session>('/admin/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),
  updateAdminSession: (id: string, sessionData: Partial<Session>) =>
    request<Session>(`/admin/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }),
  deleteAdminSession: (id: string) =>
    request<{ success: boolean }>(`/admin/sessions/${id}`, {
      method: 'DELETE',
    }),

  // Admin Resources
  createAdminResource: (resourceData: Partial<Resource>) =>
    request<Resource>('/admin/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    }),
  deleteAdminResource: (id: string) =>
    request<{ success: boolean }>(`/admin/resources/${id}`, {
      method: 'DELETE',
    }),

  // Admin Site Settings
  getAdminSettings: () => request<SiteSetting>('/admin/site-settings'),
  updateAdminSettings: (settings: Partial<SiteSetting>) =>
    request<SiteSetting>('/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};
