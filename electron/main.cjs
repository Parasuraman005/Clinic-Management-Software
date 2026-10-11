const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

// Single instance lock to prevent duplicate app instances
const gotTheLock = app.requestSingleInstanceLock();

let mainWindow = null;

// Remove default application menu completely (File, Edit, View, Help)
Menu.setApplicationMenu(null);

// Configure autoUpdater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;
// Logging
autoUpdater.logger = {
  info: (msg) => console.log(`[AutoUpdater INFO] ${msg}`),
  warn: (msg) => console.warn(`[AutoUpdater WARN] ${msg}`),
  error: (msg) => console.error(`[AutoUpdater ERROR] ${msg}`),
};

function setupAutoUpdater() {
  // Only execute update checking when the app is packaged
  if (!app.isPackaged) {
    console.log('[AutoUpdater] Development mode detected: Auto-update checking disabled.');
    return;
  }

  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Checking for updates on GitHub Releases...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log(`[AutoUpdater] Update available: v${info.version}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log(`[AutoUpdater] Application is up to date: v${info.version}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-update-not-available', {
        version: info.version,
      });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`[AutoUpdater] Download progress: ${Math.round(progressObj.percent)}%`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-download-progress', {
        percent: Math.round(progressObj.percent * 10) / 10,
        bytesPerSecond: progressObj.bytesPerSecond,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[AutoUpdater] Update downloaded successfully: v${info.version}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater-update-downloaded', {
        version: info.version,
        releaseNotes: info.releaseNotes,
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Error in update flow:', err ? err.message : 'Unknown error');
    if (mainWindow && !mainWindow.isDestroyed()) {
      // Safe sanitized error message for client UI
      const safeMessage = err && err.message && err.message.includes('net::ERR')
        ? 'Network connection issue while checking for updates. Will retry later.'
        : 'Unable to check or download update. MediFlow Clinic will continue running normally.';
      mainWindow.webContents.send('updater-error', safeMessage);
    }
  });

  // Initial check 5 seconds after startup to avoid competing with clinic initial load
  setTimeout(() => {
    try {
      autoUpdater.checkForUpdates().catch((err) => {
        console.warn('[AutoUpdater] Initial update check suppressed:', err?.message || err);
      });
    } catch (err) {
      console.warn('[AutoUpdater] Check initiation error:', err);
    }
  }, 5000);
}

