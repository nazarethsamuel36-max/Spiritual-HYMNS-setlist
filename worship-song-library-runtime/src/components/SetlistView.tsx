import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';
import { SetlistService } from '../services/SetlistService';
import { SearchEngine } from '../utils/SearchEngine';
import { useWorkflowStore } from '../store/workflowStore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SetlistViewProps {
  setlistId: string;
}

function SortableSongItem({ item, setlistId }: { item: any, setlistId: string }) {
  const openSong = useWorkflowStore((s) => s.openSong);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `${item.songId}-${item.order}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center py-3 px-2 border-b border-slate-100 bg-slate-50 hover:bg-slate-100 transition-none last:border-b-0"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="mr-3 flex items-center cursor-grab active:cursor-grabbing touch-none">
        <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-bold mr-2">
          {item.order + 1}
        </div>
        <div className="text-slate-300 group-hover:text-slate-500 transition-colors md:opacity-0 group-hover:opacity-100 px-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      <button
        onClick={() => openSong(item.songId, 'setlist', item.transpose)}
        className="flex-1 text-left min-w-0 flex items-center justify-between"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="font-semibold text-slate-800 text-sm md:text-base truncate group-hover:text-slate-900 transition-colors">
            {item.detail?.title || 'Unknown Song'}
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="text-xs font-medium text-slate-500">{item.detail?.language}</span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-xs font-medium text-slate-500">#{item.detail?.songNumber}</span>
          </div>
        </div>

        {item.transpose !== 0 && (
          <div className="px-2 py-1 bg-slate-200 text-slate-700 text-[11px] font-bold rounded-md mr-2">
            {item.transpose > 0 ? `+${item.transpose}` : item.transpose}
          </div>
        )}
      </button>

      {/* Delete */}
      <button
        onClick={() => SetlistService.removeSongFromSetlist(setlistId, item.songId, item.order)}
        className="p-2 text-slate-300 hover:bg-slate-200 hover:text-red-500 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function SetlistView({ setlistId }: SetlistViewProps) {
  const [search, setSearch] = useState('');
  const closeSetlist = useWorkflowStore((s) => s.closeSetlist);
  const setlist = useLiveQuery(() => db.setlists.get(setlistId), [setlistId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const songDetails = useLiveQuery(async () => {
    if (!setlist) return [];
    const ids = setlist.songs.map(s => s.songId);
    const items = await db.songIndex.where('id').anyOf(ids).toArray();
    return setlist.songs.map(s => {
      const detail = items.find(d => d.id === s.songId);
      return { ...s, detail };
    });
  }, [setlist]);

  const searchResults = useLiveQuery(async () => {
    if (!search.trim()) return [];
    const allSongs = await db.songIndex.toArray();
    return SearchEngine.search(allSongs, search);
  }, [search]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = songDetails?.findIndex(s => `${s.songId}-${s.order}` === active.id) ?? -1;
      const newIndex = songDetails?.findIndex(s => `${s.songId}-${s.order}` === over.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) {
        SetlistService.reorderSongs(setlistId, oldIndex, newIndex);
      }
    }
  }

  if (!setlist) return null;

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
           <button
              onClick={closeSetlist}
              className="flex items-center space-x-2 text-[var(--color-text-muted)] hover:text-[var(--color-brand)] font-black uppercase text-[9px] tracking-widest mb-3 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              <span>Setlists</span>
            </button>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{setlist.title}</h2>
        </div>

        <button
          onClick={() => {
            const ids = setlist.songs.map(s => s.songId).join(',');
            const url = `${window.location.origin}${window.location.pathname}?setlist=${ids}`;
            navigator.clipboard.writeText(url);
            alert('Workflow link copied!');
          }}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          <span>Share Flow</span>
        </button>
      </div>

      {/* Add to Workflow */}
      <div className="relative mb-8">
        <input
          type="text"
          placeholder="Add song to this workflow..."
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:outline-none focus:border-[var(--color-brand)] focus:bg-white transition-all text-sm font-bold text-[var(--color-text)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <svg className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>

        {search.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-[100] max-h-72 overflow-y-auto">
            {searchResults?.map((song) => (
              <button
                key={song.id}
                onClick={async () => {
                  await SetlistService.addSongToSetlist(setlistId, song.id);
                  setSearch('');
                }}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-brand-soft)] transition-colors border-b border-slate-50 last:border-0"
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded">#{song.songNumber}</span>
                  <div className="font-bold text-slate-800 text-sm">{song.title}</div>
                </div>
                <div className="text-[var(--color-brand)] font-black text-[10px] uppercase">Add</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sortable Sequence */}
      <div className="space-y-1">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 px-1 flex justify-between">
          <span>Workflow Sequence</span>
          <span>{songDetails?.length} Songs</span>
        </div>

        {songDetails?.length === 0 ? (
          <div className="p-16 text-center text-slate-300 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm">
            Empty workflow. Use the search above to add songs.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={songDetails?.map(s => `${s.songId}-${s.order}`) ?? []} strategy={verticalListSortingStrategy}>
              {songDetails?.map((item) => (
                <SortableSongItem key={`${item.songId}-${item.order}`} item={item} setlistId={setlistId} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
      <div className="h-20"></div>
    </div>
  );
}
