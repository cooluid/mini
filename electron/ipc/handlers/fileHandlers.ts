import { BrowserWindow, dialog, shell } from 'electron';
import * as path from 'path';
import { findMatchingFile, performFileOperation } from '../../utils/fileUtils';

export function handleOpenDirectory() {
    return dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => result.filePaths);
}

export function handleOpenFile() {
    return dialog.showOpenDialog({ properties: ['openFile'] }).then(result => result.filePaths);
}

export function handleJoinPaths(_rWindow: BrowserWindow, _: any, ...paths: string[]) {
    return path.join(...paths);
}

export function handleFileOperation(_rWindow: BrowserWindow, _: any, operation: string, filePath: string, options?: any) {
    return performFileOperation(operation, filePath, options);
}

export function handleSelectFolder(_rWindow: BrowserWindow) {
    return dialog.showOpenDialog({ properties: ['openDirectory'] }).then(result => result.filePaths);
}

export function handleMatchingFile(_rWindow: BrowserWindow, _: any, dirPath: string, extension: string, baseName?: string) {
    return findMatchingFile(dirPath, extension, baseName);
}

//打开文件夹并选择文件
export function handleOpenFileAndSelect(_rWindow: BrowserWindow, _: any, filePath: string) {
    return dialog.showOpenDialog({ properties: ['openFile'], defaultPath: filePath }).then(result => result.filePaths);
}

//打开文件夹
export function handleOpenFolder(_rWindow: BrowserWindow, _: any, filePath: string) {
    return shell.showItemInFolder(filePath);
}