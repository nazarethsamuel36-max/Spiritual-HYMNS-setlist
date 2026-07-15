import type { SongIndex } from '../../db/Database';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SongRow } from './SongRow';

interface SearchOverlayProps {
  results: SongIndex[];
  onSelectSong: (id: number) => void;
  onClose: () => void;
  searchBarRef: React.RefObject<HTMLDivElement | null>;
}

export function SearchOverlay({ results, onSelectSong, onClose, searchBarRef }: SearchOverlayProps) {
  const [position, setPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const renderCount = useRef(0);
  renderCount.current++;
  console.log(`[PERF] SearchOverlay render #${renderCount.current}, results: ${results.length}`);

  // Calculate overlay position to cover the entire SongList area below the search bar (covering the sort controls)
  useEffect(() => {
    const anchorEl = searchBarRef.current;
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    
    const headerEl = document.getElementById('song-list-filters-header');
    const borderRect = headerEl ? headerEl.getBoundingClientRect() : rect;
    
    setPosition({
      top: rect.bottom, // Cover everything below the search input (including sort selector)
      left: borderRect.left,
      width: borderRect.width,
      height: window.innerHeight - rect.bottom
    });
  }, [searchBarRef]);

  // Close on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node) &&
        searchBarRef.current &&
        !searchBarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose, searchBarRef]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!position) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed z-50 bg-slate-50 overflow-hidden animate-in fade-in duration-200"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height
      }}
    >
      {/* Search Results Header */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 py-3">
        <div className="text-sm font-semibold text-slate-700">Search Results</div>
        <div className="text-xs text-slate-500">{results.length} songs found</div>
      </div>

      {/* Results - scrollable like SongList, scrollbar hidden */}
      <div className="overflow-y-auto hide-scrollbar" style={{ height: position.height - 60 }}>
        {results.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No results found</div>
        ) : (
          results.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              onSelect={(id) => {
                onSelectSong(id);
                onClose();
              }}
            />
          ))
        )}
      </div>
    </div>,
    document.body
  );
}
