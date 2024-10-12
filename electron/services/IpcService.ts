import { BrowserWindow, ipcMain } from 'electron';
import { MainToRendererChannels } from '../ipc/channels';

export class IpcService {
    private static instance: IpcService;
    private mainWindow: BrowserWindow | null = null;

    private constructor() { }

    public static getInstance(): IpcService {
        if (!IpcService.instance) {
            IpcService.instance = new IpcService();
        }
        return IpcService.instance;
    }

    public setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window;
    }

    public sendToRenderer(channel: MainToRendererChannels, ...args: any[]): void {
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send(channel, ...args);
        }
    }

    public async invokeRenderer<T>(channel: MainToRendererChannels, ...args: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            if (this.mainWindow && !this.mainWindow.isDestroyed()) {
                const responseChannel = `${channel}_response_${Date.now()}`;

                this.mainWindow.webContents.send(channel, ...args, responseChannel);
                ipcMain.once(responseChannel, (_, result) => {
                    resolve(result);
                });

                setTimeout(() => {
                    ipcMain.removeAllListeners(responseChannel);
                    reject(new Error(`请求超时: ${channel}`));
                }, 10000);
            } else {
                reject(new Error('Main window is not available'));
            }
        });

        // use this to test
        // ipcService.invokeRenderer(MainToRendererChannels.GET_MOVIE, movieInfo.meta.id).then((movie: any) => {
        //     console.log(`从渲染进程获取到电影信息: ${movie}`);
        // }).catch((error: any) => {
        //     console.error(`从渲染进程获取电影信息时发生错误: ${error}`);
        // });
    }
}

export const ipcService = IpcService.getInstance();