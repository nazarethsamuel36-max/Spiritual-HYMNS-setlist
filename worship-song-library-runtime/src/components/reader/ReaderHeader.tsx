import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongDetail } from '../../db/Database';
import { SetlistService } from '../../services/SetlistService';
import { ChordTransposer } from '../../utils/ChordTransposer';
import type { ReaderMode } from '../../store/workflowStore';
import { useWorkflowStore } from '../../store/workflowStore';

interface ReaderHeaderProps {
  song: SongDetail;
  transpose: number;
  mode: ReaderMode;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onModeChange: (mode: ReaderMode) => void;
  onBack?: () => void;
}

export function ReaderHeader({
  song,
  transpose,
  mode,
  onTransposeUp,
  onTransposeDown,
  onModeChange,
  onBack
}: ReaderHeaderProps) {
  const showContextRail = useWorkflowStore((s) => s.showContextRail);
  const setShowContextRail = useWorkflowStore((s) => s.setShowContextRail);
  const activeArrangementId = useWorkflowStore((s) => s.reader.type === 'song' ? s.reader.activeArrangementId : null);
  const setActiveArrangementId = useWorkflowStore((s) => s.setActiveArrangementId);

  // Dropdown states
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [moreTab, setMoreTab] = useState<'main' | 'setlist' | 'versions' | 'details'>('main');

  const setlists = useLiveQuery(() => db.setlists.toArray());
  const arrangements = useLiveQuery(() =>
    db.arrangements.where({ songId: song.id }).toArray()
  , [song.id]) || [];

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
    <div className="flex-shrink-0 bg-[#FAFAFA]/95 backdrop-blur-md border-b border-slate-200/60 z-40 relative px-4 md:px-8 pt-4 pb-4 shadow-sm flex flex-col w-full">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden self-start flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 font-bold uppercase text-[10px] tracking-widest transition-all mb-4 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl mx-auto w-full">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{song.title}</h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider truncate">
              {song.artist || 'Unknown Artist'}
            </span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-slate-500 text-xs font-medium">#{song.songNumber}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Selector (Only Chords and Lyrics) */}
          <div className="flex items-center p-1 bg-slate-200/50 rounded-lg h-9">
            <button
              onClick={() => onModeChange('chords')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                mode === 'chords' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Chords
            </button>
            <button
              onClick={() => onModeChange('lyrics')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                mode === 'lyrics' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Lyrics
            </button>
          </div>

          {/* Transpose Hub */}
          <div
            className={`flex items-center h-9 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-opacity ${
              mode === 'lyrics' ? 'opacity-30 pointer-events-none' : 'opacity-100'
            }`}
          >
            <button
              onClick={onTransposeDown}
              className="w-9 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
              </svg>
            </button>
            <div className="flex flex-col justify-center items-center px-3 border-x border-slate-100 bg-slate-50/50 min-w-[3.5rem] h-full">
              <span className="text-[8px] uppercase font-bold text-slate-400 leading-none mb-0.5">Key</span>
              <span className="text-xs font-black text-slate-800 leading-none">
                {ChordTransposer.transposeChord(song.originalKey || 'C', transpose)}
              </span>
            </div>
            <button
              onClick={onTransposeUp}
              className="w-9 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Context Rail Toggle */}
          <button
            onClick={() => setShowContextRail(!showContextRail)}
            className={`hidden md:flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${
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
              className={`px-3 py-1.5 h-9 border rounded-lg shadow-sm text-xs font-bold transition-all flex items-center space-x-1 active:scale-95 ${
                isMoreOpen
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>More</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
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
                      <button
                        onClick={() => {
                          onModeChange('edit');
                          setIsMoreOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
                      >
                        Edit Overlay
                      </button>
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
    </div>
  );
}
