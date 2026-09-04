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

    console.log('══════════════════════════════════');
    console.log('APP INITIALIZATION');
    console.log('══════════════════════════════════');

    AppInitializer.isRunning = true;
    const startTime = Date.now();
    const errors: string[] = [];
    let needsDownload = false;

    // Stage 1: Check IndexedDB state
    console.log('Stage 1');
    console.log('Database Check');
    console.log('START');
    const stage1Start = Date.now();
    try {
      needsDownload = await needsInitialDownload();
      const stage1Duration = Date.now() - stage1Start;
      console.log('Stage 1');
      console.log('Database Check');
      console.log('END');
      console.log(`Duration: ${stage1Duration} ms`);
      console.log(needsDownload ? 'Database empty: true' : 'Database empty: false');
    } catch (error) {
      const stage1Duration = Date.now() - stage1Start;
      console.log('Stage 1');
      console.log('Database Check');
      console.log('END');
      console.log(`Duration: ${stage1Duration} ms`);
      const errorMsg = `Database check failed: ${error}`;
      console.error('Database helper error:', error);
      errors.push(errorMsg);
    }

    // Stage 2: Run Wake-Up Sync
    // Note: wakeUpSync decides internally whether it can sync (checks navigator.onLine)
    // Note: wakeUpSync handles SearchEngine indexing internally if songs changed
    console.log('Stage 2');
    console.log('Wake-Up Sync');
    console.log('START');
    const stage2Start = Date.now();
    try {
      const syncResult = await wakeUpSync('app-start');
      const stage2Duration = Date.now() - stage2Start;
      console.log('Stage 2');
      console.log('Wake-Up Sync');
      console.log('END');
      console.log(`Duration: ${stage2Duration} ms`);
      if (syncResult.success) {
        console.log(`Changed songs: ${syncResult.changedSongs}`);
      } else {
        console.log(`Wake-Up Sync failed: ${syncResult.errors.join(', ')}`);
        errors.push(`WakeUpSync failed: ${syncResult.errors.join(', ')}`);
      }
    } catch (error) {
      const stage2Duration = Date.now() - stage2Start;
      console.log('Stage 2');
      console.log('Wake-Up Sync');
      console.log('END');
      console.log(`Duration: ${stage2Duration} ms`);
      const errorMsg = `WakeUpSync failed: ${error}`;
      console.error('Wake-Up Sync error:', error);
      errors.push(errorMsg);
    }

    // Stage 3: Initialize Realtime Service
    // Note: RealtimeService.initialize() decides internally whether connection is possible
    console.log('Stage 3');
    console.log('Realtime initialization');
    console.log('START');
    const stage3Start = Date.now();
    try {
      RealtimeService.initialize();
      const stage3Duration = Date.now() - stage3Start;
      console.log('Stage 3');
      console.log('Realtime initialization');
      console.log('END');
      console.log(`Duration: ${stage3Duration} ms`);
    } catch (error) {
      const stage3Duration = Date.now() - stage3Start;
      console.log('Stage 3');
      console.log('Realtime initialization');
      console.log('END');
      console.log(`Duration: ${stage3Duration} ms`);
      const errorMsg = `Realtime init failed: ${error}`;
      console.error('Realtime initialization error:', error);
      errors.push(errorMsg);
    }

    const duration = Date.now() - startTime;
    AppInitializer.isRunning = false;

    // Determine status
    let status: StartupStatus;
    if (errors.length === 0) {
      status = 'READY';
      console.log('══════════════════════════');
      console.log('APPLICATION READY');
      console.log('══════════════════════════');
    } else {
      status = 'READY_WITH_WARNINGS';
      console.log('══════════════════════════');
      console.log('APPLICATION READY WITH WARNINGS');
      console.log('══════════════════════════');
    }

    console.log(`Total Duration: ${duration}ms`);
    console.log(`Status: ${status}`);
    if (errors.length > 0) {
      console.log(`Warnings: ${errors.length}`);
      console.log('Errors:', errors);
    }

    console.log('AppInitializer returning InitializationResult');

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
