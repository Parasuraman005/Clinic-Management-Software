import React from 'react';
import { Loader2, FolderSearch, AlertTriangle, RefreshCw, Plus } from 'lucide-react';

export interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading clinical data...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center font-sans">
    <div className="w-12 h-12 bg-medical-primary/10 rounded-2xl flex items-center justify-center text-medical-primary mb-4">
      <Loader2 className="animate-spin" size={24} />
    </div>
    <p className="text-sm font-bold text-slate-700 tracking-tight">{message}</p>
    <p className="text-xs text-slate-400 mt-1">Please wait while we sync with the secure EHR database.</p>
  </div>
);

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are currently no items matching your filter or query in this view.',
  icon = <FolderSearch size={32} className="text-medical-primary" />,
  actionLabel,
  onAction
}) => (
  <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center bg-white border border-slate-200/80 rounded-3xl shadow-xs font-sans">
    <div className="w-16 h-16 bg-medical-primary/10 rounded-2xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
    <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-medical-primary text-white rounded-xl text-xs font-bold shadow-md hover:bg-medical-primary/90 transition-all flex items-center gap-2"
      >
        <Plus size={14} />
        <span>{actionLabel}</span>
      </button>
    )}
  </div>
);

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry
}) => (
  <div className="flex flex-col items-center justify-center min-h-[350px] p-8 text-center bg-rose-50/50 border border-rose-200 rounded-3xl font-sans">
    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
      <AlertTriangle size={32} />
    </div>
    <h3 className="text-base font-bold text-rose-900 mb-1">{title}</h3>
    <p className="text-xs text-rose-700 max-w-sm mb-6 leading-relaxed">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition-all flex items-center gap-2"
      >
        <RefreshCw size={14} />
        <span>Try Again</span>
      </button>
    )}
  </div>
);
