import { wakeUpSync } from './DataService';

export class RealtimeService {
  private static isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  /**
   * Initialize Realtime Service (Static Mode)
   * - Set up online/offline listeners
   * - No websocket connections to external databases
   */
  static async initialize() {
    console.log('🔄 Initializing Realtime Service (Static mode)...');

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }

    console.log('✅ Realtime Service initialized (static mode — no websocket)');
  }

  /**
   * Handle coming back online
   */
  private static async handleOnline() {
    console.log('🌐 App is back online');
    this.isOnline = true;

    // Check manifest sync
    const syncResult = await wakeUpSync('online-event');
    console.log('Sync result:', syncResult);
  }

  /**
   * Handle going offline
   */
  private static handleOffline() {
    console.log('📴 App is offline - using cached data');
    this.isOnline = false;
  }

  /**
   * Check if app is currently online
   */
  static getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Cleanup
   */
  static destroy() {
    console.log('🛑 Realtime Service stopped');
  }
}
