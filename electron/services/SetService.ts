import { app } from 'electron';
import * as path from 'path';
import { UserSettings } from '../types';
import { performFileOperation } from '../utils/fileUtils';
import { logSend } from '../utils/logger';
import { wrapWithErrorHandler } from './ErrorService';

const SETTINGS_FILE = 'settings.json';
const CURRENT_SETTINGS_VERSION = 1;

export let globalSettings: Partial<UserSettings> | null = null;

async function getSettingsPath() {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, SETTINGS_FILE);
}

export async function initSettings() {
  let settings = await loadSettingsFromFile();
  // logSend.info(`加载：settings`, settings);

  let isDefaultSettings = false;
  if (!settings.hasOwnProperty('scrapeSources')) {
    logSend.error('settings 文件格式错误，使用默认设置');
    isDefaultSettings = true;
  }

  // 如果没有保存过设置，则使用默认设置
  if (isDefaultSettings || Object.keys(settings).length === 0) {
    settings = {
      version: 1,
      useProxy: false,
      proxyAddress: '',
    }

    // logSend.info(`初始化：settings`, settings);
  }

  globalSettings = settings;
}

export async function saveSettingsToFile(settings: Partial<UserSettings>) {
  const settingsPath = await getSettingsPath();
  settings.version = CURRENT_SETTINGS_VERSION;
  globalSettings = settings;
  await performFileOperation('write', settingsPath, { content: JSON.stringify(settings, null, 2), encoding: 'utf-8' });
}

export const loadSettingsFromFile = wrapWithErrorHandler(async function loadSettingsFromFile(): Promise<UserSettings> {
  const settingsPath = await getSettingsPath();
  try {
    const data = await performFileOperation('read', settingsPath, { encoding: 'utf-8' });
    let settings = JSON.parse(data) as Partial<UserSettings>;
    return migrateSettings(settings);

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // 文件不存在，返回空对象
      return {} as UserSettings;
    }
    // 其他错误，重新抛出
    throw error;
  }
}, 'loadSettingsFromFile');

export async function getSettings(): Promise<Partial<UserSettings>> {
  if (!globalSettings) {
    globalSettings = await loadSettingsFromFile();
  }
  return globalSettings;
}

function migrateSettings(settings: Partial<UserSettings>): UserSettings {
  const currentVersion = CURRENT_SETTINGS_VERSION;
  const settingsVersion = settings.version || 0;

  if (settingsVersion < currentVersion) {
    // 执行迁移逻辑
    for (let v = settingsVersion; v < currentVersion; v++) {
      switch (v) {
        case 0:
          // 从无版本迁移到版本1
          settings = {
            ...settings,
            version: 1,
          };
          break;
        // 未来可以在这里添加更多的 case
      }
    }
  }

  return settings as UserSettings;
}