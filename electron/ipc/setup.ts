import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import { autoUpdater } from 'electron-updater';
import { logSend } from '../utils/logger';
import { MainToRendererChannels } from './channels';
import { handlers } from './handlers';
type HandlerFunction = (mainWindow: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any;

export function setupIpcHandlers(mainWindow: BrowserWindow) {
  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcMain.handle(channel, (event: IpcMainInvokeEvent, ...args: any[]) =>
      (handler as HandlerFunction)(mainWindow, event, ...args)
    );
  });
}

export function removeIpcHandlers() {
  Object.keys(handlers).forEach((channel) => {
    ipcMain.removeHandler(channel);
  });
}

export function sendToRenderer(mainWindow: BrowserWindow, channel: MainToRendererChannels, ...args: any[]) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

export function setupAutoUpdater() {
  autoUpdater.on('error', (error: any) => {
    logSend.error('更新错误:', error);
  });
}
