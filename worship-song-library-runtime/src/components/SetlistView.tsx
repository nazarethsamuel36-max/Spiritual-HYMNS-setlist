import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSongIndexById } from '../db/Database';
import { SetlistService } from '../services/SetlistService';
import { SearchEngine } from '../utils/SearchEngine';
import { formatSongTitle } from '../utils/SongFormatter';
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

// ─── Song Row ────────────────────────────────────────────────────────────────
function SortableSongItem({ item, setlistId }: { item: any, setlistId: string }) {
  const openSong = useWorkflowStore((s) => s.openSong);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

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
        onClick={() => openSong(item.songId, 'setlist', item.transpose, setlistId, item.id)}
        className="flex-1 text-left min-w-0 flex items-center justify-between outline-none focus:outline-none"
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="font-semibold text-slate-800 text-sm md:text-base leading-normal truncate group-hover:text-slate-900 transition-colors py-1">
            {formatSongTitle(item.detail?.title || 'Unknown Song')}
          </div>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <span className="text-xs font-medium text-slate-500">{item.detail?.language}</span>
            <span className="text-slate-300 text-[10px]">•</span>
            <span className="text-xs font-medium text-slate-500">{item.detail?.songNumber}</span>
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
        onClick={() => SetlistService.removeItemFromSetlist(setlistId, item.id)}
        className="p-2 text-slate-300 hover:bg-slate-200 hover:text-red-500 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Marker Row ───────────────────────────────────────────────────────────────
function SortableMarkerItem({ item, setlistId }: { item: any, setlistId: string }) {
  const openMarker = useWorkflowStore((s) => s.openMarker);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

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
      className="group flex items-center py-2.5 px-2 border-b border-[var(--color-brand-soft)] bg-[var(--color-brand-soft)]/60 hover:bg-[var(--color-brand-soft)] transition-none last:border-b-0"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="mr-3 flex items-center cursor-grab active:cursor-grabbing touch-none">
        <div className="w-8 h-8 flex items-center justify-center bg-white border border-[var(--color-brand)]/30 text-[var(--color-brand)] rounded-lg text-sm font-bold mr-2">
          {item.order + 1}
        </div>
        <div className="text-[var(--color-brand)]/40 group-hover:text-[var(--color-brand)]/70 transition-colors md:opacity-0 group-hover:opacity-100 px-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      <button
        onClick={() => openMarker(item.label || 'Event Marker', setlistId, item.id)}
        className="flex-1 text-left min-w-0 flex items-center space-x-3"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--color-brand)]/20 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-[var(--color-brand)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <div className="text-[9px] font-black text-[var(--color-brand)] uppercase tracking-[0.15em]">Event Marker</div>
          <div className="font-bold text-slate-700 text-sm">{item.label || 'Untitled Marker'}</div>
        </div>
      </button>

      {/* Delete */}
      <button
        onClick={() => SetlistService.removeItemFromSetlist(setlistId, item.id)}
        className="p-2 text-slate-300 hover:bg-white/60 hover:text-red-500 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Note Row ─────────────────────────────────────────────────────────────────
function SortableNoteItem({ item, setlistId }: { item: any, setlistId: string }) {
  const openNote = useWorkflowStore((s) => s.openNote);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

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
      className="group flex items-center py-2.5 px-2 border-b border-amber-100 bg-amber-50/60 hover:bg-amber-50 transition-none last:border-b-0"
    >
      {/* Drag Handle */}
      <div {...attributes} {...listeners} className="mr-3 flex items-center cursor-grab active:cursor-grabbing touch-none">
        <div className="w-8 h-8 flex items-center justify-center bg-white border border-amber-200 text-amber-600 rounded-lg text-sm font-bold mr-2">
          {item.order + 1}
        </div>
        <div className="text-amber-300 group-hover:text-amber-500 transition-colors md:opacity-0 group-hover:opacity-100 px-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      <button
        onClick={() => openNote(item.label || 'Note', item.content || '', setlistId, item.id)}
        className="flex-1 text-left min-w-0 flex items-center space-x-3"
      >
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-[9px] font-black text-amber-600 uppercase tracking-[0.15em]">Note</div>
          <div className="font-bold text-slate-700 text-sm truncate">{item.label || 'Untitled Note'}</div>
        </div>
      </button>

      {/* Delete */}
      <button
        onClick={() => SetlistService.removeItemFromSetlist(setlistId, item.id)}
        className="p-2 text-slate-300 hover:bg-white/60 hover:text-red-500 rounded-full transition-colors md:opacity-0 group-hover:opacity-100"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main SetlistView ─────────────────────────────────────────────────────────
export function SetlistView({ setlistId }: SetlistViewProps) {
  const [search, setSearch] = useState('');
  const [addingMarker, setAddingMarker] = useState(false);
  const [markerLabel, setMarkerLabel] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [noteLabel, setNoteLabel] = useState('');
  const closeSetlist = useWorkflowStore((s) => s.closeSetlist);

  const setlist = useLiveQuery(async () => {
    const local = await db.setlists.get(setlistId);
    if (local) return local;
    return await db.sharedSetlists.get(setlistId);
  }, [setlistId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Enrich all items with song details where applicable
  const enrichedItems = useLiveQuery(async () => {
    if (!setlist) return [];
    const items = [];
    for (const item of setlist.songs) {
      if (!item.type || item.type === 'song') {
        const detail = await getSongIndexById(item.songId!);
        items.push({ ...item, detail });
      } else {
        items.push({ ...item });
      }
    }
    return items.sort((a, b) => a.order - b.order);
  }, [setlist]);

  const searchResults = useLiveQuery(async () => {
    if (!search.trim()) return [];
    const allSongs = await db.songIndex.toArray();
    return SearchEngine.search(allSongs, search);
  }, [search]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = enrichedItems?.findIndex(s => s.id === active.id) ?? -1;
      const newIndex = enrichedItems?.findIndex(s => s.id === over.id) ?? -1;
      if (oldIndex !== -1 && newIndex !== -1) {
        SetlistService.reorderItems(setlistId, oldIndex, newIndex);
      }
    }
  }

  async function handleAddMarker() {
    const label = markerLabel.trim() || 'Service Event';
    await SetlistService.addMarkerToSetlist(setlistId, label);
    setMarkerLabel('');
    setAddingMarker(false);
  }

  async function handleAddNote() {
    const label = noteLabel.trim() || 'Note';
    await SetlistService.addNoteToSetlist(setlistId, label, '');
    setNoteLabel('');
    setAddingNote(false);
  }

  if (!setlist) return null;

  const itemCount = enrichedItems?.length ?? 0;
  const songCount = enrichedItems?.filter(i => !i.type || i.type === 'song').length ?? 0;

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
          onClick={async () => {
            try {
              const sharedSongsList = [];
              for (const s of setlist.songs) {
                if (s.songId) {
                  const sharedSong = await db.sharedSongs.get(s.songId);
                  if (sharedSong) sharedSongsList.push(sharedSong);
                }
              }
              const payload = {
                id: setlist.id,
                title: setlist.title,
                createdAt: setlist.createdAt,
                songs: setlist.songs,
                sharedSongsList
              };
              const json = JSON.stringify(payload);
              const b64 = btoa(unescape(encodeURIComponent(json)));
              const url = `${window.location.origin}${window.location.pathname}?import_setlist=${b64}`;
              navigator.clipboard.writeText(url);
              alert('Shareable setlist link copied to clipboard!');
            } catch (e) {
              console.error(e);
              alert('Failed to share setlist.');
            }
          }}
          className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          <span>Share Setlist</span>
        </button>
      </div>

      {/* Add Song Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search songs to add..."
          className="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-slate-100 bg-slate-50/50 focus:outline-none focus:border-[var(--color-brand)] focus:bg-white transition-all text-sm font-bold text-[var(--color-text)]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <svg className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" /></svg>

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
                  <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded">{song.songNumber}</span>
                  <div className="font-bold text-slate-800 text-sm">{song.title}</div>
                </div>
                <div className="text-[var(--color-brand)] font-black text-[10px] uppercase">Add</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Marker / Note Buttons */}
      <div className="flex space-x-2 mb-8">
        {!addingMarker ? (
          <button
            onClick={() => { setAddingMarker(true); setAddingNote(false); }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-[var(--color-brand)]/30 bg-[var(--color-brand-soft)] hover:bg-[var(--color-brand-soft)]/80 text-[var(--color-brand)] text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Event Marker</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 flex-1">
            <input
              autoFocus
              type="text"
              placeholder="Marker name (e.g. Sermon, Prayer)..."
              className="flex-1 pl-3 pr-2 py-2 rounded-lg border-2 border-[var(--color-brand)]/40 bg-white focus:outline-none focus:border-[var(--color-brand)] text-sm font-medium"
              value={markerLabel}
              onChange={(e) => setMarkerLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddMarker(); if (e.key === 'Escape') setAddingMarker(false); }}
            />
            <button onClick={handleAddMarker} className="bg-[var(--color-brand)] text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider">Add</button>
            <button onClick={() => setAddingMarker(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">Cancel</button>
          </div>
        )}

        {!addingNote && !addingMarker && (
          <button
            onClick={() => { setAddingNote(true); setAddingMarker(false); }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Note</span>
          </button>
        )}

        {addingNote && (
          <div className="flex items-center space-x-2 flex-1">
            <input
              autoFocus
              type="text"
              placeholder="Note title (e.g. Announcements)..."
              className="flex-1 pl-3 pr-2 py-2 rounded-lg border-2 border-amber-300 bg-white focus:outline-none focus:border-amber-500 text-sm font-medium"
              value={noteLabel}
              onChange={(e) => setNoteLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); if (e.key === 'Escape') setAddingNote(false); }}
            />
            <button onClick={handleAddNote} className="bg-amber-600 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider">Add</button>
            <button onClick={() => setAddingNote(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">Cancel</button>
          </div>
        )}
      </div>

      {/* Sortable Sequence */}
      <div className="space-y-1">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 px-1 flex justify-between">
          <span>Setlist Sequence</span>
          <span>{songCount} Song{songCount !== 1 ? 's' : ''} · {itemCount} Item{itemCount !== 1 ? 's' : ''}</span>
        </div>

        {itemCount === 0 ? (
          <div className="p-16 text-center text-slate-300 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm">
            Empty setlist. Search songs or add markers above.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={enrichedItems?.map(s => s.id) ?? []} strategy={verticalListSortingStrategy}>
              {enrichedItems?.map((item) => {
                if (!item.type || item.type === 'song') {
                  return <SortableSongItem key={item.id} item={item} setlistId={setlistId} />;
                }
                if (item.type === 'marker') {
                  return <SortableMarkerItem key={item.id} item={item} setlistId={setlistId} />;
                }
                if (item.type === 'note') {
                  return <SortableNoteItem key={item.id} item={item} setlistId={setlistId} />;
                }
                return null;
              })}
            </SortableContext>
          </DndContext>
        )}
      </div>
      <div className="h-20"></div>
    </div>
  );
}
