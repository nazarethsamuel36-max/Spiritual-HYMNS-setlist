import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';

export async function debugDownloadAllSongs() {
  console.log('🔍 [DEBUG] Starting manual download of all songs...');

  try {
    console.log('📡 [DEBUG] Fetching all active songs from Supabase...');

    const { data, error, count } = await supabase
      .from('songs')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (error) {
      console.error('❌ [DEBUG] Supabase error:', error);
      alert(`Debug download failed: ${error.message}`);
      return;
    }

    console.log(`✅ [DEBUG] Supabase returned ${data?.length ?? 0} songs out of ${count ?? 0} total.`);

    if (!data || data.length === 0) {
      console.warn('⚠️ [DEBUG] No songs were returned by Supabase.');
      alert('Debug download finished but no songs were returned.');
      return;
    }

    const songsToSave = data.map((row: any) => ({
      id: row.id,
      songNumber: row.song_number,
      title: row.title,
      artist: row.artist,
      composer: row.composer,
      language: row.language,
      originalKey: row.original_key,
      capo: row.capo,
      bpm: row.bpm,
      timeSignature: row.time_signature,
      hashtags: [],
      sections: [],
      chords: row.chords || undefined,
      lyrics: row.lyrics || undefined,
      is_active: row.is_active ?? true,
    }));

    console.log(`💾 [DEBUG] Saving ${songsToSave.length} songs to IndexedDB...`);
    await db.songs.bulkPut(songsToSave);

    const dbCount = await db.songs.count();
    console.log(`🎉 [DEBUG] SUCCESS! IndexedDB now contains ${dbCount} songs.`);

    alert(`Debug download complete. IndexedDB now has ${dbCount} songs.`);
  } catch (err) {
    console.error('💥 [DEBUG] Fatal error during download:', err);
    alert('Debug download failed with a fatal error. Check the console.');
  }
}
