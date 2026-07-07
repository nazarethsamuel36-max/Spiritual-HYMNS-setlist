import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';
import type { SongDetail } from '../db/Database';

export class RealtimeService {
  private static channel: any = null;
  private static isOnline = navigator.onLine;
  private static syncInProgress = false;

  /**
   * Initialize Realtime Service
   * - Set up online/offline listeners
   * - Subscribe to database changes
   */
  static async initialize() {
    console.log('🔄 Initializing Realtime Service...');

    // Listen to online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // 🔥 TEMPORARY: Comment out WebSocket subscription to prevent connection spam
    // this.subscribeToSongs();

    console.log('✅ Realtime Service initialized (WebSocket disabled for testing)');
  }

  /**
   * Handle coming back online
   */
  private static async handleOnline() {
    console.log('🌐 App is back online - syncing...');
    this.isOnline = true;

    // Re-subscribe if needed
    if (!this.channel) {
      this.subscribeToSongs();
    }

    // Perform full sync to catch any missed changes
    await this.syncFromDatabase();
  }

  /**
   * Handle going offline
   */
  private static handleOffline() {
    console.log('📴 App is offline - using cached data');
    this.isOnline = false;
  }

  /**
   * Subscribe to songs table changes via Supabase Realtime
   */
  private static subscribeToSongs() {
    // Unsubscribe from existing channel if any
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    console.log('📡 Subscribing to songs table changes...');

    // Create new subscription
    this.channel = supabase
      .channel('songs-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'songs',
        },
        async (payload: any) => {
          console.log('📨 Realtime update received:', payload.eventType, payload.new?.title);

          // Update IndexedDB immediately
          await this.handleDatabaseChange(payload);

          // Dispatch custom event to notify UI
          window.dispatchEvent(
            new CustomEvent('song-updated', {
              detail: {
                type: payload.eventType,
                song: payload.new || payload.old,
              },
            })
          );
        }
      )
      .subscribe((status: string) => {
        console.log('📡 Realtime subscription status:', status);
      });
  }

  /**
   * Handle database changes (INSERT, UPDATE, DELETE)
   */
  private static async handleDatabaseChange(payload: any) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      switch (eventType) {
        case 'INSERT':
          console.log('➕ New song added:', newRecord.title);
          await db.songs.put(this.transformSong(newRecord));
          // Also update the index if it exists
          if (newRecord.song_number) {
            await db.songIndex.put(this.transformSongIndex(newRecord));
          }
          break;

        case 'UPDATE':
          console.log('✏️ Song updated:', newRecord.title);
          await db.songs.put(this.transformSong(newRecord));
          // Also update the index if it exists
          if (newRecord.song_number) {
            await db.songIndex.put(this.transformSongIndex(newRecord));
          }
          break;

        case 'DELETE':
          console.log('🗑️ Song deleted:', oldRecord.id);
          await db.songs.delete(oldRecord.id);
          if (oldRecord.song_number) {
            await db.songIndex.delete(oldRecord.song_number);
          }
          break;
      }
    } catch (error) {
      console.error('❌ Error handling database change:', error);
    }
  }

  /**
   * Transform Supabase record to SongDetail format
   */
  private static transformSong(record: any): SongDetail {
    return {
      id: record.id,
      songNumber: record.song_number,
      title: record.title,
      artist: record.artist || '',
      composer: record.composer || '',
      language: record.language || 'English',
      originalKey: record.original_key || 'C',
      capo: record.capo || 0,
      bpm: record.bpm || 0,
      timeSignature: record.time_signature || '4/4',
      hashtags: [],
      sections: [],
      chords: record.chords || '',
      lyrics: record.lyrics || '',
      isPublished: record.is_published !== false,
      is_active: record.is_active !== false,
    };
  }

  /**
   * Transform Supabase record to SongIndex format
   */
  private static transformSongIndex(record: any): any {
    return {
      songNumber: record.song_number,
      title: record.title,
      artist: record.artist || '',
      language: record.language || 'English',
      key: record.original_key || 'C',
      chords: record.chords || '',
      lyrics: record.lyrics || '',
      is_active: record.is_active !== false,
    };
  }

  /**
   * Full sync from database (called when coming online)
   */
  private static async syncFromDatabase() {
    if (this.syncInProgress) {
      console.log('⏳ Sync already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Performing full sync from database...');

    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        // Update all songs in IndexedDB
        await db.transaction('rw', db.songs, db.songIndex, async () => {
          for (const record of data) {
            await db.songs.put(this.transformSong(record));
            if (record.song_number) {
              await db.songIndex.put(this.transformSongIndex(record));
            }
          }
        });
        console.log(`✅ Synced ${data.length} songs from database`);
      }
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
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
    console.log('🛑 Destroying Realtime Service...');
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
