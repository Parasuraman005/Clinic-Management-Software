import React from 'react';
import { motion } from 'motion/react';
import { FileQuestion, Home, Search, ShieldAlert } from 'lucide-react';

interface NotFoundProps {
  setActiveTab: (tab: string) => void;
}

const NotFound: React.FC<NotFoundProps> = ({ setActiveTab }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        {/* Top accent badge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-medical-primary" />

        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FileQuestion size={40} />
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800 mt-1">Page Not Found</h2>
        
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          The clinical record, module, or URL you are attempting to access does not exist or has been relocated within the MediFlow Pro network.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 bg-medical-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-medical-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>Return to Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('patients')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Search size={15} />
            <span>Search Patients</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldAlert size={14} className="text-amber-500" />
          <span>Error Code: HTTP_404_NOT_FOUND</span>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
