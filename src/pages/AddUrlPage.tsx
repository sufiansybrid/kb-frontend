import { useState } from 'react';
import { Link2, Plus, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsApi } from '../api/services';
import { Toggle } from '../components/ui/Toggle';
import { getErrorMessage } from '../utils/helpers';

const INTERVALS = [
  { value: 1,  label: 'Every 1 day'   },
  { value: 3,  label: 'Every 3 days'  },
  { value: 7,  label: 'Every 7 days'  },
  { value: 14, label: 'Every 14 days' },
  { value: 30, label: 'Every 30 days' },
];

export function AddUrlPage() {
  const [mode,         setMode]         = useState<'single' | 'bulk'>('single');
  const [singleUrl,    setSingleUrl]    = useState('');
  const [bulkUrls,     setBulkUrls]     = useState('');
  const [autoScrape,   setAutoScrape]   = useState(true);
  const [intervalDays, setIntervalDays] = useState(7);
  const [autoRemove,   setAutoRemove]   = useState(false);
  const [loading,      setLoading]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rawUrls = mode === 'single'
      ? [singleUrl.trim()]
      : bulkUrls.split('\n').map((u) => u.trim()).filter(Boolean);

    const urls = rawUrls.filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    });

    if (urls.length === 0) { toast.error('Please enter at least one valid URL'); return; }
    if (urls.length < rawUrls.length) {
      toast(`${rawUrls.length - urls.length} invalid URL(s) skipped`, { icon: '⚠️' });
    }

    setLoading(true);
    try {
      const { data } = await documentsApi.addUrls({
        urls, auto_scrape: autoScrape, interval_days: intervalDays, auto_remove: autoRemove,
      });
      toast.success(data.message);
      setSingleUrl('');
      setBulkUrls('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <nav className="text-xs text-gray-500 flex gap-1.5 items-center">
        <a href="/" className="text-brand hover:underline">Dashboard</a>
        <span>/</span>
        <span>Add URL</span>
      </nav>

      <div className="card">
        <div className="card-header">
          <Link2 size={15} className="text-gray-400" />
          <span className="card-title">Add URLs to Knowledge Base</span>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">

          {/* ── URL input + single/bulk toggle ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">URL(s)</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                {(['single', 'bulk'] as const).map((m) => (
                  <button
                    type="button" key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      mode === m ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {m === 'single' ? 'Single URL' : 'Bulk paste'}
                  </button>
                ))}
              </div>
            </div>

            {mode === 'single' ? (
              <input
                type="url" className="input"
                placeholder="https://example.com/page"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                required
              />
            ) : (
              <>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm
                             text-gray-900 placeholder-gray-400 resize-none
                             focus:outline-none focus:ring-2 focus:ring-brand
                             focus:border-transparent transition"
                  rows={6}
                  placeholder={"Paste one URL per line:\nhttps://docs.example.com/guide\nhttps://blog.example.com/post-1"}
                  value={bulkUrls}
                  onChange={(e) => setBulkUrls(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info size={11} /> Each line is scraped as a separate document. Max 50 URLs.
                </p>
              </>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* ── Scraping settings with polished toggles ── */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Scraping settings</p>

            <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">

              {/* Auto-scrape row */}
              <div className="flex items-center gap-4 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                <Toggle checked={autoScrape} onChange={setAutoScrape} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    Auto-scrape schedule
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Periodically re-scrape and refresh document content
                  </p>
                </div>
                {autoScrape && (
                  <select
                    className="select h-8 text-xs flex-shrink-0"
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Number(e.target.value))}
                  >
                    {INTERVALS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Auto-remove row */}
              <div className="flex items-center gap-4 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors">
                <Toggle checked={autoRemove} onChange={setAutoRemove} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 leading-tight">
                    Auto-remove on 404
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {autoRemove
                      ? 'Document will be permanently removed if the URL returns 404'
                      : 'Document kept but flagged as "URL Unavailable" if unreachable'}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                  autoRemove
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {autoRemove ? 'DELETE' : 'KEEP'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary btn" disabled={loading}>
              <Plus size={14} />
              {loading ? 'Queuing…' : 'Add to Knowledge Base'}
            </button>
            <button
              type="button" className="btn-secondary btn"
              onClick={() => { setSingleUrl(''); setBulkUrls(''); }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
