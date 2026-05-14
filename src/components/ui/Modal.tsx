import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className={cn(
          'relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-lg shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}>
          {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
