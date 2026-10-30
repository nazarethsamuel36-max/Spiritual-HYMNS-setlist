import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail } from '../../db/Database';
import { SetlistService } from '../../services/SetlistService';
import { ChordTransposer } from '../../utils/ChordTransposer';
import { formatSongTitle, formatKey } from '../../utils/SongFormatter';
import type { ReaderMode } from '../../store/workflowStore';
import { useWorkflowStore } from '../../store/workflowStore';
import { updateAdminSong } from '../../services/DeviceAuthService';
import { VisibilitySwitch } from '../shared/VisibilitySwitch';
import { createNewVersion } from '../../services/VersionWorkflow';
import { VersionService } from '../../services/VersionService';
import { ShareService } from '../../services/ShareService';
import { shareContent } from '../../utils/shareUtils';

interface ReaderHeaderProps {
  song: SongDetail;
  transpose: number;
  mode: ReaderMode;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onModeChange: (mode: ReaderMode) => void;
  onRefreshSong?: () => void;
  source: 'library' | 'setlist' | 'shared' | 'personal';
}

export function ReaderHeader({
  song,
  transpose,
  mode,
  onTransposeUp,
  onTransposeDown,
  onModeChange,
  onRefreshSong,
  source,
}: ReaderHeaderProps) {
    const activeArrangementId = useWorkflowStore((s) => s.reader.type === 'song' ? s.reader.activeArrangementId : null);
  const setActiveArrangementId = useWorkflowStore((s) => s.setActiveArrangementId);
  const lastReaderMode = useWorkflowStore((s) => s.lastReaderMode);
  const reader = useWorkflowStore((s) => s.reader);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const fontSize = useWorkflowStore((s) => s.fontSize);
  const setFontSize = useWorkflowStore((s) => s.setFontSize);
  const closeReader = useWorkflowStore((s) => s.closeReader);
  const setSidebarPanel = useWorkflowStore((s) => s.setSidebarPanel);
  const [isPublishLoading, setIsPublishLoading] = useState(false);
  const [isShareLoading, setIsShareLoading] = useState(false);
  const resetTranspose = useWorkflowStore((s) => s.resetTranspose);

  useEffect(() => {
    import('../../utils/turnstile').then(({ prewarmTurnstileToken }) => {
      void prewarmTurnstileToken('share');
    }).catch(() => {});
  }, []);

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreTab, setMoreTab] = useState<'main' | 'setlist' | 'versions'>('main');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'main' | 'setlist' | 'versions'>('main');

  const isNonOfficial = source === 'personal' || source === 'shared'
    || (source === 'setlist' && (reader.type === 'song' && reader.refKind !== 'official'))
    || (source === 'library' && !!activeArrangementId)
    || !song.songNumber
    || song.songNumber <= 0
    || song.songNumber > 100000;

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
      await updateAdminSong(song.id, { is_active: newIsActive });
      if (onRefreshSong) onRefreshSong();
    } catch (err) {
      console.error('Failed to update:', err);
      alert('Failed to update song: ' + (err as Error).message);
    } finally {
      setIsPublishLoading(false);
    }
  };

  const handleShare = async () => {
    if (isShareLoading) return;
    setIsShareLoading(true);
    try {
      let url = '';
      let title = song.title;

      if (activeVersion) {
        // Sharing a custom arrangement/version
        const link = await ShareService.shareVersion(activeVersion);
        url = `${window.location.origin}/s/${encodeURIComponent(link.slug)}`;
        title = activeVersion.name;
      } else if (source === 'personal') {
        // Sharing a personal song
        const link = await ShareService.sharePersonalSong(song);
        url = `${window.location.origin}/s/${encodeURIComponent(link.slug)}`;
      } else if (source === 'shared') {
        // Sharing a shared song (re-share)
        const link = await ShareService.sharePersonalSong(song);
        url = `${window.location.origin}/s/${encodeURIComponent(link.slug)}`;
      } else {
        // Sharing standard official library song (can be resolved directly via path)
        url = `${window.location.origin}/song/${song.id}`;
      }

      const shareResult = await shareContent({
        title,
        text: `Check out "${title}" on Spiritual Hymns`,
        url,
      });

      if (shareResult === 'copied' || shareResult === 'need-user-gesture') {
        alert('Shareable link copied to clipboard!');
      }

      setIsMoreOpen(false);
      setIsMobileMenuOpen(false);
    } catch (e: unknown) {
      console.error(e);
      alert('Failed to generate share link: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsShareLoading(false);
    }
  };

  const handleDeletePersonalSong = async () => {
    if (!confirm(`Delete "${song.title}"? This cannot be undone.`)) return;
    try {
      await db.personalSongs.delete(song.id);
      setIsMoreOpen(false);
      setIsMobileMenuOpen(false);
      closeReader();
      setSidebarPanel('personal');
    } catch (err) {
      console.error('Failed to delete personal song:', err);
      alert('Failed to delete personal song');
    }
  };

  return (
    <>
    <div className="reader-header flex-shrink-0 bg-[var(--color-reader-surface)]/95 backdrop-blur-md border-b border-slate-300 z-40 relative px-4 md:px-6 py-2 flex flex-col w-full">
      {/* ── DESKTOP HEADER (hidden on mobile unless admin) ── */}
      <div className={`w-full ${isAdminAuthenticated ? 'flex flex-col' : 'hidden md:flex md:items-center md:justify-between'}`}>

        {/* SINGLE CLEAN LINE: Spacer + Centered Title + Actions */}
        <div className="relative flex items-center justify-between w-full min-h-[38px]">
          {/* Left spacer so title centers relative to the full spread */}
          <div className="w-8 flex-shrink-0" />

          {/* Absolute Centered Title (middle of the spread / divider) */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-baseline gap-2.5 pointer-events-none select-none max-w-[75%] justify-center text-center">
            {!isNonOfficial && (
              <span className="text-slate-400 text-[24px] font-bold flex-shrink-0 leading-[1.1]">
                {song.songNumber}
              </span>
            )}
            <h1 className="text-[26px] leading-tight font-normal font-sans text-slate-900 tracking-tight truncate">
              {formatSongTitle(song.title)}
            </h1>
            {song.artist && song.artist.toLowerCase() !== 'unknown artist' && (
              <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider truncate">
                {song.artist}
              </span>
            )}
          </div>

          {/* Right Actions: Admin tools + Three dots (⋮) button */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {isAdminAuthenticated && (
              <div className="flex items-center gap-2 mr-2">
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

            {!isAdminAuthenticated && (
              <div className="flex items-center gap-2">
                {/* Desktop Transpose Bar beside 3 dots */}
                <div className="flex items-center gap-1.5 px-2.5 h-8 bg-slate-50 border border-slate-300 rounded-lg shadow-2xs">
                  <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold select-none mr-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Key</span>
                    <span className="font-black text-slate-800 text-xs">
                      {ChordTransposer.transposeChord(formatKey(song.originalKey), transpose)}
                    </span>
                    {transpose !== 0 && (
                      <span className="text-[10px] font-bold text-amber-600">
                        ({transpose > 0 ? `+${transpose}` : transpose})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={onTransposeDown}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black transition-colors active:scale-95 shadow-2xs"
                      aria-label="Transpose down"
                      title="Transpose down"
                    >
                      −
                    </button>
                    <button
                      onClick={resetTranspose}
                      className="px-1.5 h-6 flex items-center justify-center rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 text-[10px] font-bold tracking-tight transition-colors active:scale-95 shadow-2xs"
                      title="Reset to original key"
                      aria-label="Reset transpose"
                    >
                      Reset
                    </button>
                    <button
                      onClick={onTransposeUp}
                      className="w-6 h-6 flex items-center justify-center rounded bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black transition-colors active:scale-95 shadow-2xs"
                      aria-label="Transpose up"
                      title="Transpose up"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <button
                    onClick={() => { setIsMoreOpen(!isMoreOpen); setMoreTab('main'); }}
                    className={`w-8 h-8 border rounded-lg shadow-xs transition-all flex items-center justify-center active:scale-95 ${
                      isMoreOpen
                        ? 'bg-slate-900 border-slate-900 text-[var(--color-on-inverse)]'
                        : 'bg-[var(--color-surface)] border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="More Actions"
                    aria-label="More Actions"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                {isMoreOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--color-surface)] border border-slate-200 rounded-xl shadow-xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2">

                      {moreTab === 'main' && (
                        <div className="space-y-1">
                          {/* Transpose Key row */}
                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-600">Transpose</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Key: <span className="font-bold text-slate-700">{ChordTransposer.transposeChord(formatKey(song.originalKey), transpose)}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={onTransposeDown}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-black transition-colors active:scale-95 shadow-2xs"
                                aria-label="Transpose down"
                              >
                                −
                              </button>
                              <button
                                onClick={resetTranspose}
                                className="px-2 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-[10px] font-bold tracking-tight transition-colors active:scale-95 shadow-2xs"
                                title="Reset to original key"
                                aria-label="Reset transpose"
                              >
                                Reset
                              </button>
                              <button
                                onClick={onTransposeUp}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-black transition-colors active:scale-95 shadow-2xs"
                                aria-label="Transpose up"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Font Size row */}
                          <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50 rounded-lg">
                            <span className="text-[11px] font-bold text-slate-600">Font Size</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setFontSize(fontSize - 1)}
                                disabled={fontSize <= 12}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-black transition-colors active:scale-95 disabled:opacity-30 shadow-2xs"
                                aria-label="Decrease font size"
                              >
                                −
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-slate-800">{fontSize}</span>
                              <button
                                onClick={() => setFontSize(fontSize + 1)}
                                disabled={fontSize >= 24}
                                className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-black transition-colors active:scale-95 disabled:opacity-30 shadow-2xs"
                                aria-label="Increase font size"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Separator between Controls and Actions */}
                          <div className="border-t border-slate-200 my-1" />

                          {/* Action Options */}
                          <button
                            onClick={() => setMoreTab('setlist')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <span>Add to Setlist</span>
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleShare}
                            disabled={isShareLoading}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-between disabled:opacity-60"
                          >
                            <span>{isShareLoading ? 'Generating link...' : 'Share Song'}</span>
                            {isShareLoading && (
                              <svg className="w-3.5 h-3.5 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                              </svg>
                            )}
                          </button>
                          {mode !== 'edit' && (
                            <button
                              onClick={() => { onModeChange('edit'); setIsMoreOpen(false); }}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                            >
                              Edit Song
                            </button>
                          )}
                          <button
                            onClick={() => setMoreTab('versions')}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <span>Song Versions</span>
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                          {source === 'personal' && (
                            <button
                              onClick={handleDeletePersonalSong}
                              className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-xs font-semibold text-red-700 transition-colors border-t border-slate-100 mt-1"
                            >
                              Delete Song
                            </button>
                          )}
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
                                    const refType = source === 'personal' ? 'personal' : source === 'shared' ? 'shared' : 'official';
                                    await SetlistService.addSongToSetlist(list.id, song.id, 0, refType);
                                    setIsMoreOpen(false);
                                    window.dispatchEvent(
                                      new CustomEvent('show-toast', {
                                        detail: { message: `Added to setlist: "${list.title}"` },
                                      })
                                    );
                                  }}
                                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
                                >
                                  <span className="truncate">{list.title}</span>
                                  <span className="text-[10px] text-slate-400 ml-2">{(list.songs || []).length} songs</span>
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
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Song Versions</span>
                          </div>
                          <div className="max-h-48 overflow-y-auto space-y-0.5 hide-scrollbar">
                            <button
                              onClick={() => { setActiveArrangementId(null); onModeChange(lastReaderMode); setIsMoreOpen(false); }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${!activeArrangementId ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                              Original Version
                            </button>
                            {versions.map(arr => (
                              <button
                                key={arr.uid}
                                onClick={() => { setActiveArrangementId(arr.uid); onModeChange(lastReaderMode); setIsMoreOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${activeArrangementId === arr.uid ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                {arr.name}
                              </button>
                            ))}
                            <button
                              onClick={async () => {
                                const uid = await createNewVersion(reader);
                                if (uid) { setActiveArrangementId(uid); onModeChange('edit'); setIsMoreOpen(false); }
                              }}
                              className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-t border-slate-100 mt-1"
                            >
                              + New Version
                            </button>
                            {activeVersion && activeVersion.owner === 'shared' && (
                              <button
                                onClick={async () => { await handleMakeMyVersion(); setIsMoreOpen(false); }}
                                className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-amber-700 hover:bg-amber-50"
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
            </div>
          )}
        </div>
      </div>
    </div>

      {/* ── MOBILE HEADER: single clean line (hidden in admin mode) ── */}
{!isAdminAuthenticated && (
        <div className="md:hidden max-w-4xl mx-auto w-full flex items-center justify-between gap-2 min-h-12 py-1">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            {!isNonOfficial && (
              <span className="text-slate-500 text-[26px] font-semibold flex-shrink-0 leading-[1.1]">{song.songNumber}</span>
            )}
              <h1 className="text-[28px] font-normal font-sans text-slate-900 min-w-0 leading-tight break-words">
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
        <div className="mobile-bottom-sheet fixed inset-x-0 bottom-0 z-[70] md:hidden bg-[var(--color-surface)] rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-200 max-h-[70vh] flex flex-col">

          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-2.5" />

          {mobileTab === 'main' && (
            <div className="p-3 space-y-1 overflow-y-auto">
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm font-semibold text-slate-700">Transpose</span>
                <div className="flex items-center gap-1">
                  <button onClick={onTransposeDown} className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-base font-black transition-colors active:scale-95" aria-label="Transpose down">−</button>
                  <button onClick={resetTranspose} className="px-2 h-7 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold tracking-tight transition-colors active:scale-95" title="Reset to original key" aria-label="Reset transpose">Reset</button>
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
              <button
                onClick={handleShare}
                disabled={isShareLoading}
                className="w-full flex items-center justify-between px-2 py-2.5 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-60"
              >
                <span className="text-sm font-semibold text-slate-700">{isShareLoading ? 'Generating link...' : 'Share'}</span>
                {isShareLoading && (
                  <svg className="w-3.5 h-3.5 animate-spin text-slate-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                )}
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
              {source === 'personal' && (
                <button
                  onClick={handleDeletePersonalSong}
                  className="w-full text-left px-2 py-2.5 hover:bg-red-50 rounded-lg text-sm font-semibold text-red-700 transition-colors border-t border-slate-100 mt-1"
                >
                  Delete Song
                </button>
              )}
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
                          const refType = source === 'personal' ? 'personal' : source === 'shared' ? 'shared' : 'official';
                          await SetlistService.addSongToSetlist(list.id, song.id, 0, refType);
                        }
                        setIsMobileMenuOpen(false);
                        setMobileTab('main');
                        window.dispatchEvent(
                          new CustomEvent('show-toast', {
                            detail: { message: `Added to setlist: "${list.title}"` },
                          })
                        );
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
