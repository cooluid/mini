/// <reference types="electron" />

import { app } from 'electron';
import { initApp } from './initApp';
import { performanceMonitor } from './services/PerformanceMonitor';
import { logSend } from './utils/logger';

// app.disableHardwareAcceleration();

async function main() {
  try {
    performanceMonitor.logAppMetrics();
    await initApp();
  } catch (error) {
    logSend.error('Failed to initialize app:', error);
    if (error instanceof Error) {
      logSend.error('Error details:', error.message, error.stack);
    }
  }
}

app.whenReady().then(main).catch((error) => {
  logSend.error('Error in app.whenReady():', error);
  if (error instanceof Error) {
    logSend.error('Error details:', error.message, error.stack);
  }
});
