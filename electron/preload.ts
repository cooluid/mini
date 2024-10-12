import { contextBridge, ipcRenderer } from 'electron';
type IpcChannel = string;

interface ElectronAPI {
	invoke: (channel: IpcChannel, ...args: any[]) => Promise<any>;
	on: (channel: IpcChannel, listener: (event: any, ...args: any[]) => void) => void;
	send: (channel: IpcChannel, ...args: any[]) => void;
	removeListener: (channel: IpcChannel, listener: (event: any, ...args: any[]) => void) => void;
	log: {
		info: (message: string, ...args: any[]) => void;
		warn: (message: string, ...args: any[]) => void;
		error: (message: string, ...args: any[]) => void;
		debug: (message: string, ...args: any[]) => void;
	};
}

const electronAPI: ElectronAPI = {
	invoke: async (channel: IpcChannel, ...args: any[]) => {
		return await ipcRenderer.invoke(channel, ...args);
	},
	on: (channel: IpcChannel, listener: (event: any, ...args: any[]) => void) => {
		ipcRenderer.on(channel, listener);
	},
	send: (channel: IpcChannel, ...args: any[]) => {
		ipcRenderer.send(channel, ...args);
	},
	removeListener: (channel: IpcChannel, listener: (event: any, ...args: any[]) => void) => {
		ipcRenderer.removeListener(channel, listener);
	},
	log: {
		info: (message: string, ...args: any[]) => {
			ipcRenderer.invoke('log', 'info', message, ...args);
		},
		warn: (message: string, ...args: any[]) => {
			ipcRenderer.invoke('log', 'warn', message, ...args);
		},
		error: (message: string, ...args: any[]) => {
			ipcRenderer.invoke('log', 'error', message, ...args);
		},
		debug: (message: string, ...args: any[]) => {
			ipcRenderer.invoke('log', 'debug', message, ...args);
		},
	},
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);