export enum ErrorCode {
    // 网络错误
    NETWORK_ERROR = 1001,
    // 没有结果
    NO_RESULTS_FOUND = 1002,
    // 需要验证码
    CAPTCHA_REQUIRED = 1003,
    // 重试次数超过限制
    RETRY_LIMIT_EXCEEDED = 1004,
    // 未知错误
    UNKNOWN_ERROR = 9999
}

export interface MovieInfo {
    title: string;
    actress: string;
}

export interface UserSettings {
    version: number;
    useProxy: boolean;
    proxyAddress: string;
}

export interface FileInfo {
    filePath: string;
    dirPath: string;
    originalFileName: string;
}