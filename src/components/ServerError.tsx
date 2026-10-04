import React from 'react';
import { motion } from 'motion/react';
import { ServerCrash, RefreshCw, Home, LifeBuoy } from 'lucide-react';

interface ServerErrorProps {
  setActiveTab: (tab: string) => void;
  onRetry?: () => void;
}

const ServerError: React.FC<ServerErrorProps> = ({ setActiveTab, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        {/* Top accent badge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-500" />

        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <ServerCrash size={40} />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">500</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-1">Internal Server Error</h2>
        
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          The secure EHR database node experienced an unexpected interruption or timeout. Our automated cluster recovery has logged the event.
        </p>

        <div className="mt-6 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left font-mono text-[10px] text-slate-600 space-y-1">
          <p><strong className="text-rose-600">ERROR:</strong> ERR_CLINICAL_CLUSTER_TIMEOUT</p>
          <p><strong className="text-slate-700">NODE:</strong> BLR-PRIMARY-01</p>
          <p><strong className="text-slate-700">TIMESTAMP:</strong> {new Date().toISOString()}</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              if (onRetry) onRetry();
              else window.location.reload();
            }}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={15} />
            <span>Retry Connection</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>Dashboard</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <LifeBuoy size={14} className="text-medical-primary" />
          <span>Need urgent help? Contact IT Support (Ext. 4040)</span>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerError;
