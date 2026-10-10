import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  category: string;
  items: Array<{ keys: string[]; description: string }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
      category: 'Navigation & Modules',
      items: [
        { keys: ['Alt', 'D'], description: 'Open Dashboard' },
        { keys: ['Alt', 'P'], description: 'Open Patients & Intake' },
        { keys: ['Alt', 'A'], description: 'Open Appointments' },
        { keys: ['Alt', 'Q'], description: 'Open Live Queue' },
        { keys: ['Alt', 'C'], description: 'Open Clinical Consultation' },
        { keys: ['Alt', 'R'], description: 'Open Prescriptions (Rx)' },
        { keys: ['Alt', 'B'], description: 'Open Billing & Invoices' },
        { keys: ['Alt', 'N'], description: 'Open Payments & Ledger' },
        { keys: ['Alt', 'S'], description: 'Open Settings & Configuration' },
      ]
    },
    {
      category: 'Quick Actions & System',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Focus Global Search Bar' },
        { keys: ['?'], description: 'Toggle Keyboard Shortcuts Help' },
        { keys: ['Esc'], description: 'Close Modals / Dismiss Dialogs' },
      ]
    }
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-serif">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-medical-primary/10 text-medical-primary flex items-center justify-center">
                <Keyboard size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">Keyboard Navigation & Shortcuts</h3>
                <p className="text-[11px] text-slate-500 font-sans">Navigate MedFlow Pro instantly using hotkeys</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Close shortcuts modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 font-sans">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.category} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.category}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {group.items.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 flex items-center justify-between gap-3"
                    >
                      <span className="text-xs text-slate-700 font-medium">{shortcut.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((key, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-mono font-bold text-slate-800 shadow-2xs min-w-[22px] text-center"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="bg-medical-primary/5 border border-medical-primary/20 rounded-xl p-3.5 flex items-start gap-3">
              <Sparkles size={18} className="text-medical-primary shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Tip: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono font-bold text-[10px]">?</kbd> anywhere in MedFlow Pro to open this cheat sheet instantly.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
            <span>Enterprise Keyboard Accessibility</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              Got It
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