function createWindow() {
  const isDev = process.env.ELECTRON === 'true' && !app.isPackaged;

  // Resolve application icon: prefer public/favicon.ico
  let appIconPath = path.join(__dirname, '../public/favicon.ico');
  if (!fs.existsSync(appIconPath)) {
    appIconPath = path.join(__dirname, '../dist/favicon.ico');
  }
  if (!fs.existsSync(appIconPath)) {
    appIconPath = path.join(__dirname, 'icon.ico');
  }
  if (!fs.existsSync(appIconPath) || (process.platform !== 'win32' && fs.existsSync(path.join(__dirname, 'icon.png')))) {
    appIconPath = path.join(__dirname, 'icon.png');
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    title: 'MediFlow Clinic - Clinical OPD & Hospital Management System',
    icon: appIconPath,
    frame: true, // Native Windows frame with standard minimize, maximize, and close controls
    autoHideMenuBar: true, // Completely hide default Electron menu bar
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  });

  // Explicitly remove window menu and guarantee no menu bar on Windows
  mainWindow.setMenu(null);
  if (typeof mainWindow.setMenuBarVisibility === 'function') {
    mainWindow.setMenuBarVisibility(false);
  }

  // Keyboard shortcut handlers for window lifecycle and actions
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Windows Exit shortcut: Alt+F4 or Ctrl+Q
    if ((input.alt && input.key.toLowerCase() === 'f4') || (input.control && input.key.toLowerCase() === 'q')) {
      event.preventDefault();
      app.quit();
      return;
    }

    // Print shortcut: Ctrl+P
    if (input.control && input.key.toLowerCase() === 'p') {
      event.preventDefault();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.print({ silent: false, printBackground: true });
      }
      return;
    }

    // Reload shortcuts in development mode: Ctrl+R or F5
    if (isDev && (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r'))) {
      event.preventDefault();
      mainWindow.reload();
      return;
    }

    // Toggle DevTools in development mode: F12 or Ctrl+Shift+I
    if (isDev && (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i'))) {
      event.preventDefault();
      mainWindow.webContents.toggleDevTools();
      return;
    }
  });

  // Track window maximize / unmaximize events for renderer state
  mainWindow.on('maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximize-changed', true);
    }
  });
  mainWindow.on('unmaximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('window-maximize-changed', false);
    }
  });

  // Intercept new window requests and open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const parsedUrl = new URL(url);
      if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
        shell.openExternal(url).catch((err) => console.warn('[Electron] Failed to open external URL:', err));
      }
    } catch (e) {
      console.warn('[Electron] Invalid external link URL:', url);
    }
    return { action: 'deny' };
  });

  // Safe navigation handler
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const isLocalhost = navigationUrl.startsWith('http://localhost:3000') || navigationUrl.startsWith('http://127.0.0.1:3000');
    const isFile = navigationUrl.startsWith('file://');
    if (!isLocalhost && !isFile) {
      event.preventDefault();
      try {
        const parsedUrl = new URL(navigationUrl);
        if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
          shell.openExternal(navigationUrl).catch((err) => console.warn('[Electron] Failed to open URL in browser:', err));
        }
      } catch (e) {
        console.warn('[Electron] Invalid navigation URL:', navigationUrl);
      }
    }
  });

  // Gracefully handle render process load failures
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    if (errorCode === -3) return; // ERR_ABORTED - benign abort during redirects
    console.warn(`[Electron] Page failed to load (code: ${errorCode}): ${errorDescription}`);
  });

  // Load Dev Server or Production Build
  if (isDev) {
    const devServerUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    console.log(`[Electron] Loading Vite Dev Server at ${devServerUrl}`);
    mainWindow.loadURL(devServerUrl).catch(() => {
      // Retry loading if dev server is still starting
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(devServerUrl).catch((err) => {
            console.error('[Electron] Dev server connection retry failed:', err?.message || err);
          });
        }
      }, 1500);
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (!fs.existsSync(indexPath)) {
      console.error(`[Electron Error] Build file not found at ${indexPath}`);
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>MediFlow Clinic - Distribution Build Missing</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 520px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            h2 { color: #38bdf8; margin-top: 0; font-size: 22px; }
            p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
            code { background: #0f172a; padding: 4px 8px; border-radius: 6px; color: #38bdf8; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Production Build Not Found</h2>
            <p>The application bundle (<code>dist/index.html</code>) was not found. Please compile the web distribution first using <code>npm run build</code> or install the official release package.</p>
          </div>
        </body>
        </html>
      `;
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fallbackHtml)}`);
    } else {
      console.log(`[Electron] Loading production bundle: ${indexPath}`);
      mainWindow.loadFile(indexPath).catch((err) => {
        console.error('[Electron] Failed to load production bundle:', err);
      });
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Setup IPC Handlers
    ipcMain.handle('window-minimize', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
    });

    ipcMain.handle('window-maximize', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
          return false;
        } else {
          mainWindow.maximize();
          return true;
        }
      }
      return false;
    });

    ipcMain.handle('window-close', () => {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
    });

    ipcMain.handle('app-exit', () => {
      app.quit();
    });

    ipcMain.handle('window-is-maximized', () => {
      return mainWindow && !mainWindow.isDestroyed() ? mainWindow.isMaximized() : false;
    });

    ipcMain.handle('app-get-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('open-external-url', async (_event, url) => {
      if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:'))) {
        await shell.openExternal(url);
        return true;
      }
      return false;
    });

    ipcMain.handle('window-print', async (_event, options = {}) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        return new Promise((resolve) => {
          mainWindow.webContents.print(
            {
              silent: options.silent || false,
              printBackground: options.printBackground !== false,
            },
            (success, failureReason) => {
              if (!success) {
                console.warn('[Electron] Print failed:', failureReason);
              }
              resolve(success);
            }
          );
        });
      }
      return false;
    });

    ipcMain.handle('get-system-info', () => {
      return {
        appVersion: app.getVersion(),
        platform: process.platform,
        arch: process.arch,
        isPackaged: app.isPackaged,
      };
    });

    ipcMain.handle('show-save-dialog', async (_event, options = {}) => {
      if (!mainWindow || mainWindow.isDestroyed()) return { canceled: true };
      return await dialog.showSaveDialog(mainWindow, {
        title: options?.title || 'Save File',
        defaultPath: options?.defaultPath || 'document.pdf',
        filters: options?.filters || [{ name: 'All Files', extensions: ['*'] }],
      });
    });

    // Auto-updater IPC handlers
    ipcMain.handle('app-check-for-updates', async () => {
      if (!app.isPackaged) {
        return {
          success: false,
          message: 'Auto-update is disabled in development mode. Only packaged builds check GitHub Releases.',
        };
      }
      try {
        const result = await autoUpdater.checkForUpdates();
        return { success: true, version: result?.updateInfo?.version };
      } catch (err) {
        console.warn('[AutoUpdater] Manual check failed:', err?.message || err);
        return {
          success: false,
          message: 'Unable to check for updates right now. Please check your internet connection.',
        };
      }
    });

    ipcMain.handle('app-start-download-update', async () => {
      if (!app.isPackaged) return false;
      try {
        await autoUpdater.downloadUpdate();
        return true;
      } catch (err) {
        console.error('[AutoUpdater] Download failed:', err);
        return false;
      }
    });

    ipcMain.handle('app-quit-and-install', () => {
      if (!app.isPackaged) return;
      try {
        // isSilent = false, isForceRunAfter = true
        autoUpdater.quitAndInstall(false, true);
      } catch (err) {
        console.error('[AutoUpdater] Quit and install failed:', err);
      }
    });

    createWindow();
    setupAutoUpdater();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}
