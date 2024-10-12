import { app } from 'electron';
import { performance, PerformanceObserver } from 'perf_hooks';
import { MainToRendererChannels } from '../ipc/channels';
import { ipcService } from '../services/IpcService';
import { logSend } from '../utils/logger';
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private cpuUsageHistory: number[] = [];
    private memoryUsageHistory: number[] = [];
    private intervalId: NodeJS.Timeout | null = null;
    private constructor() {
        this.setupPerformanceObserver();
    }

    public static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    public setIsMonitoring(isMonitoring: boolean): void {
        if (isMonitoring) {
            this.monitorPerformance();
        } else {
            this.stopMonitoring();
        }
    }

    private monitorPerformance(interval: number = 5000): void {
        this.intervalId = setInterval(async () => {
            const performanceData = {
                cpu: this.logCPUUsage(),
                memory: this.logMemoryUsage(),
                eventLoopLag: await this.measureEventLoopLag()
            };
            this.sendPerformanceData(performanceData);
        }, interval);
    }

    private stopMonitoring(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private sendPerformanceData(data: any): void {
        ipcService.sendToRenderer(MainToRendererChannels.PERFORMANCE_DATA, data);
    }

    private logCPUUsage(): number {
        const metrics = app.getAppMetrics();
        let totalCPUUsage = 0;

        metrics.forEach((metric) => {
            totalCPUUsage += metric.cpu.percentCPUUsage;
            logSend.info(`进程 ${metric.pid} (${metric.type}) CPU 使用率: ${metric.cpu.percentCPUUsage.toFixed(2)}%`);
        });

        const averageCPUUsage = totalCPUUsage / metrics.length;
        logSend.info(`Electron 总体 CPU 使用率: ${averageCPUUsage.toFixed(2)}%`);

        // 保存历史数据以便分析趋势
        this.cpuUsageHistory.push(averageCPUUsage);
        if (this.cpuUsageHistory.length > 10) {
            this.cpuUsageHistory.shift();
        }

        // 分析 CPU 使用率趋势
        this.analyzeCPUTrend();
        return averageCPUUsage;
    }

    private analyzeCPUTrend(): void {
        if (this.cpuUsageHistory.length < 2) return;

        const currentUsage = this.cpuUsageHistory[this.cpuUsageHistory.length - 1];
        const previousUsage = this.cpuUsageHistory[this.cpuUsageHistory.length - 2];

        if (currentUsage > previousUsage * 1.2) {
            logSend.warn('警告: CPU 使用率显著增加');
        } else if (currentUsage < previousUsage * 0.8) {
            logSend.info('注意: CPU 使用率显著下降');
        }

        // 添加阈值警告
        if (currentUsage > 50) {
            logSend.warn(`警告: CPU 使用率超过 50%: ${currentUsage.toFixed(2)}%`);
        }
    }

    private logMemoryUsage(): number {
        const memoryUsage = process.memoryUsage();
        const heapUsed = memoryUsage.heapUsed / 1024 / 1024; // 转换为 MB

        logSend.info(`内存使用 - RSS: ${this.formatBytes(memoryUsage.rss)}, 堆总量: ${this.formatBytes(memoryUsage.heapTotal)}, 堆使用: ${this.formatBytes(memoryUsage.heapUsed)}`);

        this.memoryUsageHistory.push(heapUsed);
        if (this.memoryUsageHistory.length > 10) {
            this.memoryUsageHistory.shift();
        }

        this.analyzeMemoryTrend();
        return heapUsed;
    }

    private analyzeMemoryTrend(): void {
        if (this.memoryUsageHistory.length < 2) return;

        const currentUsage = this.memoryUsageHistory[this.memoryUsageHistory.length - 1];
        const initialUsage = this.memoryUsageHistory[0];

        if (currentUsage > initialUsage * 1.5) {
            logSend.warn(`警告: 内存使用量显著增加，当前使用: ${currentUsage.toFixed(2)} MB`);
        }
    }

    private measureEventLoopLag(): Promise<number> {
        return new Promise((resolve) => {
            const start = Date.now();
            setImmediate(() => {
                const lag = Date.now() - start;
                console.log(`事件循环延迟: ${lag}ms`);
                resolve(lag);
            });
        });
    }

    private formatBytes(bytes: number): string {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let i = 0;
        while (bytes >= 1024 && i < units.length - 1) {
            bytes /= 1024;
            i++;
        }
        return `${bytes.toFixed(2)} ${units[i]}`;
    }

    public logAppMetrics(): void {
        const metrics = app.getAppMetrics();
        metrics.forEach((metric) => {
            console.log(`进程 ${metric.pid} - 类型: ${metric.type}, CPU 使用率: ${metric.cpu.percentCPUUsage.toFixed(2)}%, 工作集大小: ${this.formatBytes(metric.memory.workingSetSize)}`);
        });
    }

    public measurePerformance(fn: Function, ...args: any[]): any {
        const start = performance.now();
        const result = fn(...args);
        const end = performance.now();
        console.log(`函数 ${fn.name} 执行时间: ${(end - start).toFixed(2)} 毫秒`);
        return result;
    }

    private setupPerformanceObserver(): void {
        const obs = new PerformanceObserver((items) => {
            items.getEntries().forEach((entry) => {
                console.log(`性能测量 - ${entry.name}: ${entry.duration.toFixed(2)}ms`);
            });
        });
        obs.observe({ entryTypes: ['measure'] });
    }
}

export const performanceMonitor = PerformanceMonitor.getInstance();