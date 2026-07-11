import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-2xl',
}: ModalProps) {
  // Lock body scroll without causing layout shift
  useEffect(() => {
    if (open) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-[-2.5rem] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth}
          flex flex-col max-h-[88vh]
          ring-1 ring-black/5
        `}
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-[15px] font-semibold text-gray-900 leading-snug truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                       text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-blue-600">
            {children}
          </div>
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-2 px-6 py-3.5 border-t border-gray-100 flex-shrink-0 bg-gray-50/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
