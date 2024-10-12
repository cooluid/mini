import { app, BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { removeIpcHandlers } from './ipc/setup';
import { registerLocalFileProtocol, setupContentSecurityPolicy } from './services/LocalFileProtocolService';
import { createMainWindow } from './window/mainWindow';

export async function initApp() {
    app.whenReady().then(async () => {
        setupContentSecurityPolicy();
        registerLocalFileProtocol();
        createMainWindow();
        setupAutoUpdater();
        setupAppEventListeners();
    });
}

function setupAutoUpdater() {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = true;
    autoUpdater.allowPrerelease = true;

    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'cooluid',
        repo: 'mini',
        private: false,
        releaseType: 'release'
    });
}

function setupAppEventListeners() {
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('browser-window-created', (_, win) => {
        win.webContents.on('devtools-opened', () => {
            if (process.env.NODE_ENV === 'production') {
                win.close();
                app.quit();
            }
        });
    });

    app.on('activate', () => {
        const allWindows = BrowserWindow.getAllWindows();
        if (allWindows.length === 0) {
            createMainWindow();
        } else {
            allWindows.forEach((win) => {
                if (win.isMinimized()) {
                    win.restore();
                }
            });
        }
    });

    app.on('will-quit', async () => {
        removeIpcHandlers();
    });
}