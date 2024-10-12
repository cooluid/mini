import { app, BrowserWindow } from 'electron';

export function handleGetAppVersion() {
  return app.getVersion();
}

export function handleCloseApp() {
  app.quit();
}

export function handleCloseWindow(mainWindow: BrowserWindow) {
  mainWindow.close();
}

export function handleMinimizeWindow(mainWindow: BrowserWindow) {
  mainWindow.minimize();
}