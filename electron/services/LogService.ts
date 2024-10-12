import { SendToRenderer } from "../decorators/ipcDecorators";
import { MainToRendererChannels } from "../ipc/channels";

export class LogService {
    private static instance: LogService;

    private constructor() { }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    @SendToRenderer(MainToRendererChannels.LOG_UPDATE)
    sendLogToRenderer(log: string): string {
        return log;
    }
}