import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Home, Plus, Printer } from 'lucide-react';

interface ThankYouProps {
  setActiveTab: (tab: string) => void;
  submissionTitle?: string;
  referenceId?: string;
  onNewSubmission?: () => void;
}

const ThankYou: React.FC<ThankYouProps> = ({
  setActiveTab,
  submissionTitle = 'Clinical Record & Form Submitted Successfully',
  referenceId = '#MED-98421-EHR',
  onNewSubmission
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] p-6 text-center font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative overflow-hidden"
      >
        {/* Top accent badge */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-medical-primary" />

        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce duration-1000">
          <CheckCircle2 size={40} />
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Thank You!</h1>
        <h2 className="text-xs font-bold text-emerald-700 mt-1 uppercase tracking-wider">{submissionTitle}</h2>
        
        <p className="text-xs text-slate-500 mt-3 leading-relaxed">
          Your data has been securely verified, encrypted, and recorded in the MediFlow Pro central database.
        </p>

        <div className="mt-6 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-mono text-slate-700">
          <span className="text-slate-400">Reference ID:</span>
          <strong className="text-medical-primary">{referenceId}</strong>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-5 py-2.5 bg-medical-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-medical-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <Home size={15} />
            <span>Dashboard</span>
          </button>
          
          {onNewSubmission && (
            <button
              onClick={onNewSubmission}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              <span>New Entry</span>
            </button>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button 
            onClick={() => window.print()}
            className="hover:text-medical-primary transition-colors flex items-center gap-1"
          >
            <Printer size={13} />
            <span>Print Receipt</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
