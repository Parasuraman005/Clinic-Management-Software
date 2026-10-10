import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, UserRound, FileText, CreditCard, Calendar } from 'lucide-react';

export interface SuggestionItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'patient' | 'doctor' | 'staff' | 'appointment' | 'billing' | 'prescription' | 'medicine' | 'service';
  tab?: string;
  payload?: any;
}

interface SearchSuggestionsProps {
  isVisible: boolean;
  suggestions: SuggestionItem[];
  onSelect: (item: SuggestionItem) => void;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ isVisible, suggestions, onSelect }) => {
  if (!isVisible || suggestions.length === 0) return null;

  const getIcon = (type: SuggestionItem['type']) => {
    switch (type) {
      case 'patient': return <User size={16} className="text-blue-500" />;
      case 'doctor': return <UserRound size={16} className="text-purple-500" />;
      case 'staff': return <User size={16} className="text-slate-500" />;
      case 'appointment': return <Calendar size={16} className="text-amber-500" />;
      case 'billing': return <CreditCard size={16} className="text-rose-500" />;
      case 'prescription': return <FileText size={16} className="text-emerald-500" />;
      case 'medicine': return <FileText size={16} className="text-indigo-500" />;
      case 'service': return <CreditCard size={16} className="text-amber-500" />;
      default: return <Search size={16} />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] max-h-[400px] overflow-y-auto"
      >
        <div className="p-2">
          {suggestions.map((item, i) => (
            <button
              key={`${item.type}-${item.id}-${i}`}
              onClick={() => onSelect(item)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11pt] font-bold text-slate-900 truncate uppercase tracking-tight">{item.title}</p>
                <p className="text-[9pt] text-slate-500 truncate font-medium">{item.subtitle} • <span className="uppercase text-[8pt] font-bold text-slate-400">{item.type}</span></p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchSuggestions;
