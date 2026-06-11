import { ChordTransposer } from '../../utils/ChordTransposer';
import { SetlistAddDropdown } from '../shared/SetlistAddDropdown';
import type { SongDetail } from '../../db/Database';
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

export function ReaderHeader({ song, transpose, mode, onTransposeUp, onTransposeDown, onModeChange, onBack }: ReaderHeaderProps) {
  const showContextRail = useWorkflowStore(s => s.showContextRail);
  const setShowContextRail = useWorkflowStore(s => s.setShowContextRail);

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
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider truncate">{song.artist || 'Unknown Artist'}</span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-slate-500 text-xs font-medium">#{song.songNumber}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Segmented Control */}
          <div className="flex items-center p-1 bg-slate-200/50 rounded-lg h-9">
            <button
              onClick={() => onModeChange('chords')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'chords' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Chords
            </button>
            <button
              onClick={() => onModeChange('lyrics')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${mode === 'lyrics' ? 'bg-white text-[var(--color-brand)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Lyrics
            </button>
            <button
              onClick={() => onModeChange('edit')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center space-x-1 ${mode === 'edit' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <span>Edit</span>
            </button>
          </div>

          <SetlistAddDropdown songId={song.id} />

          {/* Transpose Hub - Only active/visible in chords mode */}
          <div className={`flex items-center h-9 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden transition-opacity ${mode === 'lyrics' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <button
              onClick={onTransposeDown}
              className="w-9 h-full flex items-center justify-center hover:bg-slate-50 transition-colors text-slate-600 font-black active:bg-slate-100"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
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
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>

          {/* Context Rail Toggle */}
          <button
            onClick={() => setShowContextRail(!showContextRail)}
            className={`hidden md:flex items-center justify-center w-9 h-9 rounded-lg border transition-all ${showContextRail ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            title="Toggle Context Rail"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
