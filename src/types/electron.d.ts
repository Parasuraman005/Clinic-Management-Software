export interface UpdateInfo {
  version: string;
  releaseDate?: string;
  releaseNotes?: string | string[];
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  minimize: () => Promise<void>;
  maximize: () => Promise<boolean>;
  close: () => Promise<void>;
  exitApp: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  getVersion: () => Promise<string>;
  openExternal: (url: string) => Promise<boolean>;
  print: (options?: { silent?: boolean; printBackground?: boolean }) => Promise<boolean>;
  getSystemInfo: () => Promise<{ appVersion: string; platform: string; arch: string; isPackaged: boolean }>;
  showSaveDialog: (options?: { title?: string; defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }) => Promise<{ canceled: boolean; filePath?: string }>;
  onMaximizeChange: (callback: (isMaximized: boolean) => void) => () => void;

  // Auto-Updater APIs
  checkForUpdates: () => Promise<{ success: boolean; message?: string }>;
  startDownloadUpdate: () => Promise<boolean>;
  quitAndInstallUpdate: () => Promise<void>;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateNotAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateProgress: (callback: (progress: UpdateProgress) => void) => () => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateError: (callback: (error: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
