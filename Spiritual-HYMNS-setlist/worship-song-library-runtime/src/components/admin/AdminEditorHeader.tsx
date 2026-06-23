import { useState } from 'react';

interface AdminEditorHeaderProps {
  title: string;
  defaultKey: string;
  onTitleChange: (title: string) => void;
  onKeyChange: (key: string) => void;
}

const AVAILABLE_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm',
];

export function AdminEditorHeader({
  title,
  defaultKey,
  onTitleChange,
  onKeyChange,
}: AdminEditorHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(title);

  const handleTitleSave = () => {
    if (editTitle.trim()) {
      onTitleChange(editTitle.trim());
    } else {
      setEditTitle(title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        {/* Back Button + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => {/* TODO: navigate back */}}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 text-2xl"
            aria-label="Back"
            title="Back"
          >
            ←
          </button>

          {isEditingTitle ? (
            <input
              autoFocus
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSave();
                if (e.key === 'Escape') {
                  setEditTitle(title);
                  setIsEditingTitle(false);
                }
              }}
              className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none min-w-0 flex-1"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate flex-1"
            >
              {title}
            </h1>
          )}
        </div>

        {/* Key Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:block">
            Default Key:
          </label>
          <select
            value={defaultKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AVAILABLE_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
