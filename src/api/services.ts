import api from './client';
import type { User, Document, ScrapeLog, SearchResult, AdminStats } from '../types';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),

  register: (username: string, email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { username, email, password }),

  me: () => api.get<User>('/auth/me'),

  changePassword: (current_password: string, new_password: string) =>
    api.put<{ message: string }>('/auth/change-password', { current_password, new_password }),

  updateProfile: (data: { username?: string; email?: string }) =>
    api.put<User>('/auth/profile', data),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export interface ListDocumentsParams {
  page?:     number;
  per_page?: number;
  sort_by?:  string;
  sort_dir?: 'asc' | 'desc';
  type?:       string;
  status?:     string;
  date_from?:  string;
  date_to?:    string;
  search?:  string;
}

export const documentsApi = {
  list: (params: ListDocumentsParams = {}) =>
    api.get<{ documents: Document[]; total: number; page: number; per_page: number; pages: number }>(
      '/documents', { params }
    ),

  get: (id: number) => api.get<Document>(`/documents/${id}`),

  addUrls: (payload: {
    urls: string[];
    auto_scrape:   boolean;
    interval_days: number;
    auto_remove:   boolean;
  }) => api.post<{ message: string; documents: Document[] }>('/documents/url', payload),

  upload: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('files', f));
    return api.post<{ message: string; documents: Document[]; errors: string[] }>(
      '/documents/upload', form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  delete: (id: number) => api.delete<{ message: string }>(`/documents/${id}`),

  triggerScrape: (id: number) =>
    api.post<{ message: string }>(`/documents/${id}/scrape`),

  updateSchedule: (id: number, payload: { interval_days?: number; auto_remove?: boolean; is_active?: boolean }) =>
    api.put(`/documents/${id}/schedule`, payload),

  getLogs: (id: number, page = 1) =>
    api.get<{ logs: ScrapeLog[]; total: number; page: number }>(`/documents/${id}/logs`, { params: { page } }),
};

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchParams {
  q:       string;
  mode?:   'content' | 'title';
  page?:   number;
  per_page?: number;
  type?:   string;
}

export const searchApi = {
  search: (params: SearchParams) =>
    api.get<{
      results: SearchResult[];
      total:   number;
      page:    number;
      pages:   number;
      query:   string;
      mode:    string;
    }>('/search', { params }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  stats: () => api.get<AdminStats>('/admin/stats'),

  listUsers: (params: { page?: number; per_page?: number; role?: string; q?: string } = {}) =>
    api.get<{ users: User[]; total: number; page: number; per_page: number }>('/admin/users', { params }),

  updateUser: (id: number, payload: { role?: string; is_active?: boolean; password?: string }) =>
    api.put<User>(`/admin/users/${id}`, payload),

  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),

  logs: (params: { page?: number; per_page?: number; status?: string; q?: string } = {}) =>
    api.get<{ logs: ScrapeLog[]; total: number; page: number; per_page: number }>('/admin/logs', { params }),
};
