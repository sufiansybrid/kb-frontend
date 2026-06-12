import { useEffect, useState, useCallback } from 'react';
import { ClipboardList, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../api/services';
import type { ScrapeLog } from '../types';
import { Pagination } from '../components/ui/Pagination';
import { SkeletonRow } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDateTime } from '../utils/helpers';

export function AdminLogsPage() {
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.logs({ page, per_page: perPage, status: statusFilter });
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const pages = Math.ceil(total / perPage);

  return (
    <div className="space-y-5">
      <div className="card">
        <div className="card-header">
          <ClipboardList size={15} className="text-gray-400" />
          <span className="card-title">Scrape Job History</span>
          <div className="ml-auto flex gap-2">
            <button className="btn-secondary btn btn-sm" onClick={fetchLogs}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
          <select className="select h-8 text-xs" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <div className="ml-auto text-xs text-gray-400 flex items-center">{total} total entries</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="th">Document</th>
                <th className="th">Scraped At</th>
                <th className="th">Status</th>
                <th className="th">Message</th>
                <th className="th">Duration</th>
                <th className="th">Words</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                : logs.length === 0
                ? <tr><td colSpan={6}><EmptyState title="No scrape logs yet" description="Logs appear after URLs are scraped." /></td></tr>
                : logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="td max-w-[200px]">
                      <span className="text-sm font-medium text-gray-900 truncate block">{log.document_name ?? `#${log.document_id}`}</span>
                    </td>
                    <td className="td text-xs text-gray-500 whitespace-nowrap">{formatDateTime(log.scraped_at)}</td>
                    <td className="td">
                      {log.status === 'success'
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Success</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full"><XCircle size={10} /> Failed</span>
                      }
                    </td>
                    <td className="td text-xs text-gray-500 max-w-[280px]">
                      <span className="truncate block">{log.message ?? '—'}</span>
                    </td>
                    <td className="td text-xs text-gray-500 whitespace-nowrap">
                      {log.duration_ms != null ? `${(log.duration_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="td text-xs text-gray-500">
                      {log.words_extracted != null ? log.words_extracted.toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

        <Pagination page={page} pages={pages} total={total} perPage={perPage} onPageChange={setPage} onPerPageChange={setPerPage} />
      </div>
    </div>
  );
}
