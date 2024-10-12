import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { removeIpcHandlers, setupAutoUpdater, setupIpcHandlers } from '../ipc/setup';
import { ipcService } from '../services/IpcService';
import { initSettings } from '../services/SetService';
import { logSend } from '../utils/logger';
import { closeDevToolsWindow, createDevToolsWindow } from './devToolsWindow';
let mainWindow: BrowserWindow | null = null;


export async function createMainWindow(): Promise<BrowserWindow> {
  const isDev = process.env.NODE_ENV === "development";
  logSend.info("isDEV", isDev);

  mainWindow = new BrowserWindow(getWindowOptions(isDev));
  ipcService.setMainWindow(mainWindow);

  setupIpcHandlers(mainWindow);
  setupAutoUpdater();
  initSettings();
  // autoUpdater.checkForUpdatesAndNotify();

  mainWindow.on('closed', () => {
    removeIpcHandlers();
    closeDevToolsWindow();
    mainWindow = null;
  });

  if (isDev || process.env.DEBUG === "true") {
    createDevToolsWindow(mainWindow);
  }

  await loadAppContent(isDev);

  return mainWindow;
}

function getWindowOptions(isDev: boolean): Electron.BrowserWindowConstructorOptions {
  let preloadPath;
  if (isDev) {
    preloadPath = path.join(__dirname, '..', 'preload.js');
  } else {
    preloadPath = path.join(app.getAppPath(), 'dist_electron', 'preload.js');
  }

  return {
    width: 1080,
    height: 800,
    resizable: true,
    fullscreenable: true,
    maximizable: false,
    movable: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true,
      allowRunningInsecureContent: isDev,
      webSecurity: true,
      preload: preloadPath
    }
  };
}

async function loadAppContent(isDev: boolean) {
  if (isDev) {
    await mainWindow!.loadURL("http://localhost:5173");

  } else {
    try {
      await mainWindow!.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
    } catch (error) {
      throw error;
    }
  }
}
