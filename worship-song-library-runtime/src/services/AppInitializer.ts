import { needsInitialDownload } from '../db/Database';
import { wakeUpSync } from './DataService';
import { RealtimeService } from './RealtimeService';

type StartupStatus = 'READY' | 'READY_WITH_WARNINGS' | 'FAILED';

interface InitializationResult {
  status: StartupStatus;
  needsInitialDownload: boolean;
  errors: string[];
  duration: number;
}

export class AppInitializer {
  private static isRunning = false;

  static async initialize(): Promise<InitializationResult> {
    // Prevent duplicate initialization
    if (AppInitializer.isRunning) {
      console.warn('[AppInitializer] Already running, skipping duplicate call');
      return {
        status: 'READY',
        needsInitialDownload: false,
        errors: [],
        duration: 0
      };
    }

    AppInitializer.isRunning = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let needsDownload = false;

    console.log('[AppInitializer] Starting application...');
    console.log('[AppInitializer] ════════════════════════════════');

    // Stage 1: Check IndexedDB state
    console.log('[AppInitializer] Stage 1: Database');
    try {
      console.log('[Database] Checking...');
      needsDownload = await needsInitialDownload();
      console.log('[Database]', needsDownload ? '✗ Empty' : '✓ Ready');
    } catch (error) {
      const errorMsg = `Database check failed: ${error}`;
      console.error('[Database]', `✗ ${errorMsg}`);
      errors.push(errorMsg);
    }

    // Stage 2: Run Wake-Up Sync
    // Note: wakeUpSync decides internally whether it can sync (checks navigator.onLine)
    // Note: wakeUpSync handles SearchEngine indexing internally if songs changed
    console.log('[AppInitializer] Stage 2: WakeUpSync');
    try {
      console.log('[WakeUpSync] Starting...');
      const syncResult = await wakeUpSync('app-start');
      if (syncResult.success) {
        console.log('[WakeUpSync]', `✓ Completed (${syncResult.changedSongs} changed)`);
      } else {
        console.log('[WakeUpSync]', `✗ Failed: ${syncResult.errors.join(', ')}`);
        errors.push(`WakeUpSync failed: ${syncResult.errors.join(', ')}`);
      }
    } catch (error) {
      const errorMsg = `WakeUpSync failed: ${error}`;
      console.error('[WakeUpSync]', `✗ ${errorMsg}`);
      errors.push(errorMsg);
    }

    // Stage 3: Initialize Realtime Service
    // Note: RealtimeService.initialize() decides internally whether connection is possible
    console.log('[AppInitializer] Stage 3: Realtime');
    try {
      console.log('[Realtime] Connecting...');
      RealtimeService.initialize();
      console.log('[Realtime]', '✓ Connected');
    } catch (error) {
      const errorMsg = `Realtime init failed: ${error}`;
      console.error('[Realtime]', `✗ ${errorMsg}`);
      errors.push(errorMsg);
    }

    const duration = Date.now() - startTime;
    AppInitializer.isRunning = false;

    // Determine status
    let status: StartupStatus;
    if (errors.length === 0) {
      status = 'READY';
      console.log('[AppInitializer] ✓ Application ready');
    } else {
      status = 'READY_WITH_WARNINGS';
      console.log('[AppInitializer] ⚠ Application ready with warnings');
    }

    console.log('[AppInitializer] ════════════════════════════════');
    console.log(`[AppInitializer] Duration: ${duration}ms`);
    console.log(`[AppInitializer] Status: ${status}`);
    if (errors.length > 0) {
      console.log(`[AppInitializer] Warnings: ${errors.length}`);
    }

    return {
      status,
      needsInitialDownload: needsDownload,
      errors,
      duration
    };
  }

  static destroy(): void {
    console.log('[AppInitializer] Shutting down...');

    try {
      RealtimeService.destroy();
      console.log('[Realtime]', '✓ Disconnected');
    } catch (error) {
      console.error('[Realtime]', `✗ Shutdown failed: ${error}`);
    }

    console.log('[AppInitializer]', '✓ Shutdown complete');
  }
}
