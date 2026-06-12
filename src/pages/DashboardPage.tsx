import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Globe, FolderOpen, Clock, Eye, Trash2, RefreshCw, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsApi, adminApi } from '../api/services';
import type { Document, AdminStats, DocType, DocStatus } from '../types';
import { useAuthStore } from '../store/authStore';
import { StatusBadge, TypeBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime, formatBytes, getErrorMessage } from '../utils/helpers';

export function DashboardPage() {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);

  // Table state
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [pages, setPages] = useState(1);
  const [sortBy, setSortBy] = useState('last_updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUser, setFilterUser] = useState('');

  // Modals
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await documentsApi.list({
        page, per_page: perPage, sort_by: sortBy, sort_dir: sortDir,
        type: filterType, status: filterStatus, created_by: filterUser,
      });
      setDocs(data.documents);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortDir, filterType, filterStatus, filterUser]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  useEffect(() => {
    if (!isAdmin()) return;
    adminApi.stats().then(({ data }) => setStats(data)).catch(() => {});
  }, [isAdmin]);

  function handleSort(col: string) {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
    setPage(1);
  }

  function SortIcon({ col }: { col: string }) {
    if (sortBy !== col) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-brand" /> : <ChevronDown size={12} className="text-brand" />;
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await documentsApi.delete(deleteId);
      toast.success('Document deleted');
      setDeleteId(null);
      fetchDocs();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleView(doc: Document) {
    setViewLoading(true);
    setViewDoc(doc);
    try {
      const { data } = await documentsApi.get(doc.id);
      setViewDoc(data);
    } catch { /* keep showing basic info */ }
    finally { setViewLoading(false); }
  }

  async function handleReScrape(doc: Document) {
    try {
      await documentsApi.triggerScrape(doc.id);
      toast.success('Re-scrape queued');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      {/* Stat cards — admin only */}
      {isAdmin() && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Documents" value={stats?.total_documents ?? '—'} sub={`${stats?.active_documents ?? 0} active`} icon={<FileText size={18} />} />
          <StatCard label="URL Documents" value={stats?.url_documents ?? '—'} sub="Scraped from web" icon={<Globe size={18} />} />
          <StatCard label="Uploaded Files" value={stats ? (stats.total_documents - stats.url_documents) : '—'} sub="PDF · Excel · MD" icon={<FolderOpen size={18} />} />
          <StatCard label="Registered Users" value={stats?.total_users ?? '—'} sub="All roles" icon={<Clock size={18} />} />
        </div>
      )}

      {/* Documents table */}
      <div className="card">
        <div className="card-header">
          <FileText size={15} className="text-gray-400" />
          <span className="card-title">Documents</span>
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary btn btn-sm" onClick={fetchDocs}><RefreshCw size={13} /></button>
            <button className="btn-primary btn btn-sm" onClick={() => navigate('/add-url')}>
              <Plus size={13} /> Add Document
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <select className="select h-8 text-xs" value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All types</option>
            {(['url','pdf','excel','md'] as DocType[]).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
          <select className="select h-8 text-xs" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            {(['active','pending','removed','url_unavailable'] as DocStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {isAdmin() && (
            <input
              type="text"
              placeholder="Filter by username…"
              className="input h-8 text-xs w-40"
              value={filterUser}
              onChange={(e) => { setFilterUser(e.target.value); setPage(1); }}
            />
          )}
          {(filterType || filterStatus || filterUser) && (
            <button className="btn-ghost btn btn-sm text-xs" onClick={() => { setFilterType(''); setFilterStatus(''); setFilterUser(''); setPage(1); }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th cursor-pointer" onClick={() => handleSort('name')}>
                  <span className="flex items-center gap-1">Name <SortIcon col="name" /></span>
                </th>
                <th className="th">Type</th>
                {isAdmin() && <th className="th">Created By</th>}
                <th className="th cursor-pointer" onClick={() => handleSort('last_updated')}>
                  <span className="flex items-center gap-1">Last Updated <SortIcon col="last_updated" /></span>
                </th>
                <th className="th cursor-pointer" onClick={() => handleSort('next_scrape_at')}>
                  <span className="flex items-center gap-1">Next Update at <SortIcon col="next_scrape_at" /></span>
                </th>
                <th className="th cursor-pointer" onClick={() => handleSort('status')}>
                  <span className="flex items-center gap-1">Status <SortIcon col="status" /></span>
                </th>
                <th className="th">Schedule</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: perPage }).map((_, i) => <SkeletonRow key={i} cols={isAdmin() ? 7 : 6} />)
                : docs.length === 0
                ? (
                  <tr><td colSpan={isAdmin() ? 7 : 6}>
                    <EmptyState title="No documents found" description="Add a URL or upload a file to get started." />
                  </td></tr>
                )
                : docs.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-brand-lighter transition-colors">
                    <td className="td max-w-[260px]">
                      <div className="font-medium text-gray-900 truncate">{doc.name}</div>
                      {doc.source_url && (
                        <a href={doc.source_url} target="_blank" rel="noreferrer"
                          className="text-[11px] text-gray-400 hover:text-brand truncate block"
                          onClick={(e) => e.stopPropagation()}>
                          {doc.source_url.slice(0, 50)}{doc.source_url.length > 50 ? '…' : ''}
                        </a>
                      )}
                      {doc.file_size && <span className="text-[11px] text-gray-400">{formatBytes(doc.file_size)}</span>}
                    </td>
                    <td className="td"><TypeBadge type={doc.source_type} /></td>
                    {isAdmin() && (
                      <td className="td">
                        <span className="text-sm text-gray-700">{doc.created_by}</span>
                      </td>
                    )}
                    <td className="td text-xs text-gray-500 whitespace-nowrap">{formatDateTime(doc.last_updated)}</td>
                    <td className="td text-xs text-gray-500 whitespace-nowrap">
                      {doc.schedule?.next_scrape_at ? formatDateTime(doc.schedule.next_scrape_at)
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="td"><StatusBadge status={doc.status} /></td>
                    <td className="td">
                      {doc.schedule?.is_active
                        ? <span className="inline-flex items-center gap-1 text-[11px] bg-brand-light text-brand px-2 py-0.5 rounded-full font-medium">
                            <RefreshCw size={9} /> {doc.schedule.interval_days}d
                          </span>
                        : <span className="text-gray-300 text-xs">—</span>
                      }
                    </td>
                    <td className="td">
                      <div className="flex gap-1">
                        {isAdmin() && (
                          <button title="View content" className="btn-ghost btn btn-sm px-1.5" onClick={() => handleView(doc)}>
                            <Eye size={13} />
                          </button>
                        )}
                        {doc.source_type === 'url' && (
                          <button title="Re-scrape" className="btn-ghost btn btn-sm px-1.5" onClick={() => handleReScrape(doc)}>
                            <RefreshCw size={13} />
                          </button>
                        )}
                        <button
                          title="Delete"
                          className="btn-danger btn btn-sm px-1.5"
                          onClick={() => { setDeleteId(doc.id); setDeleteName(doc.name); }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <Pagination page={page} pages={pages} total={total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        message={`Are you sure you want to delete "${deleteName}"? This cannot be undone.`}
      />

      {/* View document */}
      <Modal
        open={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.name ?? ''}
        subtitle={viewDoc ? `${viewDoc.source_type.toUpperCase()} · ${formatDateTime(viewDoc.last_updated)}` : ''}
        footer={<button className="btn-secondary btn" onClick={() => setViewDoc(null)}>Close</button>}
      >
        {viewLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : (
          <>
            {viewDoc?.source_url && (
              <a href={viewDoc.source_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand hover:underline mb-3 block">
                {viewDoc.source_url}
              </a>
            )}
            <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto font-sans">
              {viewDoc?.content || 'No content available.'}
            </pre>
          </>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ label, value, sub, icon }: { label: string; value: number | string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-[11px] text-gray-400 mt-1">{sub}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-brand-light text-brand flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
      </div>
    </div>
  );
}
