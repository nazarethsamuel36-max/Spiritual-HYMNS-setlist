import React from 'react';
import type { SongPage } from './paginationTypes';
import { ChordProRenderer } from './ChordProRenderer';

interface ReaderPageProps {
  page: SongPage;
  fontSize: number;
  transpose: number;
  hideChords: boolean;
  songTitle?: string;
  songNumber?: number | string;
  side?: 'left' | 'right' | 'single';
  className?: string;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  page,
  fontSize,
  transpose,
  hideChords,
  songTitle,
  songNumber,
  side = 'single',
  className = '',
}) => {
  // Determine spine shadow effect based on whether this is a left or right page in a spread
  const spineGradient =
    side === 'left'
      ? 'linear-gradient(to left, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0) 15%)'
      : side === 'right'
      ? 'linear-gradient(to right, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.01) 8%, rgba(0,0,0,0) 15%)'
      : 'none';

  return (
    <div
      className={`relative flex flex-col h-full w-full bg-[#fdfdfc] dark:bg-[#1a1c23] text-slate-900 dark:text-slate-100 rounded-lg shadow-sm border border-slate-200/80 dark:border-slate-800 select-none overflow-hidden ${className}`}
      style={{
        boxShadow:
          side === 'single'
            ? '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)'
            : side === 'left'
            ? '0 4px 14px -2px rgba(0, 0, 0, 0.06), inset -1px 0 0 rgba(0,0,0,0.05)'
            : '0 4px 14px -2px rgba(0, 0, 0, 0.06), inset 1px 0 0 rgba(0,0,0,0.05)',
      }}
    >
      {/* Book spine gutter shadow */}
      {spineGradient !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: spineGradient }}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
        <div className="truncate max-w-[70%]">
          {page.sectionTitle ? (
            <span className="text-slate-600 dark:text-slate-300 font-bold">{page.sectionTitle}</span>
          ) : songTitle ? (
            <span>
              {songNumber ? `#${songNumber} ` : ''}
              {songTitle}
            </span>
          ) : (
            <span>Page</span>
          )}
        </div>
        <div className="text-[10px] font-mono tracking-normal">
          {page.pageIndex + 1} / {page.totalPages}
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 px-3 sm:px-6 py-2 overflow-y-auto hide-scrollbar">
        <ChordProRenderer
          parsedLines={page.lines}
          fontSize={fontSize}
          transpose={transpose}
          hideChords={hideChords}
          style={{ padding: '0px' }}
        />
      </div>

      {/* Page Footer */}
      <div className="px-4 sm:px-6 py-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
        <span className="truncate max-w-[60%]">
          {songTitle && page.pageIndex > 0 ? songTitle : ''}
        </span>
        <span className="font-mono ml-auto">
          {page.pageIndex + 1}
        </span>
      </div>
    </div>
  );
};
