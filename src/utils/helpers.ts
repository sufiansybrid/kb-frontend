import type { DocStatus, DocType } from '../types';

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export const STATUS_LABEL: Record<DocStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  removed: 'Removed',
  url_unavailable: 'URL Unavailable',
};

export const STATUS_CLASS: Record<DocStatus, string> = {
  active: 'badge-active',
  pending: 'badge-pending',
  removed: 'badge-removed',
  url_unavailable: 'badge-unavailable',
};

export const TYPE_CLASS: Record<DocType, string> = {
  url: 'type-url',
  pdf: 'type-pdf',
  excel: 'type-excel',
  md: 'type-md',
};

export const TYPE_LABEL: Record<DocType, string> = {
  url: 'URL',
  pdf: 'PDF',
  excel: 'Excel',
  md: 'MD',
};

export function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

export function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-yellow-200 rounded px-0.5">$1</mark>');
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const r = (err as { response?: { data?: { error?: string } } }).response;
    if (r?.data?.error) return r.data.error;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}
