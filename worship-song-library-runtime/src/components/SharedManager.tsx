import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { formatSongTitle } from '../utils/SongFormatter';

export function SharedManager() {
  const openSong = useWorkflowStore((s) => s.openSong);
  const openSetlist = useWorkflowStore((s) => s.openSetlist);

  const sharedSongs = useLiveQuery(() => db.sharedSongs.toArray());
  const sharedSetlists = useLiveQuery(() => db.sharedSetlists.orderBy('updatedAt').reverse().toArray());

  const handleDeleteSong = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this shared song?')) {
      await db.sharedSongs.delete(id);
    }
  };

  const handleDeleteSetlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this shared setlist?')) {
      await db.sharedSetlists.delete(id);
    }
  };

  return (
    <div className="w-full px-2">
      {/* Shared Songs Section */}
      <div className="mb-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Shared Songs</h2>
        <div className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {!sharedSongs ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading...</div>
          ) : sharedSongs.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs italic">No shared songs imported yet.</div>
          ) : (
            sharedSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => openSong(song.id, 'shared')}
                className="group flex items-center justify-between p-3.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <div className="font-semibold text-slate-800 text-sm truncate font-poppins">{formatSongTitle(song.title)}</div>
                  <div className="flex items-center space-x-1.5 mt-0.5 text-xs text-slate-500 font-medium">
                    <span>{song.artist || 'Unknown Artist'}</span>
                    <span>•</span>
                    <span>{song.language}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSong(song.id, e)}
                  className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-slate-100 md:opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Shared Setlists Section */}
      <div>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Shared Setlists</h2>
        <div className="flex flex-col bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          {!sharedSetlists ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading...</div>
          ) : sharedSetlists.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs italic">No shared setlists imported yet.</div>
          ) : (
            sharedSetlists.map((list) => (
              <div
                key={list.id}
                onClick={() => openSetlist(list.id)}
                className="group flex items-center justify-between p-3.5 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors"
              >
                <div className="min-w-0 pr-4">
                  <div className="font-semibold text-slate-800 text-sm truncate font-poppins">{list.title}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {list.songs.length} songs • Updated {new Date(list.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSetlist(list.id, e)}
                  className="p-1.5 text-slate-300 hover:text-red-500 rounded-full hover:bg-slate-100 md:opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
