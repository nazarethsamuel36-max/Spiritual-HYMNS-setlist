import { memo, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SongIndex } from '../../db/Database';
import { SetlistService } from '../../services/SetlistService';
import { formatSongTitle, formatKey } from '../../utils/SongFormatter';

interface SongRowProps {
  song: SongIndex & { matchType?: 'title' | 'lyrics' | 'both'; lyricsSnippet?: string };
  onSelect: (id: number) => void;
  isActive?: boolean;
  onDelete?: () => void;
  hideNumber?: boolean;
  titleOnly?: boolean;
}

interface PopoverPos {
  top: number;
  left: number;
  openUpward: boolean;
}

function SetlistPopover({
  song,
  anchorRef,
  onClose,
}: {
  song: SongIndex;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const setlists = useLiveQuery(() => db.setlists.toArray());
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to the trigger button
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const popoverWidth = 192;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    // Tentative: open upward if there isn't room below (use a small estimate first)
    const openUpward = spaceBelow < 120;
    const top = openUpward ? rect.top - 40 : rect.bottom + 8;
    const left = Math.min(rect.right - popoverWidth, window.innerWidth - popoverWidth - 8);
    setPos({ top, left: Math.max(8, left), openUpward });
  }, [anchorRef]);

  // Reposition after mount once the real popover size is known
  useEffect(() => {
    if (!pos || !anchorRef.current || !popoverRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const popHeight = popoverRef.current.offsetHeight;
    const popWidth = popoverRef.current.offsetWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < popHeight + 8 && spaceAbove >= popHeight + 8;
    const top = openUpward ? rect.top - popHeight - 8 : rect.bottom + 8;
    const left = Math.min(rect.right - popWidth, window.innerWidth - popWidth - 8);
    setPos({ top: Math.max(8, top), left: Math.max(8, left), openUpward });
  }, [pos, anchorRef, setlists]);

  // Close on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose, anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{ top: pos.top, left: pos.left, position: 'fixed', width: 192, zIndex: 9999 }}
      className="bg-[var(--color-surface)] border border-slate-200 rounded-xl p-2 overflow-hidden"
    >
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-2 tracking-wider border-b border-slate-100 pb-2">Add to Setlist</div>
      <div className="max-h-40 overflow-y-auto space-y-0.5">
        {!setlists ? (
          <div className="text-xs text-center py-3 text-slate-400">Loading...</div>
        ) : setlists.length === 0 ? (
          <div className="text-xs text-center py-3 text-slate-500">No setlists found.</div>
        ) : (
          setlists.map(list => (
            <button
              key={list.id}
              onClick={async (e) => {
                e.stopPropagation();
                await SetlistService.addSongToSetlist(list.id, song.id);
                onClose();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
            >
              {list.title}
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  );
}

export const SongRow = memo(function SongRow({ song, onSelect, isActive, onDelete, hideNumber }: SongRowProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`relative group lang-${song.language?.toLowerCase()} ${isActive ? 'bg-slate-100' : ''}`}>
      <button
        onClick={() => onSelect(song.id)}
        className="flex items-center text-left py-3 px-2 hover:bg-slate-100 transition-none w-full group"
      >
        {/* Number without circle */}
        <div className="w-8 flex-shrink-0 flex items-center justify-center text-sm font-semibold mr-3 text-slate-500">
          {hideNumber ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          ) : (
            song.songNumber
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 text-base leading-normal truncate group-hover:text-slate-900 transition-colors">
            {formatSongTitle(song.title)}
          </h3>
          <div className="flex items-center space-x-1.5 mt-0.5 min-h-5">
            <span className="text-xs font-medium text-slate-500 truncate">
              Key {formatKey(song.originalKey)}
            </span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-xs font-medium text-slate-500">
              {song.language}
            </span>
            {song.is_active === false && (
              <>
                <span className="text-slate-300 text-[10px]">•</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  DRAFT
                </span>
              </>
            )}
          </div>
          {song.matchType === 'lyrics' && song.lyricsSnippet && (
            <div className="mt-1 text-xs text-slate-500 italic truncate">
              "{song.lyricsSnippet}"
            </div>
          )}
        </div>
      </button>

      {/* Quick-Add Trigger or Delete Button */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        {onDelete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : (
          <button
            ref={triggerRef}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddMenu(prev => !prev);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all active:scale-90 ${
              showAddMenu ? 'bg-slate-800 text-[var(--color-on-inverse)] shadow-md' : 'bg-transparent text-slate-400 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v12M6 12h12" />
            </svg>
          </button>
        )}
      </div>

      {/* Portal Popover — rendered at document.body, immune to overflow/z-index */}
      {showAddMenu && (
        <SetlistPopover
          song={song}
          anchorRef={triggerRef}
          onClose={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
});
