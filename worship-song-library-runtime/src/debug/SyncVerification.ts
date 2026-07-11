import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';
import type { SongDetail, SongIndex } from '../db/Database';
import { wakeUpSync } from '../services/DataService';

interface TestSong {
  id: number;
  songNumber: number;
  title: string;
  updated_at: string;
}

interface IndexedDBState {
  songs: SongDetail | null;
  songIndex: SongIndex | null;
}

interface ComparisonResult {
  match: boolean;
  differences: string[];
}

if (import.meta.env.DEV) {
  /**
   * Helper: Fetch first active song from Supabase
   */
  async function fetchTestSong(): Promise<TestSong | null> {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id, song_number, title, updated_at')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        songNumber: data.song_number,
        title: data.title,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('❌ Failed to fetch test song:', error);
      return null;
    }
  }

  /**
   * Helper: Read IndexedDB state for a song
   */
  async function readIndexedDBState(songId: number): Promise<IndexedDBState> {
    try {
      const songs = await db.songs.get(songId);
      const songIndex = await db.songIndex.get(songId);
      return { songs: songs || null, songIndex: songIndex || null };
    } catch (error) {
      console.error('❌ Failed to read IndexedDB:', error);
      return { songs: null, songIndex: null };
    }
  }

  /**
   * Helper: Compare records
   */
  function compareRecords(
    supabaseRecord: any,
    indexedDBRecord: any,
    tableName: string
  ): ComparisonResult {
    const differences: string[] = [];

    if (!supabaseRecord || !indexedDBRecord) {
      return { match: false, differences: ['Missing record'] };
    }

    // Compare key fields
    const keyFields = ['id', 'title', 'updated_at'];
    if (tableName === 'songs') {
      keyFields.push('songNumber', 'language');
    }

    for (const field of keyFields) {
      const supabaseValue = supabaseRecord[field];
      const dbValue = indexedDBRecord[field];

      if (supabaseValue !== dbValue) {
        differences.push(`${field}: Supabase=${supabaseValue}, DB=${dbValue}`);
      }
    }

    return { match: differences.length === 0, differences };
  }

  /**
   * Test 1: Realtime Synchronization (Polling-based)
   * Accepts optional song ID parameter, or auto-selects first active song
   */
  async function runRealtimeTest(songId?: number): Promise<boolean> {
    console.log('\n================================');
    console.log('REALTIME TEST');
    console.log('================================\n');

    let testSong: TestSong | null = null;

    if (songId) {
      // Fetch specific song
      const { data, error } = await supabase
        .from('songs')
        .select('id, song_number, title, updated_at')
        .eq('id', songId)
        .single();

      if (error || !data) {
        console.log(`❌ Failed to fetch song ID ${songId}`);
        return false;
      }

      testSong = {
        id: data.id,
        songNumber: data.song_number,
        title: data.title,
        updated_at: data.updated_at
      };
    } else {
      // Auto-fetch first active song
      testSong = await fetchTestSong();
      if (!testSong) {
        console.log('❌ Failed to fetch test song');
        return false;
      }
    }

    console.log(`Realtime Test Started`);
    console.log(`Watching Song ID: ${testSong.id}`);

    // Read initial IndexedDB state
    const initialState = await readIndexedDBState(testSong.id);

    if (!initialState.songs) {
      console.log(`\n❌ FAIL: Song ID ${testSong.id} not found in IndexedDB`);
      return false;
    }

    console.log('\nIndexedDB BEFORE');
    console.log(`Title: ${initialState.songs.title}`);
    console.log(`updated_at: ${initialState.songs.updated_at}`);

    // Poll IndexedDB for changes (observing existing RealtimeService)
    console.log('\nWaiting for realtime update...');
    console.log('(This observes the existing RealtimeService without creating a duplicate subscription)');

    const initialUpdatedAt = initialState.songs.updated_at || '';
    let changeDetected = false;
    let pollCount = 0;
    const maxPolls = 30; // 30 polls * 2 seconds = 60 seconds

    while (!changeDetected && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      pollCount++;

      const currentState = await readIndexedDBState(testSong.id);
      const currentUpdatedAt = currentState.songs?.updated_at || '';

      if (currentUpdatedAt !== initialUpdatedAt) {
        console.log(`\n✅ Change detected after ${pollCount * 2} seconds!`);

        // Wait 500ms for db.songs.put() to complete
        console.log('Waiting 500ms for db.songs.put() to complete...');
        await new Promise(resolve => setTimeout(resolve, 500));

        changeDetected = true;
      }
    }

    if (!changeDetected) {
      console.log('\n❌ FAIL: No realtime event received within 60 seconds');
      console.log('Connection issue or no edit was made.');
      return false;
    }

    // Read IndexedDB again after change
    const newState = await readIndexedDBState(testSong.id);

    if (!newState.songs) {
      console.log('\n❌ FAIL: Song disappeared from IndexedDB after update');
      return false;
    }

    console.log('\nIndexedDB AFTER');
    console.log(`Title: ${newState.songs.title}`);
    console.log(`updated_at: ${newState.songs.updated_at}`);

    // Check if IndexedDB actually changed
    const titleChanged = initialState.songs.title !== newState.songs.title;
    const updatedAtChanged = initialState.songs.updated_at !== newState.songs.updated_at;

    console.log('\n↓');

    if (!titleChanged && !updatedAtChanged) {
      console.log('\n❌ FAIL');
      console.log('IndexedDB unchanged');
      console.log('db.songs.put() did not persist the update.');
      return false;
    }

    console.log('\n✅ PASS');
    console.log('Realtime successfully updated IndexedDB.');
    return true;
  }

  /**
   * Test 2: Wake-Up Sync
   */
  async function runWakeUpSyncTest(): Promise<boolean> {
    console.log('\n================================');
    console.log('WAKE-UP SYNC TEST');
    console.log('================================\n');

    const testSong = await fetchTestSong();
    if (!testSong) {
      console.log('❌ Failed to fetch test song');
      return false;
    }

    console.log(`Test Song: #${testSong.songNumber} - ${testSong.title}`);
    console.log(`Song ID: ${testSong.id}`);

    // Read initial IndexedDB state
    const initialState = await readIndexedDBState(testSong.id);
    console.log('\nInitial IndexedDB State:');
    console.log('  songs:', initialState.songs ? 'PRESENT' : 'MISSING');
    console.log('  songIndex:', initialState.songIndex ? 'PRESENT' : 'MISSING');

    // Wait for user to edit song
    console.log('\n⚠️  Please edit this song from the admin app now.');
    console.log('Press Enter in the console when done...');

    await new Promise<void>((resolve) => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          window.removeEventListener('keydown', handler);
          resolve();
        }
      };
      window.addEventListener('keydown', handler);
    });

    console.log('\nRunning wakeUpSync()...');
    await wakeUpSync();

    // Read IndexedDB again
    console.log('Reading IndexedDB after wakeUpSync()...');
    const newState = await readIndexedDBState(testSong.id);
    console.log('  songs:', newState.songs ? 'PRESENT' : 'MISSING');
    console.log('  songIndex:', newState.songIndex ? 'PRESENT' : 'MISSING');

    // Fetch updated Supabase record
    const { data: updatedSong } = await supabase
      .from('songs')
      .select('id, song_number, title, updated_at')
      .eq('id', testSong.id)
      .single();

    if (!updatedSong) {
      console.log('\n❌ FAIL: Could not fetch updated song from Supabase');
      return false;
    }

    // Compare updated state
    const songsComparison = compareRecords(updatedSong, newState.songs, 'songs');
    const indexComparison = compareRecords(updatedSong, newState.songIndex, 'songIndex');

    console.log('\nAfter wakeUpSync comparison:');
    console.log(`  songs table: ${songsComparison.match ? 'MATCH' : 'MISMATCH'}`);
    console.log(`  songIndex table: ${indexComparison.match ? 'MATCH' : 'MISMATCH'}`);

    if (!songsComparison.match) {
      console.log('  songs differences:', songsComparison.differences);
    }
    if (!indexComparison.match) {
      console.log('  songIndex differences:', indexComparison.differences);
    }

    const passed = songsComparison.match && indexComparison.match;
    console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'}`);
    return passed;
  }

  /**
   * Find Missing Songs Diagnostic
   */
  async function findMissingSongs(): Promise<void> {
    console.log('\n================================');
    console.log('FIND MISSING SONGS');
    console.log('================================\n');

    // Fetch all active song IDs from Supabase
    const { data: supabaseSongs, error } = await supabase
      .from('songs')
      .select('id, song_number, title, is_active, updated_at');

    if (error) {
      console.log('❌ Failed to fetch songs from Supabase:', error);
      return;
    }

    const supabaseIds = new Set(supabaseSongs?.map((s: any) => s.id) || []);
    console.log(`Supabase active songs: ${supabaseIds.size}`);

    // Fetch all song IDs from IndexedDB songs table
    const allDbSongs = await db.songs.toArray();
    const dbSongIds = new Set(allDbSongs.map((s) => s.id));
    console.log(`IndexedDB songs: ${dbSongIds.size}`);

    // Fetch all song IDs from IndexedDB songIndex table
    const allDbIndex = await db.songIndex.toArray();
    const dbIndexIds = new Set(allDbIndex.map((s) => s.id));
    console.log(`IndexedDB songIndex: ${dbIndexIds.size}`);

    // Find missing from songs table
    const missingFromSongs = [...supabaseIds].filter((id) => !dbSongIds.has(id));
    console.log(`\nMissing from IndexedDB songs: ${missingFromSongs.length}`);

    if (missingFromSongs.length > 0) {
      console.log('\nMissing songs details:');
      for (const id of missingFromSongs) {
        const song = supabaseSongs?.find((s: any) => s.id === id);
        if (song) {
          console.log(`\n- Song ID: ${id}`);
          console.log(`  Title: "${song.title}"`);
          console.log(`  Song Number: ${song.song_number}`);
          console.log(`  is_active: ${song.is_active}`);
          console.log(`  updated_at: ${song.updated_at}`);
          console.log(`  In songIndex: ${dbIndexIds.has(id) ? 'YES' : 'NO'}`);

          // Analyze why it might be missing
          const analysis: string[] = [];
          if (!song.is_active) {
            analysis.push('Song is inactive (is_active=false)');
          }
          if (dbIndexIds.has(id)) {
            analysis.push('Exists in songIndex but not in songs table - likely a transform issue');
          } else {
            analysis.push('Missing from both tables - likely missed during initial sync or deleted locally');
          }
          console.log(`  Analysis: ${analysis.join(', ')}`);
        }
      }
    }

    // Find missing from songIndex table
    const missingFromIndex = [...supabaseIds].filter((id) => !dbIndexIds.has(id));
    console.log(`\nMissing from IndexedDB songIndex: ${missingFromIndex.length}`);

    if (missingFromIndex.length > 0) {
      console.log('\nMissing from songIndex details:');
      for (const id of missingFromIndex) {
        const song = supabaseSongs?.find((s: any) => s.id === id);
        if (song) {
          console.log(`\n- Song ID: ${id}`);
          console.log(`  Title: "${song.title}"`);
          console.log(`  In songs: ${dbSongIds.has(id) ? 'YES' : 'NO'}`);
        }
      }
    }

    // Summary
    console.log('\n================================');
    console.log('SUMMARY');
    console.log('================================');
    console.log(`Supabase: ${supabaseIds.size} songs`);
    console.log(`IndexedDB songs: ${dbSongIds.size} songs`);
    console.log(`IndexedDB songIndex: ${dbIndexIds.size} songs`);
    console.log(`Missing from songs: ${missingFromSongs.length}`);
    console.log(`Missing from songIndex: ${missingFromIndex.length}`);
  }

  /**
   * Permanent Database Consistency Report
   * Run before every release to ensure data integrity
   */
  async function runConsistencyReport(): Promise<boolean> {
    console.log('\n================================');
    console.log('DATABASE CONSISTENCY REPORT');
    console.log('================================\n');

    // Fetch all active songs from Supabase
    const { data: supabaseSongs, error } = await supabase
      .from('songs')
      .select('id')
      .eq('is_active', true);

    if (error) {
      console.log('❌ Failed to fetch songs from Supabase:', error);
      return false;
    }

    const supabaseCount = supabaseSongs?.length || 0;
    console.log(`Supabase active songs: ${supabaseCount}`);

    // Read IndexedDB counts
    const songsCount = await db.songs.count();
    const songIndexCount = await db.songIndex.count();

    console.log(`IndexedDB songs: ${songsCount}`);
    console.log(`IndexedDB songIndex: ${songIndexCount}`);

    // Compare counts
    const countsMatch = supabaseCount === songsCount && songsCount === songIndexCount;
    console.log(`\nCounts: ${countsMatch ? 'MATCH' : 'MISMATCH'}`);

    // Sample comparison (check 10 random songs for more thorough verification)
    if (supabaseSongs && supabaseSongs.length > 0) {
      console.log('\nSample comparison (10 random songs):');
      const sampleSize = Math.min(10, supabaseSongs.length);
      const sampleIds = supabaseSongs
        .sort(() => Math.random() - 0.5)
        .slice(0, sampleSize)
        .map((s: any) => s.id);

      let sampleMatches = 0;
      for (const id of sampleIds) {
        const dbSong = await db.songs.get(id);
        const dbIndex = await db.songIndex.get(id);
        const supabaseSong = await supabase
          .from('songs')
          .select('id, title, song_number, updated_at')
          .eq('id', id)
          .single();

        if (supabaseSong.data && dbSong && dbIndex) {
          const songMatch = compareRecords(supabaseSong.data, dbSong, 'songs').match;
          const indexMatch = compareRecords(supabaseSong.data, dbIndex, 'songIndex').match;
          if (songMatch && indexMatch) {
            sampleMatches++;
          }
        }
      }

      const samplePassed = sampleMatches === sampleSize;
      console.log(`Sample: ${samplePassed ? 'MATCH' : 'MISMATCH'} (${sampleMatches}/${sampleSize})`);

      const passed = countsMatch && samplePassed;
      console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log('================================');
      return passed;
    }

    console.log('\n✅ PASS (no songs to compare)');
    console.log('================================');
    return true;
  }

  /**
   * Test 3: Database Comparison (legacy, use runConsistencyReport instead)
   */
  async function runDatabaseComparison(): Promise<boolean> {
    return runConsistencyReport();
  }

  /**
   * Main verification function
   */
  async function runSyncVerification() {
    console.log('═══════════════════════════════');
    console.log('SYNC VERIFICATION');
    console.log('═══════════════════════════════');

    const results: { [key: string]: boolean } = {};

    // Run Realtime Test
    console.log('\nRunning Realtime Test...');
    results.realtime = await runRealtimeTest();

    // Run Wake-Up Sync Test
    console.log('\nRunning Wake-Up Sync Test...');
    results.wakeUpSync = await runWakeUpSyncTest();

    // Run Database Comparison
    console.log('\nRunning Database Comparison...');
    results.database = await runDatabaseComparison();

    // Final Report
    console.log('\n================================');
    console.log('FINAL REPORT');
    console.log('================================\n');
    console.log(`Realtime: ${results.realtime ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Wake-Up Sync: ${results.wakeUpSync ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Database Comparison: ${results.database ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = Object.values(results).every((r) => r);
    console.log(`\n${allPassed ? '✅ All synchronization mechanisms verified.' : '❌ Some tests failed.'}`);
    console.log('═══════════════════════════════');
  }

  // Expose to window
  (window as any).runSyncVerification = runSyncVerification;
  (window as any).runRealtimeTest = runRealtimeTest;
  (window as any).runWakeUpSyncTest = runWakeUpSyncTest;
  (window as any).runDatabaseComparison = runDatabaseComparison;
  (window as any).runConsistencyReport = runConsistencyReport;
  (window as any).findMissingSongs = findMissingSongs;
  (window as any).runWakeUpSync = wakeUpSync;

  console.log('🔧 Sync Verification Tool loaded. Use:');
  console.log('  window.runSyncVerification()');
  console.log('  window.runRealtimeTest()');
  console.log('  window.runWakeUpSyncTest()');
  console.log('  window.runConsistencyReport()');
  console.log('  window.findMissingSongs()');
  console.log('  window.runWakeUpSync() - Manually trigger Wake-Up Sync');
}

// Global state for wake-up sync verification
let wakeUpSyncState: {
  initialSyncTime: number | null;
  initialSongCount: number;
  startTime: number | null;
} = {
  initialSyncTime: null,
  initialSongCount: 0,
  startTime: null
};

// Load verification tools in both dev and production
{
  /**
   * Helper: Format timestamp for display
   */
  function formatTimestamp(timestamp: number | string): string {
    if (typeof timestamp === 'number') {
      return new Date(timestamp).toISOString();
    }
    return timestamp;
  }

  /**
   * Helper: Format time for display (HH:MM:SS)
   */
  function formatTime(date: Date): string {
    return date.toTimeString().split(' ')[0];
  }

  /**
   * Phase 1: Wake-Up Sync Verification - Initial Setup
   */
  async function runWakeUpSyncVerification(): Promise<void> {
    console.log('\n============================');
    console.log('WAKE-UP SYNC VERIFICATION');
    console.log('============================\n');

    try {
      // Get last sync time from IndexedDB
      const syncMeta = await db.meta.get('lastSyncTime');
      const lastSyncTime = syncMeta?.value as number || null;
      wakeUpSyncState.initialSyncTime = lastSyncTime;

      // Get current time
      const currentTime = Date.now();

      // Get IndexedDB song count
      const indexedDBCount = await db.songs.count();
      wakeUpSyncState.initialSongCount = indexedDBCount;

      // Get Supabase active song count
      const { data: supabaseSongs } = await supabase
        .from('songs')
        .select('id')
        .eq('is_active', true);

      const supabaseCount = supabaseSongs?.length || 0;

      // Print status
      console.log(`Last Sync Time: ${lastSyncTime ? formatTimestamp(lastSyncTime) : 'Never'}`);
      console.log(`Current Time: ${formatTimestamp(currentTime)}`);
      console.log(`IndexedDB Song Count: ${indexedDBCount}`);
      console.log(`Supabase Active Song Count: ${supabaseCount}`);

      // Print instructions
      console.log('\nNext Step:');
      console.log('1. Close the app OR disconnect internet.');
      console.log('2. Edit one song from Admin.');
      console.log('3. Save.');
      console.log('4. Reopen the app.');
      console.log('5. Run: window.continueWakeUpSyncVerification()');

    } catch (error) {
      console.error('❌ Error during initial setup:', error);
    }
  }

  /**
   * Phase 2: Wake-Up Sync Verification - Execute and Verify
   */
  async function continueWakeUpSyncVerification(): Promise<void> {
    console.log('\n============================');
    console.log('WAKE-UP SYNC VERIFICATION');
    console.log('============================\n');

    const startTime = Date.now();
    wakeUpSyncState.startTime = startTime;

    console.log(`Wake-Up Sync started: ${formatTime(new Date(startTime))}`);

    try {
      // Print last sync time
      const lastSyncTime = wakeUpSyncState.initialSyncTime;
      console.log(`\nLast Sync: ${lastSyncTime ? formatTimestamp(lastSyncTime) : 'Never'}`);

      // Search Supabase for changes
      console.log('\nSearching Supabase for changes...');

      let changedIds: number[] = [];
      if (lastSyncTime) {
        const lastSyncDate = new Date(lastSyncTime).toISOString();
        const { data, error } = await supabase
          .from('songs')
          .select('id')
          .gt('updated_at', lastSyncDate)
          .eq('is_active', true);

        if (!error && data) {
          changedIds = data.map((s: any) => s.id);
        }
      }

      console.log(`Changed songs found: ${changedIds.length}`);
      if (changedIds.length > 0) {
        console.log(`Song IDs: ${changedIds.join(', ')}`);
      }

      // Execute wake-up sync
      console.log('\nExecuting wakeUpSync()...');
      await wakeUpSync();
      const afterSyncTime = Date.now();
      console.log(`Downloaded changes: ${formatTime(new Date(afterSyncTime))}`);

      // Verify each changed song
      if (changedIds.length > 0) {
        console.log('\nVerifying downloaded songs:');

        const { data: changedSongs } = await supabase
          .from('songs')
          .select('*')
          .in('id', changedIds);

        let allMatch = true;

        for (const song of changedSongs || []) {
          console.log(`\nDownloading:`);
          console.log(`Song ${song.id}`);
          console.log(`Updated_at: ${song.updated_at}`);
          console.log(`Title: ${song.title}`);

          // Read from IndexedDB
          const dbSong = await db.songs.get(song.id);
          const dbIndex = await db.songIndex.get(song.id);

          if (dbSong && dbIndex) {
            const titleMatch = dbSong.title === song.title;
            const updatedAtMatch = dbSong.updated_at === song.updated_at;

            console.log(`\nSupabase: ${song.title}`);
            console.log(`IndexedDB: ${dbSong.title}`);
            console.log(`MATCH? ${titleMatch && updatedAtMatch ? 'YES' : 'NO'}`);

            if (!titleMatch || !updatedAtMatch) {
              allMatch = false;
            }
          } else {
            console.log(`\n❌ Song not found in IndexedDB`);
            allMatch = false;
          }
        }

        // Print timings
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log('\nTimings:');
        console.log(`Wake-Up Sync started: ${formatTime(new Date(startTime))}`);
        console.log(`Downloaded changes: ${formatTime(new Date(afterSyncTime))}`);
        console.log(`IndexedDB updated: ${formatTime(new Date(endTime))}`);
        console.log(`Completed in: ${duration} ms`);

        // Final report
        console.log('\n=========================');
        console.log('WAKE-UP SYNC REPORT');
        console.log('=========================\n');

        console.log(`Last Sync: ${lastSyncTime ? 'PASS' : 'N/A'}`);
        console.log(`Changed Songs Found: ${changedIds.length > 0 ? 'PASS' : 'N/A'}`);
        console.log(`Downloaded: ${changedIds.length > 0 ? 'PASS' : 'N/A'}`);
        console.log(`IndexedDB Updated: ${allMatch ? 'PASS' : 'FAIL'}`);
        console.log(`Offline Cache Updated: ${allMatch ? 'PASS' : 'FAIL'}`);

        console.log('\n=========================');
        console.log(allMatch ? 'Wake-Up Sync Verified' : 'Wake-Up Sync Failed');
        console.log('=========================');

      } else {
        console.log('\nNo changes to verify.');
        console.log('This is expected if no songs were edited during offline period.');
      }

    } catch (error) {
      console.error('❌ Error during wake-up sync verification:', error);
    }
  }

  /**
   * Helper: Fetch first active song from Supabase
   */
  async function fetchTestSong(): Promise<TestSong | null> {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id, song_number, title, updated_at')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        songNumber: data.song_number,
        title: data.title,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('❌ Failed to fetch test song:', error);
      return null;
    }
  }

  /**
   * Helper: Read IndexedDB state for a song
   */
  async function readIndexedDBState(songId: number): Promise<IndexedDBState> {
    try {
      const songs = await db.songs.get(songId);
      const songIndex = await db.songIndex.get(songId);
      return { songs: songs || null, songIndex: songIndex || null };
    } catch (error) {
      console.error('❌ Failed to read IndexedDB:', error);
      return { songs: null, songIndex: null };
    }
  }

  /**
   * Helper: Compare records
   */
  function compareRecords(
    supabaseRecord: any,
    indexedDBRecord: any,
    tableName: string
  ): ComparisonResult {
    const differences: string[] = [];

    if (!supabaseRecord || !indexedDBRecord) {
      return { match: false, differences: ['Missing record'] };
    }

    // Compare key fields
    const keyFields = ['id', 'title', 'updated_at'];
    if (tableName === 'songs') {
      keyFields.push('songNumber', 'language');
    }

    for (const field of keyFields) {
      const supabaseValue = supabaseRecord[field];
      const dbValue = indexedDBRecord[field];

      if (supabaseValue !== dbValue) {
        differences.push(`${field}: Supabase=${supabaseValue}, DB=${dbValue}`);
      }
    }

    return { match: differences.length === 0, differences };
  }

  /**
   * Test 1: Realtime Synchronization (Polling-based)
   * Accepts optional song ID parameter, or auto-selects first active song
   */
  async function runRealtimeTest(songId?: number): Promise<boolean> {
    console.log('\n================================');
    console.log('REALTIME TEST');
    console.log('================================\n');

    let testSong: TestSong | null = null;

    if (songId) {
      // Fetch specific song
      const { data, error } = await supabase
        .from('songs')
        .select('id, song_number, title, updated_at')
        .eq('id', songId)
        .single();

      if (error || !data) {
        console.log(`❌ Failed to fetch song ID ${songId}`);
        return false;
      }

      testSong = {
        id: data.id,
        songNumber: data.song_number,
        title: data.title,
        updated_at: data.updated_at
      };
    } else {
      // Auto-fetch first active song
      testSong = await fetchTestSong();
      if (!testSong) {
        console.log('❌ Failed to fetch test song');
        return false;
      }
    }

    console.log(`Realtime Test Started`);
    console.log(`Watching Song ID: ${testSong.id}`);

    // Read initial IndexedDB state
    const initialState = await readIndexedDBState(testSong.id);

    if (!initialState.songs) {
      console.log(`\n❌ FAIL: Song ID ${testSong.id} not found in IndexedDB`);
      return false;
    }

    console.log('\nIndexedDB BEFORE');
    console.log(`Title: ${initialState.songs.title}`);
    console.log(`updated_at: ${initialState.songs.updated_at}`);

    // Poll IndexedDB for changes (observing existing RealtimeService)
    console.log('\nWaiting for realtime update...');
    console.log('(This observes the existing RealtimeService without creating a duplicate subscription)');

    const initialUpdatedAt = initialState.songs.updated_at || '';
    let changeDetected = false;
    let pollCount = 0;
    const maxPolls = 30; // 30 polls * 2 seconds = 60 seconds

    while (!changeDetected && pollCount < maxPolls) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      pollCount++;

      const currentState = await readIndexedDBState(testSong.id);
      const currentUpdatedAt = currentState.songs?.updated_at || '';

      if (currentUpdatedAt !== initialUpdatedAt) {
        console.log(`\n✅ Change detected after ${pollCount * 2} seconds!`);

        // Wait 500ms for db.songs.put() to complete
        console.log('Waiting 500ms for db.songs.put() to complete...');
        await new Promise(resolve => setTimeout(resolve, 500));

        changeDetected = true;
      }
    }

    if (!changeDetected) {
      console.log('\n❌ FAIL: No realtime event received within 60 seconds');
      console.log('Connection issue or no edit was made.');
      return false;
    }

    // Read IndexedDB again after change
    const newState = await readIndexedDBState(testSong.id);

    if (!newState.songs) {
      console.log('\n❌ FAIL: Song disappeared from IndexedDB after update');
      return false;
    }

    console.log('\nIndexedDB AFTER');
    console.log(`Title: ${newState.songs.title}`);
    console.log(`updated_at: ${newState.songs.updated_at}`);

    // Check if IndexedDB actually changed
    const titleChanged = initialState.songs.title !== newState.songs.title;
    const updatedAtChanged = initialState.songs.updated_at !== newState.songs.updated_at;

    console.log('\n↓');

    if (!titleChanged && !updatedAtChanged) {
      console.log('\n❌ FAIL');
      console.log('IndexedDB unchanged');
      console.log('db.songs.put() did not persist the update.');
      return false;
    }

    console.log('\n✅ PASS');
    console.log('Realtime successfully updated IndexedDB.');
    return true;
  }

  /**
   * Test 2: Wake-Up Sync
   */
  async function runWakeUpSyncTest(): Promise<boolean> {
    console.log('\n================================');
    console.log('WAKE-UP SYNC TEST');
    console.log('================================\n');

    const testSong = await fetchTestSong();
    if (!testSong) {
      console.log('❌ Failed to fetch test song');
      return false;
    }

    console.log(`Test Song: #${testSong.songNumber} - ${testSong.title}`);
    console.log(`Song ID: ${testSong.id}`);

    // Read initial IndexedDB state
    const initialState = await readIndexedDBState(testSong.id);
    console.log('\nInitial IndexedDB State:');
    console.log('  songs:', initialState.songs ? 'PRESENT' : 'MISSING');
    console.log('  songIndex:', initialState.songIndex ? 'PRESENT' : 'MISSING');

    // Wait for user to edit song
    console.log('\n⚠️  Please edit this song from the admin app now.');
    console.log('Press Enter in the console when done...');

    await new Promise<void>((resolve) => {
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          window.removeEventListener('keydown', handler);
          resolve();
        }
      };
      window.addEventListener('keydown', handler);
    });

    console.log('\nRunning wakeUpSync()...');
    await wakeUpSync();

    // Read IndexedDB again
    console.log('Reading IndexedDB after wakeUpSync()...');
    const newState = await readIndexedDBState(testSong.id);
    console.log('  songs:', newState.songs ? 'PRESENT' : 'MISSING');
    console.log('  songIndex:', newState.songIndex ? 'PRESENT' : 'MISSING');

    // Fetch updated Supabase record
    const { data: updatedSong } = await supabase
      .from('songs')
      .select('id, song_number, title, updated_at')
      .eq('id', testSong.id)
      .single();

    if (!updatedSong) {
      console.log('\n❌ FAIL: Could not fetch updated song from Supabase');
      return false;
    }

    // Compare updated state
    const songsComparison = compareRecords(updatedSong, newState.songs, 'songs');
    const indexComparison = compareRecords(updatedSong, newState.songIndex, 'songIndex');

    console.log('\nAfter wakeUpSync comparison:');
    console.log(`  songs table: ${songsComparison.match ? 'MATCH' : 'MISMATCH'}`);
    console.log(`  songIndex table: ${indexComparison.match ? 'MATCH' : 'MISMATCH'}`);

    if (!songsComparison.match) {
      console.log('  songs differences:', songsComparison.differences);
    }
    if (!indexComparison.match) {
      console.log('  songIndex differences:', indexComparison.differences);
    }

    const passed = songsComparison.match && indexComparison.match;
    console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'}`);
    return passed;
  }

  /**
   * Find Missing Songs Diagnostic
   */
  async function findMissingSongs(): Promise<void> {
    console.log('\n================================');
    console.log('FIND MISSING SONGS');
    console.log('================================\n');

    // Fetch all active song IDs from Supabase
    const { data: supabaseSongs, error } = await supabase
      .from('songs')
      .select('id, song_number, title, is_active, updated_at');

    if (error) {
      console.log('❌ Failed to fetch songs from Supabase:', error);
      return;
    }

    const supabaseIds = new Set(supabaseSongs?.map((s: any) => s.id) || []);
    console.log(`Supabase active songs: ${supabaseIds.size}`);

    // Fetch all song IDs from IndexedDB songs table
    const allDbSongs = await db.songs.toArray();
    const dbSongIds = new Set(allDbSongs.map((s) => s.id));
    console.log(`IndexedDB songs: ${dbSongIds.size}`);

    // Fetch all song IDs from IndexedDB songIndex table
    const allDbIndex = await db.songIndex.toArray();
    const dbIndexIds = new Set(allDbIndex.map((s) => s.id));
    console.log(`IndexedDB songIndex: ${dbIndexIds.size}`);

    // Find missing from songs table
    const missingFromSongs = [...supabaseIds].filter((id) => !dbSongIds.has(id));
    console.log(`\nMissing from IndexedDB songs: ${missingFromSongs.length}`);

    if (missingFromSongs.length > 0) {
      console.log('\nMissing songs details:');
      for (const id of missingFromSongs) {
        const song = supabaseSongs?.find((s: any) => s.id === id);
        if (song) {
          console.log(`\n- Song ID: ${id}`);
          console.log(`  Title: "${song.title}"`);
          console.log(`  Song Number: ${song.song_number}`);
          console.log(`  is_active: ${song.is_active}`);
          console.log(`  updated_at: ${song.updated_at}`);
          console.log(`  In songIndex: ${dbIndexIds.has(id) ? 'YES' : 'NO'}`);

          // Analyze why it might be missing
          const analysis: string[] = [];
          if (!song.is_active) {
            analysis.push('Song is inactive (is_active=false)');
          }
          if (dbIndexIds.has(id)) {
            analysis.push('Exists in songIndex but not in songs table - likely a transform issue');
          } else {
            analysis.push('Missing from both tables - likely missed during initial sync or deleted locally');
          }
          console.log(`  Analysis: ${analysis.join(', ')}`);
        }
      }
    }

    // Find missing from songIndex table
    const missingFromIndex = [...supabaseIds].filter((id) => !dbIndexIds.has(id));
    console.log(`\nMissing from IndexedDB songIndex: ${missingFromIndex.length}`);

    if (missingFromIndex.length > 0) {
      console.log('\nMissing from songIndex details:');
      for (const id of missingFromIndex) {
        const song = supabaseSongs?.find((s: any) => s.id === id);
        if (song) {
          console.log(`\n- Song ID: ${id}`);
          console.log(`  Title: "${song.title}"`);
          console.log(`  In songs: ${dbSongIds.has(id) ? 'YES' : 'NO'}`);
        }
      }
    }

    // Summary
    console.log('\n================================');
    console.log('SUMMARY');
    console.log('================================');
    console.log(`Supabase: ${supabaseIds.size} songs`);
    console.log(`IndexedDB songs: ${dbSongIds.size} songs`);
    console.log(`IndexedDB songIndex: ${dbIndexIds.size} songs`);
    console.log(`Missing from songs: ${missingFromSongs.length}`);
    console.log(`Missing from songIndex: ${missingFromIndex.length}`);
  }

  /**
   * Permanent Database Consistency Report
   * Run before every release to ensure data integrity
   */
  async function runConsistencyReport(): Promise<boolean> {
    console.log('\n================================');
    console.log('DATABASE CONSISTENCY REPORT');
    console.log('================================\n');

    // Fetch all active songs from Supabase
    const { data: supabaseSongs, error } = await supabase
      .from('songs')
      .select('id')
      .eq('is_active', true);

    if (error) {
      console.log('❌ Failed to fetch songs from Supabase:', error);
      return false;
    }

    const supabaseCount = supabaseSongs?.length || 0;
    console.log(`Supabase active songs: ${supabaseCount}`);

    // Read IndexedDB counts
    const songsCount = await db.songs.count();
    const songIndexCount = await db.songIndex.count();

    console.log(`IndexedDB songs: ${songsCount}`);
    console.log(`IndexedDB songIndex: ${songIndexCount}`);

    // Compare counts
    const countsMatch = supabaseCount === songsCount && songsCount === songIndexCount;
    console.log(`\nCounts: ${countsMatch ? 'MATCH' : 'MISMATCH'}`);

    // Sample comparison (check 10 random songs for more thorough verification)
    if (supabaseSongs && supabaseSongs.length > 0) {
      console.log('\nSample comparison (10 random songs):');
      const sampleSize = Math.min(10, supabaseSongs.length);
      const sampleIds = supabaseSongs
        .sort(() => Math.random() - 0.5)
        .slice(0, sampleSize)
        .map((s: any) => s.id);

      let sampleMatches = 0;
      for (const id of sampleIds) {
        const dbSong = await db.songs.get(id);
        const dbIndex = await db.songIndex.get(id);
        const supabaseSong = await supabase
          .from('songs')
          .select('id, title, song_number, updated_at')
          .eq('id', id)
          .single();

        if (supabaseSong.data && dbSong && dbIndex) {
          const songMatch = compareRecords(supabaseSong.data, dbSong, 'songs').match;
          const indexMatch = compareRecords(supabaseSong.data, dbIndex, 'songIndex').match;
          if (songMatch && indexMatch) {
            sampleMatches++;
          }
        }
      }

      const samplePassed = sampleMatches === sampleSize;
      console.log(`Sample: ${samplePassed ? 'MATCH' : 'MISMATCH'} (${sampleMatches}/${sampleSize})`);

      const passed = countsMatch && samplePassed;
      console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'}`);
      console.log('================================');
      return passed;
    }

    console.log('\n✅ PASS (no songs to compare)');
    console.log('================================');
    return true;
  }

  /**
   * Test 3: Database Comparison (legacy, use runConsistencyReport instead)
   */
  async function runDatabaseComparison(): Promise<boolean> {
    return runConsistencyReport();
  }

  /**
   * Main verification function
   */
  async function runSyncVerification() {
    console.log('═══════════════════════════════');
    console.log('SYNC VERIFICATION');
    console.log('═══════════════════════════════');

    const results: { [key: string]: boolean } = {};

    // Run Realtime Test
    console.log('\nRunning Realtime Test...');
    results.realtime = await runRealtimeTest();

    // Run Wake-Up Sync Test
    console.log('\nRunning Wake-Up Sync Test...');
    results.wakeUpSync = await runWakeUpSyncTest();

    // Run Database Comparison
    console.log('\nRunning Database Comparison...');
    results.database = await runDatabaseComparison();

    // Final Report
    console.log('\n================================');
    console.log('FINAL REPORT');
    console.log('================================\n');
    console.log(`Realtime: ${results.realtime ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Wake-Up Sync: ${results.wakeUpSync ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Database Comparison: ${results.database ? '✅ PASS' : '❌ FAIL'}`);

    const allPassed = Object.values(results).every((r) => r);
    console.log(`\n${allPassed ? '✅ All synchronization mechanisms verified.' : '❌ Some tests failed.'}`);
    console.log('═══════════════════════════════');
  }

  // Expose to window
  (window as any).runSyncVerification = runSyncVerification;
  (window as any).runRealtimeTest = runRealtimeTest;
  (window as any).runWakeUpSyncTest = runWakeUpSyncTest;
  (window as any).runDatabaseComparison = runDatabaseComparison;
  (window as any).runConsistencyReport = runConsistencyReport;
  (window as any).findMissingSongs = findMissingSongs;
  (window as any).runWakeUpSyncVerification = runWakeUpSyncVerification;
  (window as any).continueWakeUpSyncVerification = continueWakeUpSyncVerification;

  console.log('🔧 Sync Verification Tool loaded. Use:');
  console.log('  window.runSyncVerification()');
  console.log('  window.runRealtimeTest()');
  console.log('  window.runWakeUpSyncTest()');
  console.log('  window.runConsistencyReport()');
  console.log('  window.findMissingSongs()');
  console.log('  window.runWakeUpSyncVerification()');
  console.log('  window.continueWakeUpSyncVerification()');
}
