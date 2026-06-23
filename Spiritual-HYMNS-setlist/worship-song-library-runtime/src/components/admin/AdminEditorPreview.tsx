import type { EditableSong } from '../../types/AdminEditor';

interface AdminEditorPreviewProps {
  song: EditableSong;
}

export function AdminEditorPreview({ song }: AdminEditorPreviewProps) {
  if (!song.sections || song.sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-slate-500 dark:text-slate-400">No content to preview</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full pr-4 -mr-4">
      <div className="space-y-6">
        {/* Song Title */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
            {song.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {song.artist && `by ${song.artist}`}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
            Key: <span className="font-semibold text-slate-700 dark:text-slate-300">{song.defaultKey}</span>
          </p>
        </div>

        {/* Sections */}
        {song.sections.map((section, sIdx) => (
          <div key={section.id} className="space-y-2">
            {/* Section Label */}
            <div className="inline-block text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border shadow-sm border-slate-300 dark:border-slate-600">
              {section.label}
            </div>

            {/* Lines */}
            <div className="space-y-3">
              {section.lines.map((line) => (
                <div key={line.id} className="space-y-0.5">
                  {/* Chords (if any) */}
                  {line.chords.length > 0 && (
                    <div className="text-sm font-bold text-amber-600 dark:text-amber-400 min-h-6">
                      {line.chords.map((chord) => (
                        <span key={chord.id} className="mr-8">
                          {chord.chord}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Lyrics */}
                  {line.text && (
                    <p className="text-base md:text-lg font-serif leading-relaxed text-slate-800 dark:text-slate-100 whitespace-pre-wrap break-words">
                      {line.text}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Section Spacing */}
            {sIdx < song.sections.length - 1 && (
              <div className="my-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
