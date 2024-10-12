import * as fs from 'fs';
import * as path from 'path';
import * as winston from 'winston';
import { LogService } from '../services/LogService';

const { combine, timestamp, printf, colorize } = winston.format;

// 用户友好的日志格式
const userFriendlyFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let metaStr = '';
	if (Object.keys(metadata).length > 0) {
		metaStr = Object.entries(metadata)
			.map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
			.join(', ');
	}
	return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

// 详细的技术日志格式
const technicalFormat = printf(({ level, message, timestamp, ...metadata }) => {
	let meta = '';
	if (Object.keys(metadata).length) {
		// 格式化 JSON 字符串，使用 2 空格缩进
		meta = '\n' + JSON.stringify(metadata, null, 2);
	}
	return `${timestamp} [${level}]: ${message}${meta}`;
});

// 创建 Winston logger
export const logger = winston.createLogger({
	level: 'info',
	format: combine(
		timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		technicalFormat
	),
	transports: [
		new winston.transports.File({ filename: 'error.log', level: 'error' }),
		new winston.transports.File({ filename: 'combined.log' })
	]
});

if (process.env.NODE_ENV === 'development') {
	logger.add(new winston.transports.Console({
		format: combine(
			colorize(),
			timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
			userFriendlyFormat
		)
	}));
}

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// 用于发送日志到渲染进程的函数
const sendLogToRenderer = (log: string) => {
	LogService.getInstance().sendLogToRenderer(log);
};

export const logSend: Record<LogLevel, (message: string, ...args: any[]) => void> = {
	info: (message: string, ...args: any[]) => {
		const logMessage = formatLogMessage(message, ...args);
		logger.info(logMessage);
		sendLogToRenderer(`${new Date().toLocaleString()} [信息]: ${logMessage}`);
	},
	warn: (message: string, ...args: any[]) => {
		const logMessage = formatLogMessage(message, ...args);
		logger.warn(logMessage);
		sendLogToRenderer(`${new Date().toLocaleString()} [警告]: ${logMessage}`);
	},
	error: (message: string, ...args: any[]) => {
		const logMessage = formatLogMessage(message, ...args);
		logger.error(logMessage);
		sendLogToRenderer(`${new Date().toLocaleString()} [错误]: ${logMessage}`);
	},
	debug: (message: string, ...args: any[]) => {
		const logMessage = formatLogMessage(message, ...args);
		logger.debug(logMessage);
		console.log(`${new Date().toLocaleString()} [调试]: ${logMessage}`);
	},
};

function formatLogMessage(message: string, ...args: any[]): string {
	if (args.length === 0) {
		return message;
	}

	const formattedArgs = args.map(arg => {
		if (typeof arg === 'object') {
			return '\n' + JSON.stringify(arg, null, 2);
		}
		return arg;
	}).join(' ');

	return `${message} ${formattedArgs}`;
}

export default logger;

export type LogCleanupSettings = {
	mode: 'none' | 'size' | 'days' | 'all';
	maxSize?: number; // 以字节为单位
	days?: number;
};

export function cleanupLogs(settings: LogCleanupSettings) {
	const logDir = path.dirname(logger.transports.find((t: winston.transport) => t instanceof winston.transports.File)?.filename || '');
	const logFiles = fs.readdirSync(logDir).filter(file => file.endsWith('.log'));

	switch (settings.mode) {
		case 'all':
			// 清理所有日志
			for (const file of logFiles) {
				fs.unlinkSync(path.join(logDir, file));
				logSend.info(`已清理日志: ${file}`);
			}
			logSend.info('所有日志已清理');
			break;

		case 'size':
			if (settings.maxSize) {
				let totalSize = 0;
				const fileSizes = logFiles.map(file => {
					const filePath = path.join(logDir, file);
					const stats = fs.statSync(filePath);
					return { file, size: stats.size, mtime: stats.mtime };
				}).sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

				for (const fileInfo of fileSizes) {
					totalSize += fileInfo.size;
					if (totalSize > settings.maxSize) {
						fs.unlinkSync(path.join(logDir, fileInfo.file));
					}
				}
				logSend.info(`日志已清理，当前大小小于 ${settings.maxSize} 字节`);
			}
			break;

		case 'days':
			if (settings.days) {
				const cutoffDate = new Date();
				cutoffDate.setDate(cutoffDate.getDate() - settings.days);

				for (const file of logFiles) {
					const filePath = path.join(logDir, file);
					const stats = fs.statSync(filePath);
					if (stats.mtime < cutoffDate) {
						fs.unlinkSync(filePath);
					}
				}
				logSend.info(`已清理 ${settings.days} 天前的日志`);
			}
			break;

		case 'none':
		default:
			// 不进行清理
			logSend.info('日志清理已跳过');
			break;



	}
}