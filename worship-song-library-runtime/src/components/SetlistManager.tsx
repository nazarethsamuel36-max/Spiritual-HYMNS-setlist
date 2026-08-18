import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';
import { SetlistService } from '../services/SetlistService';
import { useWorkflowStore } from '../store/workflowStore';

export function SetlistManager() {
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const openSetlist = useWorkflowStore((s) => s.openSetlist);

  const setlists = useLiveQuery(() =>
    db.setlists.orderBy('updatedAt').reverse().toArray()
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const id = await SetlistService.createSetlist(newTitle.trim());
    setNewTitle('');
    setIsCreating(false);
    openSetlist(id);
  };

  const handleDelete = async (id: string) => {
    await SetlistService.deleteSetlist(id);
    setConfirmDeleteId(null);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col mb-4 bg-slate-50 border-b border-slate-200/60 pb-3 pt-1 sticky top-0 z-40">
        <div className="flex justify-between items-center px-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Setlists</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="text-[var(--color-brand)] bg-[var(--color-brand-soft)] hover:bg-slate-200 px-3 py-1.5 rounded-full font-bold text-[11px] transition-all"
          >
            + New Setlist
          </button>
        </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="mb-4 bg-[var(--color-surface)] border border-slate-200 p-4 rounded-xl shadow-sm animate-in zoom-in-95 duration-200 mx-2">
          <label className="block text-xs font-bold text-slate-500 mb-2">Setlist Name</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              autoFocus
              type="text"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 focus:border-slate-400 outline-none transition-all font-medium text-sm text-slate-800"
              placeholder="E.g. Sunday Worship..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2 text-slate-500 font-bold text-xs rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-800 text-[var(--color-on-inverse)] px-4 py-2 rounded-lg font-bold text-xs shadow-sm"
            >
              Create
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col pb-32">
        {!setlists ? (
          <div className="p-10 text-center text-slate-400 font-bold text-xs tracking-wide">Loading...</div>
        ) : setlists.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium text-sm">
            No setlists created.
          </div>
        ) : (
          setlists.map(list => (
            <div
              key={list.id}
              onClick={() => openSetlist(list.id)}
              className="relative group flex flex-col py-3.5 px-3 hover:bg-slate-100 transition-none text-left border-b border-slate-100 w-full last:border-b-0 cursor-pointer"
            >
              <div className="flex justify-between items-center w-full mb-1">
                <span className="font-semibold text-base text-slate-800 group-hover:text-slate-900 transition-colors leading-tight truncate pr-4">
                  {list.title}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded-full">
                    {list.songs.length}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDeleteId(confirmDeleteId === list.id ? null : list.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Delete Setlist"
                    aria-label="Delete Setlist"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-medium">
                  Updated {new Date(list.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {confirmDeleteId === list.id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-2 z-30 w-60 bg-[var(--color-surface)] border border-red-100 rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="text-sm font-bold text-slate-800 mb-1">Delete setlist?</div>
                  <div className="text-xs text-slate-500 mb-3 leading-relaxed">
                    "{list.title}" and all {list.songs.length} song{list.songs.length === 1 ? '' : 's'} in it will be permanently removed. This cannot be undone.
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
