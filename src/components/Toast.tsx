import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <aside aria-label="Notifications" className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </aside>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />,
    error: <AlertCircle className="text-rose-500 shrink-0" size={20} />,
    warning: <AlertTriangle className="text-amber-500 shrink-0" size={20} />,
    info: <Info className="text-sky-500 shrink-0" size={20} />
  };

  const borders = {
    success: 'border-emerald-500/30 bg-emerald-50/95 text-emerald-950',
    error: 'border-rose-500/30 bg-rose-50/95 text-rose-950',
    warning: 'border-amber-500/30 bg-amber-50/95 text-amber-950',
    info: 'border-sky-500/30 bg-sky-50/95 text-sky-950'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md font-sans ${borders[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-wide">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs mt-0.5 opacity-90 leading-relaxed font-normal">{toast.message}</p>
        )}
      </div>
      <button 
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-500 hover:text-slate-900 shrink-0"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

export default ToastContainer;
