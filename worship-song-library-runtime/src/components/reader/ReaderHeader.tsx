import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail } from '../../db/Database';
import { SetlistService } from '../../services/SetlistService';
import { ChordTransposer } from '../../utils/ChordTransposer';
import { formatSongTitle, formatKey } from '../../utils/SongFormatter';
import type { ReaderMode } from '../../store/workflowStore';
import { useWorkflowStore } from '../../store/workflowStore';
import { supabase } from '../../lib/supabaseClient';
import { VisibilitySwitch } from '../shared/VisibilitySwitch';
import { createNewVersion } from '../../services/VersionWorkflow';
import { VersionService } from '../../services/VersionService';
import { ShareService } from '../../services/ShareService';


interface ReaderHeaderProps {
  song: SongDetail;
  transpose: number;
  mode: ReaderMode;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onModeChange: (mode: ReaderMode) => void;
  onRefreshSong?: () => void;
  isPersonal?: boolean;
}

export function ReaderHeader({
  song,
  transpose,
  mode,
  onTransposeUp,
  onTransposeDown,
  onModeChange,
  onRefreshSong,
  isPersonal,
}: ReaderHeaderProps) {
  const showContextRail = useWorkflowStore((s) => s.showContextRail);
  const setShowContextRail = useWorkflowStore((s) => s.setShowContextRail);
  const activeArrangementId = useWorkflowStore((s) => s.reader.type === 'song' ? s.reader.activeArrangementId : null);
  const setActiveArrangementId = useWorkflowStore((s) => s.setActiveArrangementId);
  const lastReaderMode = useWorkflowStore((s) => s.lastReaderMode);
  const reader = useWorkflowStore((s) => s.reader);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const fontSize = useWorkflowStore((s) => s.fontSize);
  const setFontSize = useWorkflowStore((s) => s.setFontSize);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const resetTranspose = useWorkflowStore((s) => s.resetTranspose);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreTab, setMoreTab] = useState<'main' | 'setlist' | 'versions'>('main');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'main' | 'setlist' | 'versions'>('main');

  const setlists = useLiveQuery(() => db.setlists.toArray());
  const versions = useLiveQuery(() =>
    db.versions.where('sourceSongId').equals(song.id).toArray()
  , [song.id]) || [];

  const activeVersion = versions.find((v) => v.uid === activeArrangementId);

  const handleMakeMyVersion = async () => {
    if (!activeVersion) return;
    const newUid = await VersionService.makeMyVersion(activeVersion.uid);
    if (newUid) {
      setActiveArrangementId(newUid);
      alert('Saved as a personal version');
    }
  };

  const handlePublishToggle = async () => {
    const newIsActive = !song.is_active;
    setIsPublishLoading(true);
    try {
      const { error } = await supabase
        .from('songs')
        .update({ is_active: newIsActive })
        .eq('id', song.id)
        .select();
      if (error) throw error;
      if (onRefreshSong) onRefreshSong();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to update song: ' + (err as Error).message);
    } finally {
      setIsPublishLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      let shareId = '';
      let url = '';

      if (activeVersion) {
        // Sharing a custom arrangement/version
        shareId = await ShareService.shareVersion(activeVersion);
        url = `${window.location.origin}/s/${shareId}`;
        alert(`Sharing custom version: "${activeVersion.name}"`);
      } else if (isPersonal) {
        // Sharing a personal song
        shareId = await ShareService.sharePersonalSong(song);
        url = `${window.location.origin}/s/${shareId}`;
        alert(`Sharing personal song: "${song.title}"`);
      } else {
        // Sharing standard official library song (can be resolved directly via path)
        url = `${window.location.origin}/song/${song.id}`;
      }

      await navigator.clipboard.writeText(url);
      alert('Shareable link copied to clipboard!');
      setIsMoreOpen(false);
      setIsMobileMenuOpen(false);
    } catch (e: any) {
      console.error(e);
      alert('Failed to generate share link: ' + (e.message || e));
    }
  };

  return (
    <>
    <div className="flex-shrink-0 bg-[var(--color-reader-surface)]/95 backdrop-blur-md border-b border-[#E2E8F0] z-40 relative pl-4 pr-2 md:px-8 py-1.5 flex flex-col w-full">
      {/* ── DESKTOP HEADER (hidden on mobile unless admin) ── */}
      <div className={`max-w-4xl mx-auto w-full flex-col gap-1.5 ${isAdminAuthenticated ? 'flex' : 'hidden md:flex'}`}>

        {/* TOP ROW: Title + More */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                {formatSongTitle(song.title)}
              </h1>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider truncate">
                  {song.artist || 'Unknown Artist'}
                </span>
                {!isPersonal && (
                  <>
                    <span className="text-slate-300 text-[9px]">•</span>
                    <span className="text-slate-500 text-[10px] font-medium">{song.songNumber}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={() => setShowContextRail(!showContextRail)}
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                showContextRail
                  ? 'bg-slate-800 border-slate-800 text-[var(--color-on-inverse)]'
                  : 'bg-[var(--color-surface)] border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Context Rail"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            {!isAdminAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => { setIsMoreOpen(!isMoreOpen); setMoreTab('main'); }}
                  className={`w-8 h-8 border rounded-lg shadow-sm transition-all flex items-center justify-center active:scale-95 ${
                    isMoreOpen
                      ? 'bg-slate-900 border-slate-900 text-[var(--color-on-inverse)]'
                      : 'bg-[var(--color-surface)] border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                  title="More Actions"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {isMoreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-surface)] border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">

                      {moreTab === 'main' && (
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setMoreTab('setlist')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                          >
                            <span>Add to Setlist</span>
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleShare}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                          >
                            Share Song
                          </button>
                          {mode !== 'edit' && (
                            <button
                              onClick={() => { onModeChange('edit'); setIsMoreOpen(false); }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                            >
                              Edit Song
                            </button>
                          )}
                          <button
                            onClick={() => setMoreTab('versions')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                          >
                            <span>Versions</span>
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}

                      {moreTab === 'setlist' && (
                        <div>
                          <div className="flex items-center space-x-1.5 mb-2 px-1 border-b border-slate-100 pb-1.5">
                            <button onClick={() => setMoreTab('main')} className="p-1 hover:bg-slate-100 rounded-md">
                              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add to Setlist</span>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-0.5 hide-scrollbar">
                            {setlists?.length === 0 ? (
                              <div className="text-xs text-center py-4 text-slate-400 font-medium">No setlists found</div>
                            ) : (
                              setlists?.map(list => (
                                <button
                                  key={list.id}
                                  onClick={async () => {
                                    await SetlistService.addSongToSetlist(list.id, song.id);
                                    setIsMoreOpen(false);
                                    alert(`Added "${song.title}" to setlist: "${list.title}"`);
                                  }}
                                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                                >
                                  {list.title}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {moreTab === 'versions' && (
                        <div>
                          <div className="flex items-center space-x-1.5 mb-2 px-1 border-b border-slate-100 pb-1.5">
                            <button onClick={() => setMoreTab('main')} className="p-1 hover:bg-slate-100 rounded-md">
                              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Versions</span>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-0.5 hide-scrollbar">
                            <button
                              onClick={() => { setActiveArrangementId(null); onModeChange(lastReaderMode); setIsMoreOpen(false); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${!activeArrangementId ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              Original Version
                            </button>
                            {versions.map(arr => (
                              <button
                                key={arr.uid}
                                onClick={() => { setActiveArrangementId(arr.uid); onModeChange(lastReaderMode); setIsMoreOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeArrangementId === arr.uid ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                {arr.name}
                              </button>
                            ))}
                            <button
                              onClick={async () => {
                                const uid = await createNewVersion(reader);
                                if (uid) { setActiveArrangementId(uid); onModeChange('edit'); setIsMoreOpen(false); }
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-t border-slate-100 mt-1"
                            >
                              + New Version
                            </button>
                            {activeVersion && activeVersion.owner === 'shared' && (
                              <button
                                onClick={async () => { await handleMakeMyVersion(); setIsMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors text-amber-700 hover:bg-amber-50"
                              >
                                Make My Version
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ROW: Chords/Lyrics toggle + Transpose */}
        <div className="flex items-center justify-between">
          {!isAdminAuthenticated && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onModeChange('lyrics')}
                className={`px-2.5 h-7 text-[10px] sm:text-xs font-bold rounded-full border transition-all ${
                  mode === 'lyrics'
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-[var(--color-on-inverse)]'
                    : 'bg-[var(--color-surface)] border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Lyrics
              </button>
              <button
                onClick={() => onModeChange('chords')}
                className={`px-2.5 h-7 text-[10px] sm:text-xs font-bold rounded-full border transition-all ${
                  mode === 'chords'
                    ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-[var(--color-on-inverse)]'
                    : 'bg-[var(--color-surface)] border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Chords
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {mode === 'lyrics' ? (
              <div className="flex items-center h-8 bg-[var(--color-surface)] border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center px-2 border-x border-slate-100 bg-slate-50/50 min-w-[2.5rem] h-full">
                  <span className="text-[8px] uppercase font-bold text-slate-400 leading-none">Key</span>
                  <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">
                    {ChordTransposer.transposeChord(formatKey(song.originalKey), transpose)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center h-8 bg-[var(--color-surface)] border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <button onClick={onTransposeDown} className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100" aria-label="Transpose down">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <div className="flex flex-col items-center justify-center px-2 border-x border-slate-100 bg-slate-50/50 min-w-[2.5rem] h-full">
                  <span className="text-[8px] uppercase font-bold text-slate-400 leading-none">Key</span>
                  <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">
                    {ChordTransposer.transposeChord(formatKey(song.originalKey), transpose)}
                  </span>
                </div>
                <button onClick={onTransposeUp} className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100" aria-label="Transpose up">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}

            {!isAdminAuthenticated && (
              <div className="flex items-center h-8 bg-[var(--color-surface)] border border-slate-200 rounded-lg shadow-sm px-2 gap-2">
                <span className="text-[8px] font-bold text-slate-400">A</span>
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                  className="w-16 sm:w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  title="Font Size"
                />
                <span className="text-[10px] font-bold text-slate-600 w-6 text-center">{fontSize}</span>
              </div>
            )}

            {isAdminAuthenticated && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-slate-600">
                  {isPublishLoading ? 'Saving...' : song.is_active ? 'Visible' : 'Hidden'}
                </span>
                <VisibilitySwitch
                  checked={song.is_active !== false}
                  onChange={handlePublishToggle}
                  disabled={isPublishLoading}
                />
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── MOBILE HEADER: single clean line (hidden in admin mode) ── */}
      {!isAdminAuthenticated && (
        <div className="md:hidden max-w-4xl mx-auto w-full flex items-center justify-between gap-2 h-10">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {!isPersonal && (
              <span className="text-slate-500 text-[30px] font-semibold flex-shrink-0 leading-none">{song.songNumber}</span>
            )}
            <h1 className="text-[26px] font-normal text-slate-900 tracking-tight leading-normal truncate min-w-0">
              {formatSongTitle(song.title)}
            </h1>
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => { setIsMobileMenuOpen(true); setMobileTab('main'); }}
              className="w-[30px] h-[30px] flex items-center justify-center transition-all active:scale-95"
              title="More Actions"
              aria-label="More Actions"
            >
              <svg className="w-[18px] h-[18px] text-slate-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>

    {/* ── MOBILE BOTTOM-SHEET MENU ── */}
    {!isAdminAuthenticated && isMobileMenuOpen && (
      <>
        <div className="fixed inset-0 z-[60] bg-[rgba(15,23,42,0.4)] md:hidden" onClick={() => { setIsMobileMenuOpen(false); setMobileTab('main'); }} />
        <div className="fixed inset-x-0 bottom-0 z-[70] md:hidden bg-[var(--color-surface)] rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-200 max-h-[70vh] flex flex-col">

          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-2.5" />

          {mobileTab === 'main' && (
            <div className="p-3 space-y-1 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-semibold text-slate-700">Transpose</span>
                <div className="flex items-center gap-1">
                  <button onClick={onTransposeDown} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-black transition-colors active:scale-95" aria-label="Transpose down">−</button>
                  <button onClick={resetTranspose} className="w-7 h-7 flex items-center justify-center rounded-md text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors active:scale-95" title="Reset to original key" aria-label="Reset transpose">0</button>
                  <button onClick={onTransposeUp} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-black transition-colors active:scale-95" aria-label="Transpose up">+</button>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-1.5 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-700">Font Size</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setFontSize(fontSize - 1)} disabled={fontSize <= 12} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-black transition-colors active:scale-95 disabled:opacity-30" aria-label="Decrease font size">−</button>
                  <span className="w-7 text-center text-sm font-bold text-slate-800">{fontSize}</span>
                  <button onClick={() => setFontSize(fontSize + 1)} disabled={fontSize >= 24} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-black transition-colors active:scale-95 disabled:opacity-30" aria-label="Increase font size">+</button>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <button onClick={() => setMobileTab('setlist')} className="w-full flex items-center justify-between px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm font-semibold text-slate-700">Add to Setlist</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={handleShare} className="w-full text-left px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm font-semibold text-slate-700">Share</span>
              </button>
              {mode !== 'edit' && (
                <button onClick={() => { onModeChange('edit'); setIsMobileMenuOpen(false); setMobileTab('main'); }} className="w-full text-left px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                  <span className="text-sm font-semibold text-slate-700">Edit Song</span>
                </button>
              )}
              <button onClick={() => setMobileTab('versions')} className="w-full flex items-center justify-between px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm font-semibold text-slate-700">Song Versions</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {mobileTab === 'setlist' && (
            <div className="p-3 flex flex-col min-h-0">
              <div className="flex items-center space-x-1.5 mb-2 px-1 border-b border-slate-100 pb-1.5">
                <button onClick={() => setMobileTab('main')} className="p-1 hover:bg-slate-100 rounded-md">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add to Setlist</span>
              </div>
              <div className="overflow-y-auto min-h-0 space-y-0.5 hide-scrollbar">
                {setlists?.length === 0 ? (
                  <div className="text-xs text-center py-4 text-slate-400 font-medium">No setlists found</div>
                ) : (
                  setlists?.map(list => (
                    <button
                      key={list.id}
                      onClick={async () => {
                        if (activeArrangementId) {
                          const version = versions.find((v) => v.uid === activeArrangementId);
                          if (version) await SetlistService.addVersionToSetlist(list.id, version);
                        } else {
                          await SetlistService.addSongToSetlist(list.id, song.id);
                        }
                        setIsMobileMenuOpen(false);
                        setMobileTab('main');
                        alert(`Added "${song.title}" to setlist: "${list.title}"`);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                    >
                      {list.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {mobileTab === 'versions' && (
            <div className="p-3 flex flex-col min-h-0">
              <div className="flex items-center space-x-1.5 mb-2 px-1 border-b border-slate-100 pb-1.5">
                <button onClick={() => setMobileTab('main')} className="p-1 hover:bg-slate-100 rounded-md">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Song Versions</span>
              </div>
              <div className="overflow-y-auto min-h-0 space-y-0.5 hide-scrollbar">
                <button
                  onClick={() => { setActiveArrangementId(null); onModeChange(lastReaderMode); setIsMobileMenuOpen(false); setMobileTab('main'); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${!activeArrangementId ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  Original Version
                </button>
                {versions.map(arr => (
                  <button
                    key={arr.uid}
                    onClick={() => { setActiveArrangementId(arr.uid); onModeChange(lastReaderMode); setIsMobileMenuOpen(false); setMobileTab('main'); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${activeArrangementId === arr.uid ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {arr.name}
                  </button>
                ))}
                <button
                  onClick={async () => {
                    const uid = await createNewVersion(reader);
                    if (uid) { setActiveArrangementId(uid); onModeChange('edit'); setIsMobileMenuOpen(false); setMobileTab('main'); }
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors border-t border-slate-100 mt-1"
                >
                  + New Version
                </button>
                {activeVersion && activeVersion.owner === 'shared' && (
                  <button
                    onClick={async () => { await handleMakeMyVersion(); setIsMobileMenuOpen(false); setMobileTab('main'); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    Make My Version
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </>
    )}
    </>
  );
}
