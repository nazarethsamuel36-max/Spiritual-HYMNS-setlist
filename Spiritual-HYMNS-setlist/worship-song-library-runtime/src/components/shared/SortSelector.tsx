import { useState } from 'react';

interface SortSelectorProps {
  value: 'number' | 'title';
  onChange: (value: 'number' | 'title') => void;
}

export function SortSelector({ value, onChange }: SortSelectorProps) {
  const [open, setOpen] = useState(false);
  const label = value === 'number' ? 'Number' : 'Title';

  return (
    <div className="relative flex items-center">
      <button
        id="sort-selector-btn"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors py-0.5"
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M10 17h4" />
        </svg>
        <span>Sort: <span className="text-slate-700 font-bold">{label}</span></span>
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-7 left-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 pt-3 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort Songs</span>
            </div>
            {(['number', 'title'] as const).map((opt) => (
              <button
                key={opt}
                id={`sort-option-${opt}`}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 text-[14px] font-semibold transition-colors border-t border-slate-50 ${
                  value === opt
                    ? 'text-slate-900 bg-slate-50'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <span>{opt === 'number' ? 'Number' : 'Title'}</span>
                {value === opt && (
                  <svg className="w-4 h-4 text-slate-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
