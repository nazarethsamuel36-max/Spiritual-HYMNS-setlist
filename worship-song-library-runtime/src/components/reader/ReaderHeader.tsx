import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail } from '../../db/Database';
import { SetlistService } from '../../services/SetlistService';
import { ChordTransposer } from '../../utils/ChordTransposer';
import { formatSongTitle, formatKey } from '../../utils/SongFormatter';
import type { ReaderMode } from '../../store/workflowStore';
import { useWorkflowStore } from '../../store/workflowStore';
import { supabase } from '../../lib/supabaseClient';

interface ReaderHeaderProps {
  song: SongDetail;
  transpose: number;
  mode: ReaderMode;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onModeChange: (mode: ReaderMode) => void;
}

export function ReaderHeader({
  song,
  transpose,
  mode,
  onTransposeUp,
  onTransposeDown,
  onModeChange
}: ReaderHeaderProps) {
  const showContextRail = useWorkflowStore((s) => s.showContextRail);
  const setShowContextRail = useWorkflowStore((s) => s.setShowContextRail);
  const activeArrangementId = useWorkflowStore((s) => s.reader.type === 'song' ? s.reader.activeArrangementId : null);
  const setActiveArrangementId = useWorkflowStore((s) => s.setActiveArrangementId);
  const isAdminAuthenticated = useWorkflowStore((s) => s.isAdminAuthenticated);
  const fontSize = useWorkflowStore((s) => s.fontSize);
  const setFontSize = useWorkflowStore((s) => s.setFontSize);
  const [isHidden, setIsHidden] = useState(!song.is_active);
  const [isPublishLoading, setIsPublishLoading] = useState(false);

  // Sync local state with song's is_active when song changes
  useEffect(() => {
    setIsHidden(!song.is_active);
  }, [song.is_active]);

  // Dropdown states
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreTab, setMoreTab] = useState<'main' | 'setlist' | 'versions' | 'details'>('main');

  const setlists = useLiveQuery(() => db.setlists.toArray());
  const arrangements = useLiveQuery(() =>
    db.arrangements.where({ songId: song.id }).toArray()
  , [song.id]) || [];

  const handlePublishToggle = async () => {
    console.log('\n═══════════════════════════════');
    console.log('HIDE/UNHIDE BUTTON AUDIT');
    console.log('═══════════════════════════════');
    console.log('Hide button clicked');
    console.log('handlePublishToggle() entered');
    console.log(`Updating Song ID: ${song.id}`);
    console.log(`Song Title: ${song.title}`);

    const newIsActive = !isHidden;
    console.log(`New is_active: ${newIsActive}`);
    setIsHidden(!newIsActive);
    setIsPublishLoading(true);

    try {
      console.log('Executing Supabase UPDATE...');
      const { error, data } = await supabase
        .from('songs')
        .update({ is_active: newIsActive })
        .eq('id', song.id)
        .select();

      console.log('Supabase Response:');
      console.log(`Success: ${error === null}`);
      console.log(`Error: ${error ? error.message : 'None'}`);
      console.log(`Data returned:`, data);

      if (error) throw error;

      // Read the row back to verify changes
      console.log('Reading row back from Supabase...');
      const { data: updatedRow } = await supabase
        .from('songs')
        .select('id, is_active, updated_at')
        .eq('id', song.id)
        .single();

      if (updatedRow) {
        console.log('Row after update:');
        console.log(`is_active: ${updatedRow.is_active}`);
        console.log(`updated_at: ${updatedRow.updated_at}`);
      }

      console.log('═══════════════════════════════');
    } catch (err) {
      console.error('Failed to update:', err);
      setIsHidden(!newIsActive);
      alert('Failed to update song: ' + (err as Error).message);
    } finally {
      setIsPublishLoading(false);
    }
  };

  const handleShare = () => {
    try {
      const cleanSong = {
        songNumber: song.songNumber,
        title: song.title,
        artist: song.artist,
        composer: song.composer,
        language: song.language,
        originalKey: song.originalKey,
        capo: song.capo,
        bpm: song.bpm,
        timeSignature: song.timeSignature,
        hashtags: song.hashtags,
        sections: song.sections
      };
      const json = JSON.stringify(cleanSong);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      const url = `${window.location.origin}${window.location.pathname}?import_song=${b64}`;
      navigator.clipboard.writeText(url);
      alert('Shareable song link copied to clipboard!');
      setIsMoreOpen(false);
    } catch (e) {
      console.error(e);
      alert('Failed to generate share link.');
    }
  };

  return (
    <div className="flex-shrink-0 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-slate-200/60 z-40 relative px-4 md:px-8 py-1.5 shadow-sm flex flex-col w-full">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-1.5">

        {/* ── TOP ROW: Title + More ── */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Title */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                {formatSongTitle(song.title)}
              </h1>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider truncate">
                  {song.artist || 'Unknown Artist'}
                </span>
                <span className="text-slate-300 text-[9px]">•</span>
                <span className="text-slate-500 text-[10px] font-medium">#{song.songNumber}</span>
              </div>
            </div>
          </div>

          {/* Right: Context Rail (desktop only) + More button */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={() => setShowContextRail(!showContextRail)}
              className={`hidden md:flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                showContextRail
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle Context Rail"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>

            {/* ⋮ More Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsMoreOpen(!isMoreOpen);
                  setMoreTab('main');
                }}
                className={`w-8 h-8 border rounded-lg shadow-sm transition-all flex items-center justify-center active:scale-95 ${
                  isMoreOpen
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
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
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                    
                    {/* MAIN TAB */}
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
                        <button
                          onClick={() => setMoreTab('versions')}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                        >
                          <span>Versions</span>
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        {isAdminAuthenticated && (
                          <button
                            onClick={() => {
                              onModeChange('edit');
                              setIsMoreOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-amber-600 transition-colors border-l-2 border-amber-600"
                          >
                            ✏️ Edit Song
                          </button>
                        )}
                        <button
                          onClick={() => setMoreTab('details')}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                        >
                          <span>Song Details</span>
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* SETLIST TAB */}
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

                    {/* VERSIONS TAB */}
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
                            onClick={() => {
                              setActiveArrangementId(null);
                              setIsMoreOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                              !activeArrangementId ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            Original Version
                          </button>
                          {arrangements.map(arr => (
                            <button
                              key={arr.id}
                              onClick={() => {
                                setActiveArrangementId(arr.id);
                                setIsMoreOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                activeArrangementId === arr.id ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand)]' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {arr.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DETAILS TAB */}
                    {moreTab === 'details' && (
                      <div className="text-xs text-slate-600 p-2 space-y-2">
                        <div className="flex items-center space-x-1.5 mb-2 border-b border-slate-100 pb-1.5">
                          <button onClick={() => setMoreTab('main')} className="p-1 hover:bg-slate-100 rounded-md">
                            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 font-medium">
                          <div className="text-slate-400">Key:</div>
                          <div className="font-bold text-slate-800">{song.originalKey || 'C'}</div>
                          <div className="text-slate-400">BPM:</div>
                          <div className="font-bold text-slate-800">{song.bpm || 'N/A'}</div>
                          <div className="text-slate-400">Time:</div>
                          <div className="font-bold text-slate-800">{song.timeSignature || '4/4'}</div>
                          {song.composer && (
                            <>
                              <div className="text-slate-400">Composer:</div>
                              <div className="font-bold text-slate-800 truncate">{song.composer}</div>
                            </>
                          )}
                          {song.capo !== undefined && (
                            <>
                              <div className="text-slate-400">Capo:</div>
                              <div className="font-bold text-slate-800">{song.capo}</div>
                            </>
                          )}
                        </div>
                        {song.hashtags && song.hashtags.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                            {song.hashtags.map(t => (
                              <span key={t} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-semibold text-slate-500">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── BOTTOM ROW: Chords/Lyrics toggle (left) + Transpose (right) ── */}
        <div className="flex items-center justify-between">
          {/* Left: Mode Selector */}
          <div className="flex items-center p-0.5 bg-slate-200/50 rounded-lg h-8">
            <button
              onClick={() => onModeChange('lyrics')}
              className={`px-2.5 py-0.5 h-full text-[10px] sm:text-xs font-bold rounded-md transition-all ${
                mode === 'lyrics' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Lyrics
            </button>
            <button
              onClick={() => onModeChange('chords')}
              className={`px-2.5 py-0.5 h-full text-[10px] sm:text-xs font-bold rounded-md transition-all ${
                mode === 'chords' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Chords
            </button>
          </div>

          {/* Right: Transpose Hub + Font Size + Published Button */}
          <div className="flex items-center gap-2">
            {mode === 'lyrics' ? (
              <div className="flex items-center h-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="flex flex-col items-center justify-center px-2 border-x border-slate-100 bg-slate-50/50 min-w-[2.5rem] h-full">
                  <span className="text-[8px] uppercase font-bold text-slate-400 leading-none">Key</span>
                  <span className="text-[11px] font-black text-slate-800 leading-none mt-0.5">
                    {ChordTransposer.transposeChord(formatKey(song.originalKey), transpose)}
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center h-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
              >
                <button
                  onClick={onTransposeDown}
                  className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100"
                  aria-label="Transpose down"
                >
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
                <button
                  onClick={onTransposeUp}
                  className="w-7 sm:w-8 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100"
                  aria-label="Transpose up"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            )}

            {/* Font Size Slider */}
            <div className="flex items-center h-8 bg-white border border-slate-200 rounded-lg shadow-sm px-2 gap-2">
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

            {isAdminAuthenticated && (
              <button
                onClick={handlePublishToggle}
                disabled={isPublishLoading}
                className={`h-8 px-3 flex items-center justify-center rounded-lg border text-[10px] font-semibold transition-colors disabled:opacity-50 whitespace-nowrap ${
                  isHidden
                    ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    : 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {isPublishLoading ? 'Saving...' : isHidden ? 'Unhide' : 'Hide'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
