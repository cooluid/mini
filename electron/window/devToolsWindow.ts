import { BrowserWindow } from 'electron';

let devToolsWindow: BrowserWindow | null = null;

export function createDevToolsWindow(mainWindow: BrowserWindow) {
  devToolsWindow = new BrowserWindow({
    width: 1200,
    height: 1000,
    show: false,
  });

  mainWindow.webContents.setDevToolsWebContents(devToolsWindow.webContents);
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  devToolsWindow.setPosition(1000, 100);
  devToolsWindow.show();

  devToolsWindow.on('closed', () => {
    devToolsWindow = null;
  });
}

export function closeDevToolsWindow() {
  if (devToolsWindow && !devToolsWindow.isDestroyed()) {
    devToolsWindow.close();
  }
  devToolsWindow = null;
}
