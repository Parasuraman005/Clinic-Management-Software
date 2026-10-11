import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, RefreshCw, CheckCircle2, 
  AlertCircle, X, ShieldCheck, ChevronDown, ChevronUp 
} from 'lucide-react';
import { UpdateInfo, UpdateProgress } from '../types/electron';

export const UpdateModal: React.FC = () => {
  const [isElectron, setIsElectron] = useState<boolean>(false);
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [status, setStatus] = useState<'idle' | 'available' | 'downloading' | 'downloaded' | 'error' | 'upToDate'>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [minimized, setMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI?.isElectron) {
      return;
    }

    setIsElectron(true);
    window.electronAPI.getVersion().then(setCurrentVersion).catch(() => {});

    // Listeners
    const unsubAvailable = window.electronAPI.onUpdateAvailable((info) => {
      setUpdateInfo(info);
      setStatus('available');
      setMinimized(false);
    });

    const unsubNotAvailable = window.electronAPI.onUpdateNotAvailable((info) => {
      // Only show upToDate banner if previously checking or idle
      setUpdateInfo(info);
      setStatus('upToDate');
      setTimeout(() => {
        setStatus((prev) => (prev === 'upToDate' ? 'idle' : prev));
      }, 4000);
    });

    const unsubProgress = window.electronAPI.onUpdateProgress((prog) => {
      setProgress(prog);
      setStatus('downloading');
    });

    const unsubDownloaded = window.electronAPI.onUpdateDownloaded((info) => {
      setUpdateInfo(info);
      setStatus('downloaded');
      setMinimized(false);
    });

    const unsubError = window.electronAPI.onUpdateError((err) => {
      setErrorMessage(err);
      setStatus('error');
    });

    return () => {
      if (unsubAvailable) unsubAvailable();
      if (unsubNotAvailable) unsubNotAvailable();
      if (unsubProgress) unsubProgress();
      if (unsubDownloaded) unsubDownloaded();
      if (unsubError) unsubError();
    };
  }, []);

  if (!isElectron || status === 'idle') {
    return null;
  }

  const handleStartDownload = async () => {
    if (!window.electronAPI) return;
    setStatus('downloading');
    await window.electronAPI.startDownloadUpdate();
  };

  const handleRestartAndInstall = async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.quitAndInstallUpdate();
  };

  const handleDismiss = () => {
    setStatus('idle');
  };

  // Minimized badge during background download
  if (minimized && status === 'downloading') {
    return (
      <div 
        onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-teal-500/30 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 cursor-pointer hover:border-teal-400 transition-all font-sans text-xs select-none"
      >
        <RefreshCw size={15} className="animate-spin text-teal-400" />
        <span className="font-semibold text-slate-200">
          Downloading MediFlow Update: {progress?.percent || 0}%
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
          className="text-slate-400 hover:text-white"
        >
          <ChevronUp size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                MediFlow Clinic
              </h3>
              <span className="text-[10px] text-teal-400 font-medium">
                Automatic Update Manager
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors"
            title="Dismiss update dialog"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Status: Available */}
          {status === 'available' && (
            <>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-semibold">
                  <ShieldCheck size={12} />
                  New Version Available
                </div>
                <h4 className="text-base font-bold text-white pt-1">
                  MediFlow Clinic v{updateInfo?.version}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A new production release is ready. You can safely download and install it at your convenience without interrupting ongoing patient care.
                </p>
                <p className="text-[11px] text-slate-400">
                  Currently installed: <span className="font-mono text-slate-300">v{currentVersion}</span>
                </p>
              </div>

              {updateInfo?.releaseNotes && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center justify-between w-full text-slate-300 font-semibold hover:text-white"
                  >
                    <span>What's new in v{updateInfo.version}</span>
                    {showNotes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showNotes && (
                    <div className="mt-2 text-slate-400 max-h-28 overflow-y-auto pr-1 text-[11px] space-y-1">
                      {Array.isArray(updateInfo.releaseNotes) ? (
                        updateInfo.releaseNotes.map((note, i) => <p key={i}>• {note}</p>)
                      ) : (
                        <p>{updateInfo.releaseNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  Later
                </button>
                <button
                  onClick={handleStartDownload}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-xl transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download Update</span>
                </button>
              </div>
            </>
          )}

          {/* Status: Downloading */}
          {status === 'downloading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Downloading Update...
                  </h4>
                  <p className="text-xs text-slate-400">
                    MediFlow Clinic v{updateInfo?.version || 'Latest'}
                  </p>
                </div>
                <span className="text-base font-bold font-mono text-teal-400">
                  {progress ? `${progress.percent}%` : 'Connecting...'}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-cyan-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress?.percent || 0}%` }}
                />
              </div>

              {progress && (
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    {(progress.transferred / (1024 * 1024)).toFixed(1)} MB / {(progress.total / (1024 * 1024)).toFixed(1)} MB
                  </span>
                  <span>
                    {(progress.bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s
                  </span>
                </div>
              )}

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3 text-[11px] text-slate-300">
                You can continue registering patients and consulting. The download will run in the background.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setMinimized(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  Work in Background
                </button>
              </div>
            </div>
          )}

          {/* Status: Downloaded */}
          {status === 'downloaded' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Update Ready to Install
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    MediFlow Clinic v{updateInfo?.version || 'new version'} has been downloaded and verified. Restart the application now to complete the update.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    All clinic database records and local storage will remain fully preserved.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  Later (Update on Exit)
                </button>
                <button
                  onClick={handleRestartAndInstall}
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Restart & Update</span>
                </button>
              </div>
            </div>
          )}

          {/* Status: Error */}
          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Update Check Notice
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {errorMessage || 'Unable to reach the update server. MediFlow will continue working normally offline.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Status: Up To Date */}
          {status === 'upToDate' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    You're Up to Date!
                  </h4>
                  <p className="text-xs text-slate-300">
                    MediFlow Clinic v{currentVersion} is the latest version.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  onClick={handleDismiss}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateModal;
