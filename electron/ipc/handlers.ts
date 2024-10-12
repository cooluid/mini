import { app, BrowserWindow, IpcMainInvokeEvent, Menu, MenuItem, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import * as fs from 'fs';
import * as path from 'path';
import { ipcService } from '../services/IpcService';
import { axiosService } from '../utils/axiosInstance';
import { LogLevel, logSend } from '../utils/logger';
import { MainToRendererChannels, RendererToMainChannels } from './channels';
import * as AppHandlers from './handlers/appHandlers';
import * as FileHandlers from './handlers/fileHandlers';
import * as SettingsHandlers from './handlers/settingsHandlers';

export type HandlerFunction = (mainWindow: BrowserWindow, event: IpcMainInvokeEvent, ...args: any[]) => Promise<any> | any;
export const handlers: Record<RendererToMainChannels, HandlerFunction> = {
	[RendererToMainChannels.OPEN_DIRECTORY]: FileHandlers.handleOpenDirectory,

	[RendererToMainChannels.OPEN_FILE]: FileHandlers.handleOpenFile,

	[RendererToMainChannels.JOIN_PATHS]: FileHandlers.handleJoinPaths,

	[RendererToMainChannels.FILE_OPERATION]: FileHandlers.handleFileOperation,

	[RendererToMainChannels.SELECT_FOLDER]: FileHandlers.handleSelectFolder,

	[RendererToMainChannels.MATCHING_FILE]: FileHandlers.handleMatchingFile,

	[RendererToMainChannels.LOAD_SETTINGS]: SettingsHandlers.handleLoadSettings,

	[RendererToMainChannels.UPDATE_SETTINGS]: SettingsHandlers.handleUpdateSettings,

	[RendererToMainChannels.GET_APP_VERSION]: AppHandlers.handleGetAppVersion,

	[RendererToMainChannels.CLOSE_APP]: AppHandlers.handleCloseApp,

	[RendererToMainChannels.CLOSE_WINDOW]: AppHandlers.handleCloseWindow,

	[RendererToMainChannels.MINIMIZE_WINDOW]: AppHandlers.handleMinimizeWindow,

	[RendererToMainChannels.LOG_UPDATE]: (__rWindow, _: IpcMainInvokeEvent, level: LogLevel, message: string, ...args: any[]) => {
		logSend[level](message, ...args);
	},

	[RendererToMainChannels.CONTEXT_MENU]: (__rWindow, _: IpcMainInvokeEvent, contextMenu: { x: number; y: number; }) => {
		const { x, y } = contextMenu;
		let isConfirmingDelete = false;

		const showContextMenu = () => {
			const deleteMenuItem = new MenuItem({
				label: isConfirmingDelete ? '确认删除' : '删除',
				click: () => {
					if (!isConfirmingDelete) {
						isConfirmingDelete = true;
						showContextMenu();  // 重新创建菜单
					} else {
					}
				}
			});

			const menuItems = [
				new MenuItem({
					label: '打开',
					click: () => {
						FileHandlers.handleOpenFolder(__rWindow, _, '');
					},
				}),
				deleteMenuItem
			];

			const menu = Menu.buildFromTemplate(menuItems);
			menu.popup({ window: __rWindow, x, y });
		};

		showContextMenu();
	},

	[RendererToMainChannels.CHECK_FOR_UPDATES]: async () => {
		try {
			const result = await autoUpdater.checkForUpdates();
			if (result && result.updateInfo) {
				const updatedInfo = {
					...result.updateInfo,
					files: result.updateInfo.files.map(file => ({
						...file,
						url: `https://github.com/cooluid/down/releases/download/v${result.updateInfo.version}/${file.url}`
					})),
					preferredDownload: ''
				};
				// 优先选择 .dmg 文件
				const dmgFile = updatedInfo.files.find(file => file.url.endsWith('.dmg'));
				if (dmgFile) {
					updatedInfo.preferredDownload = dmgFile.url;
				}

				return { ...result, updateInfo: updatedInfo };
			}
			return result;
		} catch (error) {
			logSend.error('检查更新时出错:', error);
			throw error;
		}
	},

	[RendererToMainChannels.START_UPDATE_DOWNLOAD]: async (_, __, url: string) => {
		try {
			// 确保URL指向通用二进制DMG
			const universalDmgUrl = url.replace(/-(arm64|x64)\.dmg$/, '-universal.dmg');

			const { data } = await axiosService.get<any>(universalDmgUrl, {
				responseType: 'arraybuffer',
				onDownloadProgress: (progressEvent) => {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
					ipcService.sendToRenderer(MainToRendererChannels.UPDATE_DOWNLOAD_PROGRESS, percentCompleted);
				}
			});

			const fileExtension = process.platform === 'darwin' ? 'dmg' : 'exe';
			const tempPath = path.join(app.getPath('temp'), `update.${fileExtension}`);
			await fs.promises.writeFile(tempPath, data);
			return { success: true, path: tempPath };
		} catch (error: any) {
			logSend.error('下载更新失败:', error);
			return { success: false, error: error.message };
		}
	},

	[RendererToMainChannels.INSTALL_UPDATE]: () => {
		const fileExtension = process.platform === 'darwin' ? 'dmg' : 'exe';
		const updatePath = path.join(app.getPath('temp'), `update.${fileExtension}`);
		shell.openExternal(`file://${updatePath}`);
		app.quit();
	},

	[RendererToMainChannels.OPEN_EXTERNAL_LINK]: (_, __: IpcMainInvokeEvent, url: string) => {
		shell.openExternal(url);
	},

	[RendererToMainChannels.PLAY_MOVIE]: async (_, __: IpcMainInvokeEvent, filePath: string) => {
		try {
			await shell.openPath(filePath);
			return true;
		} catch (error) {
			console.error('打开文件失败:', error);
			return false;
		}
	},
};