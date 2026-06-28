import { useState, useRef, useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/Database';
import { useWorkflowStore } from '../../store/workflowStore';
import { SetlistService } from '../../services/SetlistService';

const SWIPE_THRESHOLD = 60;
const SWIPE_MAX_VERTICAL = 80;

interface ReaderItemViewProps {
  item: {
    type: 'marker' | 'note';
    label: string;
    content?: string;
    setlistId: string;
    itemId: string;
  };
  onClose: () => void;
}

export function ReaderItemView({ item, onClose }: ReaderItemViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [content, setContent] = useState(item.content || '');

  // Reset editing/label/content when item changes (e.g. on navigation)
  useEffect(() => {
    setIsEditing(false);
    setLabel(item.label);
    setContent(item.content || '');
  }, [item.itemId, item.label, item.content]);

  const openSong = useWorkflowStore((s) => s.openSong);
  const openMarker = useWorkflowStore((s) => s.openMarker);
  const openNote = useWorkflowStore((s) => s.openNote);

  // Load the setlist items when in setlist context for swipe navigation
  const setlistItems = useLiveQuery(async () => {
    const local = await db.setlists.get(item.setlistId);
    const setlist = local || await db.sharedSetlists.get(item.setlistId);
    if (!setlist) return null;
    return [...setlist.songs].sort((a, b) => a.order - b.order);
  }, [item.setlistId]);

  const navigateSetlist = useCallback((direction: 'prev' | 'next') => {
    if (!setlistItems) return;
    const currentIdx = setlistItems.findIndex(i => i.id === item.itemId);
    if (currentIdx === -1) return;

    const targetIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
    if (targetIdx < 0 || targetIdx >= setlistItems.length) return;

    const target = setlistItems[targetIdx];
    if (!target.type || target.type === 'song') {
      openSong(target.songId!, 'setlist', target.transpose ?? 0, item.setlistId, target.id);
    } else if (target.type === 'marker') {
      openMarker(target.label || 'Event Marker', item.setlistId, target.id);
    } else if (target.type === 'note') {
      openNote(target.label || 'Note', target.content || '', item.setlistId, target.id);
    }
  }, [setlistItems, item.setlistId, item.itemId, openSong, openMarker, openNote]);

  // Pointer gesture tracking
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isEditing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
    isHorizontalSwipeRef.current = null;
    setSwipeOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerStartRef.current || isEditing) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        isHorizontalSwipeRef.current = Math.abs(dx) > Math.abs(dy);
      }
    }

    if (isHorizontalSwipeRef.current) {
      e.stopPropagation();
      setSwipeOffset(dx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}

    if (!pointerStartRef.current || isEditing) return;

    const start = pointerStartRef.current;
    pointerStartRef.current = null;

    const deltaX = e.clientX - start.x;
    const deltaY = Math.abs(e.clientY - start.y);
    const absDx = Math.abs(deltaX);

    setSwipeOffset(0);
    isHorizontalSwipeRef.current = null;

    if (absDx >= SWIPE_THRESHOLD && deltaY <= SWIPE_MAX_VERTICAL) {
      const direction = deltaX < 0 ? 'next' : 'prev';
      navigateSetlist(direction);
    }
  };

  const handleSave = async () => {
    if (item.type === 'marker') {
      await SetlistService.updateItem(item.setlistId, item.itemId, { label });
    } else {
      await SetlistService.updateItem(item.setlistId, item.itemId, { label, content });
    }
    setIsEditing(false);
  };

  // Page indicator calculation
  const currentIdx = setlistItems
    ? setlistItems.findIndex(i => i.id === item.itemId)
    : -1;
  const totalItems = setlistItems?.length || 0;

  const maxDots = 7;
  let startDot = 0;
  let endDot = totalItems;
  if (totalItems > maxDots) {
    const half = Math.floor(maxDots / 2);
    startDot = currentIdx - half;
    if (startDot < 0) startDot = 0;
    endDot = startDot + maxDots;
    if (endDot > totalItems) {
      endDot = totalItems;
      startDot = endDot - maxDots;
    }
  }
  const visibleDots = Array.from({ length: endDot - startDot }, (_, i) => startDot + i);

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white sticky top-0 z-30">
        <button
          onClick={onClose}
          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setLabel(item.label);
                  setContent(item.content || '');
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Position Page Indicator */}
      {totalItems > 1 && (
        <div className="flex items-center justify-center space-x-1.5 py-2 bg-white border-b border-slate-100 select-none">
          {visibleDots.map((idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-200 ${
                idx === currentIdx
                  ? 'w-4 h-1.5 bg-[var(--color-brand)]'
                  : 'w-1.5 h-1.5 bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Content Area */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: swipeOffset !== 0 ? `translateX(${swipeOffset * 0.3}px)` : undefined,
          transition: swipeOffset === 0 ? 'transform 0.2s ease-out' : 'none',
          touchAction: 'pan-y',
        }}
        className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full select-none"
      >
        {item.type === 'marker' ? (
          /* Marker View */
          <div className="w-full text-center space-y-6">
            <div className="w-20 h-20 bg-[var(--color-brand-soft)] text-[var(--color-brand)] rounded-full flex items-center justify-center mx-auto shadow-md">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Event Marker Name</label>
                <input
                  type="text"
                  autoFocus
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-center text-2xl font-bold border-b-2 border-slate-300 focus:border-slate-800 outline-none pb-2 bg-transparent text-slate-900"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-[0.2em]">Service Event</div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-normal">
                  {item.label}
                </h1>
              </div>
            )}

            <div className="text-slate-400 text-xs font-medium italic mt-8 select-none">
              ← Swipe screen to navigate setlist →
            </div>
          </div>
        ) : (
          /* Note View */
          <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Note Title</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full text-lg font-bold border border-slate-200 rounded-lg px-3 py-2 focus:border-slate-400 outline-none text-slate-900 bg-[#FAFAFA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Note Body</label>
                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:border-slate-400 outline-none text-slate-700 bg-[#FAFAFA] text-base leading-relaxed"
                    placeholder="Enter instructions, cues, or announcements..."
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Service Note</div>
                    <h1 className="text-xl font-bold text-slate-800">{item.label}</h1>
                  </div>
                </div>

                <div className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap min-h-24">
                  {item.content || <span className="italic text-slate-400 text-sm">No instructions entered. Click Edit to write.</span>}
                </div>

                <div className="text-slate-400 text-[10px] text-center font-bold tracking-widest pt-4 border-t border-slate-100 uppercase select-none">
                  ← Swipe screen to navigate setlist →
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
