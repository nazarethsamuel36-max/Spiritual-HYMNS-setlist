

interface AdminEditorFooterProps {
  onClose?: () => void;
}

export function AdminEditorFooter({ onClose }: AdminEditorFooterProps) {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
        {/* Primary Actions */}
        <div className="flex gap-2 flex-wrap">
          {/* Save Draft */}
          <button
            onClick={() => {
              // TODO: Implement save draft logic
              console.log('Save Draft clicked');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
            title="Save changes as draft (not published)"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Save</span>
          </button>

          {/* Preview */}
          <button
            onClick={() => {
              // TODO: Implement full preview mode
              console.log('Preview clicked');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
            title="View full screen preview"
          >
            <span>👁️</span>
            <span className="hidden sm:inline">Preview</span>
            <span className="sm:hidden">View</span>
          </button>

          {/* Publish */}
          <button
            onClick={() => {
              // TODO: Implement publish logic
              console.log('Publish clicked');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
            title="Publish changes to library (visible to all users)"
          >
            <span>📤</span>
            <span className="hidden sm:inline">Publish</span>
            <span className="sm:hidden">Pub</span>
          </button>
        </div>

        {/* Status Indicator */}
        <div className="text-xs text-slate-600 dark:text-slate-400 hidden md:block">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Ready
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-lg transition-colors ml-auto"
          title="Close editor"
        >
          <span>✕</span>
          <span className="hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded px-3 py-2">
        <strong>Note:</strong> This is a UI prototype. Save, Preview, and Publish buttons are non-functional placeholders.
        Backend integration will be implemented next.
      </div>
    </footer>
  );
}
