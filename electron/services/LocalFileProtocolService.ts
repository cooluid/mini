import { net, protocol, session } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

// 缓存相关代码
const cache = new Map<string, { data: Buffer; timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5分钟缓存过期时间

function getCachedFile(filePath: string): Buffer | null {
    const cached = cache.get(filePath);
    if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        return cached.data;
    }
    return null;
}

function setCachedFile(filePath: string, data: Buffer) {
    cache.set(filePath, { data, timestamp: Date.now() });
}

// 范围请求解析
function parseRange(rangeHeader: string, fileSize: number): { start: number; end: number }[] | null {
    const matches = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    if (!matches) return null;

    const start = matches[1] ? parseInt(matches[1], 10) : 0;
    const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
        return null;
    }

    return [{ start, end }];
}

// MIME 类型获取
function getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.mov':
        case '.mp4':
            return 'video/mp4';
        case '.avi':
            return 'video/x-msvideo';
        case '.wmv':
            return 'video/x-ms-wmv';
        case '.mkv':
            return 'video/x-matroska';
        case '.flv':
            return 'video/x-flv';
        case '.webm':
            return 'video/webm';
        case '.m4v':
            return 'video/x-m4v';
        case '.mpg':
        case '.mpeg':
            return 'video/mpeg';
        case '.ts':
            return 'video/mp2t';
        case '.m2ts':
            return 'video/mp2t';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.png':
            return 'image/png';
        default:
            return 'application/octet-stream';
    }
}

export function registerLocalFileProtocol() {
    protocol.handle('local-file', async (request) => {
        try {
            const filePath = decodeURIComponent(request.url.replace('local-file://', ''));
            // 检查缓存
            const cachedData = getCachedFile(filePath);
            if (cachedData) {
                return new Response(cachedData, {
                    status: 200,
                    headers: { 'Content-Type': getMimeType(filePath) }
                });
            }

            if (!fs.existsSync(filePath)) {
                return new Response('文件不存在', { status: 404 });
            }

            const stats = fs.statSync(filePath);
            const mimeType = getMimeType(filePath);
            const rangeHeader = request.headers.get('Range');
            if (rangeHeader) {
                const ranges = parseRange(rangeHeader, stats.size);
                if (ranges && ranges.length > 0) {
                    const { start, end } = ranges[0];
                    const fileStream = fs.createReadStream(filePath, { start, end });
                    return new Response(fileStream as any, {
                        status: 206,
                        headers: {
                            'Content-Type': mimeType,
                            'Content-Range': `bytes ${start}-${end}/${stats.size}`,
                            'Content-Length': (end - start + 1).toString(),
                            'Accept-Ranges': 'bytes'
                        }
                    });
                }
            }

            // 如果没有范围请求或范围无效，返回整个文件
            const fileResponse = await net.fetch(`file://${filePath}`);
            const fileData = await fileResponse.arrayBuffer();
            // 缓存文件内容
            setCachedFile(filePath, Buffer.from(fileData));

            return new Response(fileData, {
                status: 200,
                headers: {
                    'Content-Type': mimeType,
                    'Content-Length': stats.size.toString(),
                    'Accept-Ranges': 'bytes'
                }
            });
        } catch (error) {
            return new Response('处理文件请求时出错', { status: 500 });
        }
    });
}

export function setupContentSecurityPolicy() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' local-file: blob:;" +
                    "script-src 'self' https://at.alicdn.com;" +
                    "style-src 'self' 'unsafe-inline';" +
                    "img-src 'self' local-file: data:;" +
                    "font-src 'self' https://at.alicdn.com data:;" +
                    "connect-src 'self' local-file:;"
                ]
            }
        });
    });
}