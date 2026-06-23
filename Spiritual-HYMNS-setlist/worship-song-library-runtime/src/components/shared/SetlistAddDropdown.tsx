import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/Database';
import { SetlistService } from '../../services/SetlistService';

interface SetlistAddDropdownProps {
  songId: number;
}

export function SetlistAddDropdown({ songId }: SetlistAddDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const setlists = useLiveQuery(() => db.setlists.toArray());

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 h-9 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="hidden sm:inline">Setlist</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 p-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-2 tracking-wider">Add to Setlist</div>
            <div className="max-h-40 overflow-y-auto space-y-0.5 hide-scrollbar">
              {setlists?.length === 0 ? (
                <div className="text-xs text-center py-3 text-slate-500">No setlists found.</div>
              ) : (
                setlists?.map(list => (
                  <button
                    key={list.id}
                    onClick={async () => {
                      await SetlistService.addSongToSetlist(list.id, songId);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium text-slate-700 transition-colors"
                  >
                    {list.title}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
