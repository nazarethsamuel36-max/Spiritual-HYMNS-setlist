import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { db } from '../db/Database';

interface DownloadStats {
  downloadedBytes: number;
  totalBytes: number;
  percentage: number;
  status: 'idle' | 'calculating' | 'downloading' | 'saving' | 'complete' | 'error';
  message: string;
}

export function useDownloadProgress() {
  const [stats, setStats] = useState<DownloadStats>({
    downloadedBytes: 0,
    totalBytes: 0,
    percentage: 0,
    status: 'idle',
    message: '',
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const estimateTotalSize = async () => {
    setStats(prev => ({ ...prev, status: 'calculating', message: 'Calculating download size...' }));

    try {
      const { count, error } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;

      const totalSongs = count || 0;
      const estimatedBytes = totalSongs * 3500 + 1024 * 1024;

      return {
        totalSongs,
        estimatedBytes,
      };
    } catch (err) {
      console.error('Failed to estimate download size:', err);
      return {
        totalSongs: 0,
        estimatedBytes: 0,
      };
    }
  };

  const downloadAllSongs = async () => {
    if (!navigator.onLine) {
      setStats(prev => ({
        ...prev,
        status: 'error',
        message: 'You appear to be offline. Connect to the internet and try again.',
      }));
      return null;
    }

    setStats(prev => ({ ...prev, status: 'downloading', message: 'Downloading app data...' }));

    const { totalSongs, estimatedBytes } = await estimateTotalSize();
    setStats(prev => ({
      ...prev,
      totalBytes: estimatedBytes,
      message: `Downloading ${totalSongs} songs...`,
    }));

    if (!estimatedBytes) {
      setStats(prev => ({ ...prev, status: 'error', message: 'Unable to estimate download size.' }));
      return null;
    }

    const allSongs: any[] = [];
    let downloadedBytes = 0;
    const pageSize = 50;
    let page = 0;
    let hasMore = true;

    while (hasMore) {
      const start = page * pageSize;
      const end = start + pageSize - 1;

      try {
        const { data, error } = await supabase
          .from('songs')
          .select('*')
          .eq('is_active', true)
          .order('id')
          .range(start, end);

        if (error) {
          setStats(prev => ({ ...prev, status: 'error', message: 'Download failed. Check your connection.' }));
          return null;
        }

        if (!data || data.length === 0) {
          hasMore = false;
          break;
        }

        const chunkBytes = new Blob([JSON.stringify(data)]).size;
        downloadedBytes += chunkBytes;
        allSongs.push(...data);

        setStats(prev => ({
          ...prev,
          downloadedBytes,
          percentage: Math.min(95, (downloadedBytes / estimatedBytes) * 100),
          message: `${formatBytes(downloadedBytes)} / ${formatBytes(estimatedBytes)}`,
        }));

        page += 1;
      } catch (err) {
        console.error('Download error:', err);
        setStats(prev => ({ ...prev, status: 'error', message: 'Network error. Please try again.' }));
        return null;
      }
    }

    return allSongs;
  };

  const saveToDatabase = async (songs: any[]) => {
    setStats(prev => ({
      ...prev,
      status: 'saving',
      percentage: 95,
      message: 'Saving to device...',
    }));

    try {
      await db.songs.bulkPut(songs.map((row: any) => ({
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
        isPublished: row.is_published ?? true,
        is_active: row.is_active ?? true,
      })));

      setStats(prev => ({
        ...prev,
        status: 'complete',
        percentage: 100,
        downloadedBytes: prev.totalBytes,
        message: 'Complete! Opening app...',
      }));

      return true;
    } catch (err) {
      console.error('Save error:', err);
      setStats(prev => ({ ...prev, status: 'error', message: 'Failed to save data.' }));
      return false;
    }
  };

  const reset = () => {
    setStats({
      downloadedBytes: 0,
      totalBytes: 0,
      percentage: 0,
      status: 'idle',
      message: '',
    });
  };

  return { stats, downloadAllSongs, saveToDatabase, reset, formatBytes };
}
