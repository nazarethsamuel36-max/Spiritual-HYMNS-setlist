import { useWorkflowStore } from '../store/workflowStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';

export function ContextRail() {
  const setShowContextRail = useWorkflowStore((s) => s.setShowContextRail);
  const reader = useWorkflowStore((s) => s.reader);
  const activeSongId = reader.type === 'song' ? reader.songId : null;
  const activeArrangementId = reader.type === 'song' ? reader.activeArrangementId : null;
  const setActiveArrangementId = useWorkflowStore((s) => s.setActiveArrangementId);
  const setReaderMode = useWorkflowStore((s) => s.setReaderMode);

  const arrangements = useLiveQuery(() => 
    activeSongId ? db.arrangements.where({ songId: activeSongId }).toArray() : []
  , [activeSongId]) || [];

  if (!activeSongId) return null;

  return (
    <div className="context-rail-pane bg-slate-50 border-l border-slate-200">
      <header className="px-4 py-3 border-b border-slate-200 bg-white flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Context Rail</h2>
        <button
          onClick={() => setShowContextRail(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 hide-scrollbar">
        {/* Arrangements Section */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Arrangements</h3>
          <div className="space-y-2">
            <button 
              onClick={() => setActiveArrangementId(null)}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold transition-colors ${!activeArrangementId ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-500'}`}
            >
              Original Version
            </button>
            {arrangements.map(arr => (
              <button 
                key={arr.id}
                onClick={() => setActiveArrangementId(arr.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold transition-colors flex justify-between items-center ${activeArrangementId === arr.id ? 'bg-amber-50 border-amber-200 shadow-sm text-amber-900' : 'bg-transparent border-transparent hover:bg-slate-200/50 text-slate-600'}`}
              >
                <span className="truncate">{arr.name}</span>
                {activeArrangementId === arr.id && (
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">Active</span>
                )}
              </button>
            ))}
            <button 
              onClick={() => setReaderMode('edit')}
              className="w-full text-left px-3 py-2 rounded-lg bg-transparent border border-transparent hover:bg-slate-200/50 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>New Personal Overlay</span>
            </button>
          </div>
        </div>

        {/* Notes Section */}
        <div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Personal Notes</h3>
          <textarea 
            className="w-full h-32 p-3 text-sm rounded-lg border border-slate-200 bg-white resize-none focus:ring-1 focus:ring-slate-300 focus:border-slate-300 outline-none placeholder:text-slate-400"
            placeholder="Add notes for this song..."
          />
        </div>
      </div>
    </div>
  );
}
