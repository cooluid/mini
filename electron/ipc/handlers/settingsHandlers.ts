import { getSettings, saveSettingsToFile } from '../../services/SetService';
import { BrowserWindow } from 'electron';

export function handleLoadSettings() {
  return getSettings();
}

export function handleUpdateSettings(_rWindow: BrowserWindow, _: any, settings: any) {
  saveSettingsToFile(settings);
}