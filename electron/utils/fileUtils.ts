import * as fs from 'fs';
import { Dirent } from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { create } from 'xmlbuilder2';
import { MovieInfo } from '../types';
import { VIDEO_EXTENSIONS } from './constants';
import { logSend } from './logger';
export async function performFileOperation(operation: string, filePath: string, options?: any): Promise<any> {
  switch (operation) {
    case 'read':
      return readFile(filePath, options?.encoding);
    case 'readdir':
      return readdir(filePath, options);
    case 'write':
      return writeFile(filePath, options?.content, options?.encoding);
    case 'copy':
      return copyFile(filePath, options?.newPath);
    case 'rename':
      return renameFile(filePath, options);
    case 'exists':
      return fileExists(filePath);
    case 'scan':
      return scanDirectory(filePath, options?.filter);
    case 'scanVideos':
      return scanVideos(filePath, options?.recursive);
    case 'delete':
      return deleteFile(filePath);
    case 'moveFile':
      return moveFile(filePath, options.newPath);
    default:
      throw new Error(`不支持的文件操作: ${operation}`);
  }
}

async function readFile(filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<string | Buffer> {
  return fsPromises.readFile(filePath, encoding);
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 查找匹配的文件
 * @param dirPath 目录路径
 * @param extension 文件扩展名
 * @param baseName 文件名
 * @returns 匹配的文件路径或 null
 */
export async function findMatchingFile(filePath: string, extension: string, baseName?: string): Promise<string | null> {
  //如果extension没前缀，则添加
  if (!extension.startsWith('.')) {
    extension = '.' + extension;
  }

  const dirPath = path.dirname(filePath);
  const files = await readdir(dirPath);
  const matchingFile = files.find((file: string | Dirent) => {
    const ext = path.extname(file instanceof Dirent ? file.name : file).toLowerCase();
    const base = path.basename(file instanceof Dirent ? file.name : file, ext);
    return ext === extension && (!baseName || base.includes(baseName));
  });
  return matchingFile ? path.join(dirPath, matchingFile instanceof Dirent ? matchingFile.name : matchingFile) : null;
}

async function scanDirectory(dirPath: string, filter?: (file: string | Dirent) => boolean): Promise<{ name: string, path: string }[]> {
  const files = await readdir(dirPath);
  const filteredFiles = files.filter(file => !filter || filter(file));

  return filteredFiles.map(file => ({
    name: file instanceof Dirent ? file.name : file,
    path: path.join(dirPath, file instanceof Dirent ? file.name : file)
  }));
}

// 添加新的通用函数
async function writeFile(filePath: string, content: string | Buffer, encoding: BufferEncoding = 'utf-8'): Promise<void> {
  await fsPromises.writeFile(filePath, content, encoding);
}

async function readdir(dirPath: string, options?: { withFileTypes?: boolean }): Promise<string[] | Dirent[]> {
  if (options?.withFileTypes) {
    return fsPromises.readdir(dirPath, { withFileTypes: true });
  } else {
    return fsPromises.readdir(dirPath);
  }
}

async function copyFile(sourcePath: string, destPath: string): Promise<void> {
  await fs.promises.copyFile(sourcePath, destPath);
}

async function renameFile(oldPath: string, options: { newName: string }): Promise<{ success: boolean, newPath?: string, newName?: string, error?: string }> {
  try {
    const dirPath = path.dirname(oldPath);
    const oldExtname = path.extname(oldPath);
    let newName = options.newName;

    // 如果新文件名没有扩展名，则使用原文件的扩展名
    if (path.extname(newName) === '') {
      newName += oldExtname;
    }

    const newPath = path.join(dirPath, newName);

    await fsPromises.rename(oldPath, newPath);

    return {
      success: true,
      newPath: newPath,
      newName: newName
    };
  } catch (error) {
    console.error('重命名文件时出错:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

/**
 * 扫描视频文件
 * @param dirPath 目录路径
 * @param recursive 是否递归扫描
 * @returns 视频文件路径
 */
async function scanVideos(dirPath: string, recursive: boolean = false): Promise<{ name: string, path: string }[]> {
  if (typeof dirPath !== 'string' || dirPath.trim() === '') {
    console.error('scanVideos: 无效的目录路径', dirPath);
    return [];
  }

  const videoExtensions = VIDEO_EXTENSIONS;
  const filter = (file: string) => videoExtensions.includes(path.extname(file).toLowerCase());

  if (recursive) {
    return scanDirectoryRecursive(dirPath, filter);
  } else {
    return scanDirectory(dirPath, (file: string | Dirent) => videoExtensions.includes(path.extname(file instanceof Dirent ? file.name : file).toLowerCase()));
  }
}

/**
 * 递归扫描目录
 * @param dirPath 目录路径
 * @param filter 过滤函数
 * @returns 目录中的所有文件路径
 */
async function scanDirectoryRecursive(dirPath: string, filter?: (file: string) => boolean): Promise<{ name: string, path: string }[]> {
  const results: { name: string, path: string }[] = [];
  // 首先检查 dirPath 是否为有效字符串
  if (typeof dirPath !== 'string' || dirPath.trim() === '') {
    console.error('无效的目录路径:', dirPath);
    return results;
  }

  try {
    const entries = await performFileOperation('readdir', dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...await scanDirectoryRecursive(fullPath, filter));
      } else if (entry.isFile() && (!filter || filter(entry.name))) {
        results.push({ name: entry.name, path: fullPath });
      }
    }
  } catch (error) {
    console.error(`扫描目录时出错 ${dirPath}:`, error);
  }

  return results;
}

export function createXML(movieInfo: Partial<MovieInfo>): string {
  const root = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('movie');

  Object.entries(movieInfo).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return; // 跳过未定义或空值
    }
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'object') {
          root.ele(key, item);
        } else {
          root.ele(key).txt(item.toString());
        }
      });
    } else if (typeof value === 'object') {
      root.ele(key, value);
    } else {
      root.ele(key).txt(value.toString());
    }
  });

  return root.end({ prettyPrint: true });
}

export function analyzeFileName(fileName: string): { hasChineseSub: boolean, isUncensoredLeak: boolean } {
  const lowerFileName = fileName.toLowerCase();
  return {
    hasChineseSub: lowerFileName.includes('-c') || lowerFileName.includes('中文'),
    isUncensoredLeak: lowerFileName.startsWith('ul-') || lowerFileName.includes('无码流出')
  };
}

export function getBaseFileName(filePath: string): string {
  return path.basename(filePath, path.extname(filePath));
}

async function deleteFile(filePath: string): Promise<{ success: boolean, error?: string }> {
  try {
    await fsPromises.unlink(filePath);
    return { success: true };
  } catch (error) {
    logSend.error('Error deleting file:', error);
    return { success: false, error: (error as Error).message };
  }
}

async function moveFile(oldPath: string, newPath: string): Promise<{ success: boolean, newPath?: string, error?: string }> {
  try {
    await fs.promises.copyFile(oldPath, newPath);
    await fs.promises.unlink(oldPath);
    return { success: true, newPath };
  } catch (error) {
    logSend.error('Error moving file:', error);
    return { success: false, error: (error as Error).message };
  }
}