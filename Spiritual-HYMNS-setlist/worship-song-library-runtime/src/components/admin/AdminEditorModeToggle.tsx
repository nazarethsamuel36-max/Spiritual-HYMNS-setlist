import type { EditingMode } from '../../types/AdminEditor';

interface AdminEditorModeToggleProps {
  currentMode: EditingMode;
  onModeChange: (mode: EditingMode) => void;
}

export function AdminEditorModeToggle({
  currentMode,
  onModeChange,
}: AdminEditorModeToggleProps) {
  return (
    <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex gap-2">
        {/* Chords Mode */}
        <button
          onClick={() => onModeChange('chords')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            currentMode === 'chords'
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          }`}
        >
          <span className="text-lg">🎵</span>
          <span className="hidden sm:inline">Edit Chords</span>
          <span className="sm:hidden">Chords</span>
        </button>

        {/* Lyrics Mode */}
        <button
          onClick={() => onModeChange('lyrics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            currentMode === 'lyrics'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
          }`}
        >
          <span className="text-lg">📝</span>
          <span className="hidden sm:inline">Edit Lyrics</span>
          <span className="sm:hidden">Lyrics</span>
        </button>

        {/* Info text */}
        <div className="ml-auto flex items-center">
          <p className="text-xs text-slate-600 dark:text-slate-400 hidden lg:block">
            {currentMode === 'chords'
              ? 'Click on words to add/edit chords'
              : 'Edit lyrics while keeping chords safe'}
          </p>
        </div>
      </div>
    </div>
  );
}
