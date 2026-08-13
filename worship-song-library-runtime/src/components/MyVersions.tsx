import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/Database';
import { useWorkflowStore } from '../store/workflowStore';
import { VersionService } from '../services/VersionService';
import { SearchBar } from './shared/SearchBar';

export function MyVersions() {
  const [search, setSearch] = useState('');
  const openSong = useWorkflowStore((s) => s.openSong);
  const reader = useWorkflowStore((s) => s.reader);

  const versions = useLiveQuery(() => VersionService.findPersonalVersions(), []) || [];
  const activeVersionUid = reader.type === 'song' ? reader.activeArrangementId : null;

  // Resolve source-song titles in one pass
  const titleBySongId = useLiveQuery(async () => {
    const map = new Map<number, string>();
    for (const v of versions) {
      if (map.has(v.sourceSongId)) continue;
      const song = await db.songs.get(v.sourceSongId);
      if (song) map.set(v.sourceSongId, song.title);
    }
    return map;
  }, [versions]) || new Map<number, string>();

  const sorted = [...versions].sort((a, b) => b.updatedAt - a.updatedAt);
  const visible = search.trim()
    ? sorted.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()) ||
        (titleBySongId.get(v.sourceSongId) ?? '').toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const handleOpen = (version: { sourceSongId: number; uid: string }) => {
    openSong(version.sourceSongId, 'library', 0, undefined, undefined, version.uid, 'personal');
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Delete this version?')) return;
    await VersionService.deleteVersion(uid);
  };

  return (
    <div className="w-full">
      <div className="bg-slate-50/98 backdrop-blur-sm pt-2.5 pb-2.5 sticky top-0 z-40 border-b border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.05)]">
        <div className="px-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search my versions..." />
        </div>
      </div>

      <div className="flex flex-col pb-32">
        {versions.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium text-sm">
            No personal versions yet. Open a song and choose "New Version" to create one.
          </div>
        ) : visible.length === 0 ? (
          <div className="p-10 text-center text-slate-500 font-medium text-sm">
            No versions match your search.
          </div>
        ) : (
          visible.map((version) => {
            const isActive = version.uid === activeVersionUid;
            return (
              <div key={version.uid} className={`border-l-4 ${isActive ? 'border-amber-500' : 'border-[#3B2F2E]'}`}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpen(version)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleOpen(version); }}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{version.name}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {titleBySongId.get(version.sourceSongId) ?? `Song #${version.sourceSongId}`}
                      {version.originalKey ? ` · Key ${version.originalKey}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(version.uid);
                    }}
                    className="ml-3 p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                    title="Delete version"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
