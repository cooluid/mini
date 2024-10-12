import { FileInfo, UserSettings } from 'electron/types';
import { defineStore } from 'pinia';
import { RendererToMainChannels } from '../api/electronApiService';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        settings: {} as UserSettings,
        logs: [] as string[],
        filesToDeleteQueue: [] as FileInfo[],
        updateState: false as boolean
    }),
    actions: {
        async loadSettings() {
            const savedSettings = await window.electronAPI.invoke(RendererToMainChannels.LOAD_SETTINGS);
            if (savedSettings) {
                this.settings = savedSettings;
            }
        },

        async updateSettings(newSettings: Partial<UserSettings>) {
            this.settings = { ...this.settings, ...newSettings };

            await window.electronAPI.invoke(RendererToMainChannels.UPDATE_SETTINGS, JSON.parse(JSON.stringify(this.settings)));
        },

        addLog(log: string) {
            this.logs.push(log);
        },

        removeLog() {
            this.logs = [];
        }
    }
});