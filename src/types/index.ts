export type Role = 'admin' | 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  created_at: string;
  is_active: boolean;
  document_count: number;
}

export type DocType = 'url' | 'pdf' | 'excel' | 'md';
export type DocStatus = 'active' | 'pending' | 'removed' | 'url_unavailable';

export interface ScrapeSchedule {
  id: number;
  interval_days: number;
  auto_remove: boolean;
  last_scraped_at: string | null;
  next_scrape_at: string | null;
  is_active: boolean;
}

export interface Document {
  id: number;
  name: string;
  source_type: DocType;
  source_url: string | null;
  file_path: string | null;
  file_size: number | null;
  content?: string;
  created_by: string;
  created_by_id: number;
  created_at: string;
  last_updated: string;
  is_active: boolean;
  status: DocStatus;
  schedule: ScrapeSchedule | null;
}

export interface ScrapeLog {
  id: number;
  document_id: number;
  document_name: string | null;
  scraped_at: string;
  status: 'success' | 'failed';
  message: string | null;
  duration_ms: number | null;
  words_extracted: number | null;
}

export interface SearchResult extends Document {
  snippet: string;
}

export interface PaginatedResponse<T> {
  items?: T[];
  documents?: T[];
  users?: T[];
  results?: T[];
  logs?: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface AdminStats {
  total_documents: number;
  active_documents: number;
  pending_documents: number;
  url_documents: number;
  total_users: number;
  recent_logs: ScrapeLog[];
}
