import { IpcChannel } from '../ipc/channels';

declare global {
    interface Window {
        electronAPI: {
            invoke: (channel: IpcChannel, ...args: any[]) => Promise<any>;
            on: (channel: IpcChannel, listener: (event: any, ...args: any[]) => void) => void;
            send: (channel: IpcChannel | string, ...args: any[]) => void;
            removeListener: (channel: IpcChannel, listener: (event: any, ...args: any[]) => void) => void;
        };
    }
}

export { };
