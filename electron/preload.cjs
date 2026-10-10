const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer safely with context isolation
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  close: () => ipcRenderer.invoke('window-close'),
  exitApp: () => ipcRenderer.invoke('app-exit'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  
  // App info and operations
  getVersion: () => ipcRenderer.invoke('app-get-version'),
  openExternal: (url) => ipcRenderer.invoke('open-external-url', url),
  print: (options) => ipcRenderer.invoke('window-print', options),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Window maximize listener
  onMaximizeChange: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const subscription = (_event, isMaximized) => callback(isMaximized);
    ipcRenderer.on('window-maximize-changed', subscription);
    return () => {
      ipcRenderer.removeListener('window-maximize-changed', subscription);
    };
  },

  // Auto-updater methods
  checkForUpdates: () => ipcRenderer.invoke('app-check-for-updates'),
  startDownloadUpdate: () => ipcRenderer.invoke('app-start-download-update'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('app-quit-and-install'),

  // Auto-updater event listeners
  onUpdateAvailable: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const subscription = (_event, info) => callback(info);
    ipcRenderer.on('updater-update-available', subscription);
    return () => {
      ipcRenderer.removeListener('updater-update-available', subscription);
    };
  },
  onUpdateNotAvailable: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const subscription = (_event, info) => callback(info);
    ipcRenderer.on('updater-update-not-available', subscription);
    return () => {
      ipcRenderer.removeListener('updater-update-not-available', subscription);
    };
  },
  onUpdateProgress: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const subscription = (_event, progress) => callback(progress);
    ipcRenderer.on('updater-download-progress', subscription);
    return () => {
      ipcRenderer.removeListener('updater-download-progress', subscription);
    };
  },
  onUpdateDownloaded: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const subscription = (_event, info) => callback(info);
    ipcRenderer.on('updater-update-downloaded', subscription);
    return () => {
      ipcRenderer.removeListener('updater-update-downloaded', subscription);
    };
  },
  onUpdateError: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const subscription = (_event, error) => callback(error);
    ipcRenderer.on('updater-error', subscription);
    return () => {
      ipcRenderer.removeListener('updater-error', subscription);
    };
  }
});
