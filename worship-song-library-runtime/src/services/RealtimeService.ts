import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';
import type { SongDetail } from '../db/Database';
import { wakeUpSync } from './DataService';
import { SearchEngine } from '../utils/SearchEngine';

export class RealtimeService {
  private static channel: any = null;
  private static isOnline = navigator.onLine;

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

    // Subscribe to songs table changes via Supabase Realtime
    this.subscribeToSongs();

    console.log('✅ Realtime Service initialized');
  }

  /**
   * Handle coming back online
   */
  private static async handleOnline() {
    console.log('🌐 App is back online');
    this.isOnline = true;

    // Re-subscribe if needed
    if (!this.channel) {
      this.subscribeToSongs();
    }

    // Run the lightweight delta sync instead of downloading everything
    const syncResult = await wakeUpSync('online-event');
    console.log('Sync result:', syncResult);

    // Update search engine if songs were changed
    if (syncResult.success && syncResult.changedSongs > 0) {
      const changedSongs = await db.songIndex.toArray();
      await SearchEngine.indexSongs(changedSongs);
    }
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
      updated_at: record.updated_at,
    };
  }

  /**
   * Transform Supabase record to SongIndex format
   */
  private static transformSongIndex(record: any): any {
    return {
      id: record.id,
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
