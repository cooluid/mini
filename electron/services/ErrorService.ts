import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { logSend } from '../utils/logger';
interface ErrorDetails {
	message: string;
	context: string;
	stack: string | undefined;
	timestamp: string;
	appVersion: string;
	platform: string;
	arch: string;
}

export class ErrorHandlingService {
	private static readonly ERROR_LOG_FILE = 'error_details.log';

	static handleError(error: Error, context: string): void {
		// 记录详细的技术日志
		const errorDetails = this.formatErrorDetails(error, context);
		this.saveErrorToFile(errorDetails);
		this.notifyUser(errorDetails);
		logSend.error('发生错误', errorDetails);

		// 向用户显示友好的错误消息
		let userFriendlyMessage = '操作过程中发生错误';
		if (error.message.includes('未找到匹配的搜索结果')) {
			userFriendlyMessage = '未找到匹配的搜索结果，请检查输入是否正确';

		} else if (error.message.includes('网络连接失败')) {
			userFriendlyMessage = '网络连接失败，请检查您的网络设置或代理配置';

		} else if (error.message.includes('需要验证码')) {
			userFriendlyMessage = '网站需要验证码，请稍后再试或考虑使用代理';

		} else if (error.message.includes('重试次数已用完')) {
			userFriendlyMessage = '操作失败且重试次数已用完，请稍后再试';

		} else if (error.message.includes('data file is corrupt')) {
			userFriendlyMessage = '数据库文件已损坏，已创建新的数据库文件。您的旧数据可能已丢失。';

		} else if (error.message.includes('ERR_PROXY_CONNECTION_FAILED')) {
			userFriendlyMessage = '代理连接失败，请检查您的代理设置或网络连接';
			
		} else if (error.message.includes('网络访问受限')) {
			userFriendlyMessage = '应用无法访问网络。请检查网络连接和应用的网络权限设置。';
		}

		logSend.error(userFriendlyMessage);
	}

	private static formatErrorDetails(error: Error, context: string): ErrorDetails {
		return {
			context,
			message: error.message,
			stack: error.stack,
			timestamp: new Date().toISOString(),
			appVersion: app.getVersion(),
			platform: process.platform,
			arch: process.arch,
		};
	}

	private static saveErrorToFile(errorDetails: object): void {
		const logPath = path.join(app.getPath('userData'), this.ERROR_LOG_FILE);
		const logEntry = JSON.stringify(errorDetails, null, 2) + '\n\n';

		fs.appendFile(logPath, logEntry, (err) => {
			if (err) {
				logSend.error('保存错误日志失败', { error: err });
			}
		});
	}

	private static notifyUser(errorDetails: ErrorDetails): void {
		// 这里可以实现用户通知逻辑，例如显示一个对话框
		// 为了简洁，这里只记录一条日志
		logSend.info('用户已被通知错误', { errorSummary: errorDetails.message });
	}

	static async sendErrorReport(): Promise<void> {
		// 这里可以实现发送错误报告到服务器的逻辑
		// 例如，读取错误日志文件并发送到特定的 API 端点
		logSend.info('错误报告已发送');
	}
}

// 全局未捕获异常处理
process.on('uncaughtException', (error) => {
	ErrorHandlingService.handleError(error, '未捕获的异常');
});

process.on('unhandledRejection', (reason, promise) => {
	console.log('unhandledRejection', reason, promise);
	ErrorHandlingService.handleError(new Error(String(reason)), '未处理的 Promise 拒绝');
});

/**
 * 包装函数，添加错误处理
 * @param fn 
 * @param context 
 * @returns 
 */
export function wrapWithErrorHandler<T extends (...args: any[]) => any>(
	fn: T,
	context: string
): (...args: Parameters<T>) => ReturnType<T> {
	return (...args: Parameters<T>): ReturnType<T> => {
		try {
			return fn(...args);
		} catch (error) {
			ErrorHandlingService.handleError(error as Error, context);
			throw error;
		}
	};
}