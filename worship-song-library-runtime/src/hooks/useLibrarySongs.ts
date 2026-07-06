import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';

export function useLibrarySongs() {
  const [librarySongs, setLibrarySongs] = useState<Array<{ id: number; songNumber: number; title: string; language: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      // Check IndexedDB first
      const cached = await db.librarySongs.toArray();
      
      if (cached.length > 0) {
        console.log('?? Library loaded from IndexedDB cache');
        setLibrarySongs(cached);
        setLoading(false);
      }

      // Always fetch from Supabase in background
      const { data } = await supabase
        .from('songs')
        .select('id, song_number, title, language')
        .eq('is_active', true)
        .order('song_number', { ascending: true });

      if (data) {
        const songs = data.map(row => ({
          id: row.id,
          songNumber: Number(row.song_number ?? 0),
          title: row.title ?? 'Untitled',
          language: row.language ?? 'English',
        }));

        // Update IndexedDB cache
        await db.librarySongs.clear();
        await db.librarySongs.bulkAdd(songs);
        
        setLibrarySongs(songs);
        console.log('?? Library updated from Supabase:', songs.length);
      }

      setLoading(false);
    };

    loadLibrary();
  }, []);

  return { librarySongs, loading };
}
