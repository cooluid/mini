import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { net } from 'electron';
import { getSettings } from '../services/SetService';
class AxiosService {
    private static instance: AxiosService;
    private axiosInstance: AxiosInstance;

    private constructor() {
        this.axiosInstance = axios.create();
        this.setupInterceptors();
    }

    public static getInstance(): AxiosService {
        if (!AxiosService.instance) {
            AxiosService.instance = new AxiosService();
        }
        return AxiosService.instance;
    }

    public async checkNetworkPermission(timeout = 5000) {
        return new Promise((resolve) => {
            const request = net.request('https://www.google.com');
            const timer = setTimeout(() => {
                request.abort();
                resolve(false);
            }, timeout);

            request.on('response', () => {
                clearTimeout(timer);
                resolve(true);
            });

            request.on('error', () => {
                clearTimeout(timer);
                resolve(false);
            });

            request.end();
        });
    }

    private async setupInterceptors() {
        this.axiosInstance.interceptors.request.use(async (config) => {
            const settings = await getSettings();
            if (settings.useProxy && settings.proxyAddress) {
                const proxyUrl = new URL(settings.proxyAddress.includes('://') ? settings.proxyAddress : `http://${settings.proxyAddress}`);
                config.proxy = {
                    host: proxyUrl.hostname,
                    port: parseInt(proxyUrl.port),
                    protocol: proxyUrl.protocol.slice(0, -1)
                };
            }
            return config;
        });
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.get<T>(url, config);
    }

    public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        return this.axiosInstance.post<T>(url, data, config);
    }

    // 可以根据需要添加其他 HTTP 方法
}

export const axiosService = AxiosService.getInstance();