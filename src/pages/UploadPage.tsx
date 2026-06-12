import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, FileSpreadsheet, File, CloudUpload, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentsApi } from '../api/services';
import { getErrorMessage, formatBytes } from '../utils/helpers';

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

interface QueueFile {
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return <FileText size={20} className="text-red-500" />;
  if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet size={20} className="text-green-600" />;
  return <File size={20} className="text-purple-600" />;
}

export function UploadPage() {
  const [queue, setQueue] = useState<QueueFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newItems: QueueFile[] = accepted.map((f) => ({ file: f, status: 'pending', progress: 0 }));
    setQueue((q) => [...q, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'], 'text/markdown': ['.md'], 'text/plain': ['.md'] },
    multiple: true,
  });

  function removeFile(i: number) {
    setQueue((q) => q.filter((_, idx) => idx !== i));
  }

  async function handleUpload() {
    const pending = queue.filter((q) => q.status === 'pending');
    if (!pending.length) { toast.error('No files to upload'); return; }

    setUploading(true);

    // Simulate per-file progress, then do one batch call
    setQueue((q) => q.map((item) =>
      item.status === 'pending' ? { ...item, status: 'uploading', progress: 10 } : item
    ));

    // Animate progress
    const interval = setInterval(() => {
      setQueue((q) => q.map((item) =>
        item.status === 'uploading' ? { ...item, progress: Math.min(item.progress + 15, 90) } : item
      ));
    }, 300);

    try {
      const { data } = await documentsApi.upload(pending.map((q) => q.file));
      clearInterval(interval);

      setQueue((q) => q.map((item) => {
        if (item.status !== 'uploading') return item;
        const hasError = data.errors.some((e: string) => e.startsWith(item.file.name));
        return { ...item, status: hasError ? 'error' : 'done', progress: 100, error: hasError ? 'Upload failed' : undefined };
      }));

      toast.success(data.message);
      if (data.errors.length) toast.error(`${data.errors.length} file(s) had errors`);
    } catch (err) {
      clearInterval(interval);
      setQueue((q) => q.map((item) =>
        item.status === 'uploading' ? { ...item, status: 'error', error: getErrorMessage(err) } : item
      ));
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  function clearDone() {
    setQueue((q) => q.filter((f) => f.status !== 'done'));
  }

  return (
    <div className="max-w-2xl space-y-5">
      <nav className="text-xs text-gray-500 flex gap-1.5 items-center">
        <a href="/" className="text-brand hover:underline">Dashboard</a>
        <span>/</span><span>Upload Files</span>
      </nav>

      <div className="card">
        <div className="card-header">
          <Upload size={15} className="text-gray-400" />
          <span className="card-title">Upload Documents</span>
        </div>

        <div className="p-5 space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-brand bg-brand-light' : 'border-gray-200 hover:border-brand hover:bg-brand-light'}`}
          >
            <input {...getInputProps()} />
            <CloudUpload size={40} className={`mx-auto mb-3 ${isDragActive ? 'text-brand' : 'text-gray-300'}`} />
            <p className="text-sm font-semibold text-gray-700 mb-1">
              {isDragActive ? 'Drop files here…' : 'Drop files or click to browse'}
            </p>
            <p className="text-xs text-gray-400">Supports PDF, Excel (.xlsx / .xls), Markdown (.md)</p>
            <div className="flex gap-2 justify-center mt-4">
              {[['PDF', 'text-red-500'], ['Excel', 'text-green-600'], ['Markdown', 'text-purple-600']].map(([t, c]) => (
                <span key={t} className={`text-xs font-medium border border-gray-200 rounded px-2 py-0.5 ${c}`}>{t}</span>
              ))}
            </div>
          </div>

          {/* Queue */}
          {queue.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">Upload queue ({queue.length})</p>
                <button className="btn-ghost btn btn-sm text-xs" onClick={clearDone}>Clear done</button>
              </div>
              <div className="space-y-2">
                {queue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    {fileIcon(item.file.name)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{formatBytes(item.file.size)}</span>
                      </div>
                      {item.status !== 'pending' && (
                        <div className="mt-1.5">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${item.status === 'error' ? 'bg-red-500' : item.status === 'done' ? 'bg-green-500' : 'bg-brand'}`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {item.error && <p className="text-xs text-red-500 mt-1">{item.error}</p>}
                    </div>
                    <div className="flex-shrink-0">
                      {item.status === 'done' && <CheckCircle size={16} className="text-green-500" />}
                      {item.status === 'error' && <AlertCircle size={16} className="text-red-500" />}
                      {(item.status === 'pending') && (
                        <button className="btn-ghost btn p-1" onClick={() => removeFile(i)}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-3">
                <button className="btn-primary btn" onClick={handleUpload} disabled={uploading || queue.every(q => q.status !== 'pending')}>
                  <Upload size={14} /> {uploading ? 'Uploading…' : `Upload ${queue.filter(q => q.status === 'pending').length} file(s)`}
                </button>
                <button className="btn-secondary btn" onClick={() => setQueue([])} disabled={uploading}>
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
