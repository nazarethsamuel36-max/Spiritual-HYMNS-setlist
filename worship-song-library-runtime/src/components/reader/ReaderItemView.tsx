import { useState } from 'react';
import { SetlistService } from '../../services/SetlistService';

interface ReaderItemViewProps {
  item: {
    type: 'marker' | 'note';
    label: string;
    content?: string;
    setlistId: string;
    itemId: string;
  };
  onClose: () => void;
}

export function ReaderItemView({ item, onClose }: ReaderItemViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [content, setContent] = useState(item.content || '');

  const handleSave = async () => {
    if (item.type === 'marker') {
      await SetlistService.updateItem(item.setlistId, item.itemId, { label });
    } else {
      await SetlistService.updateItem(item.setlistId, item.itemId, { label, content });
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/60 bg-white sticky top-0 z-30">
        <button
          onClick={onClose}
          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 font-bold uppercase text-[10px] tracking-widest transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>

        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setLabel(item.label);
                  setContent(item.content || '');
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-slate-900 text-white px-4 py-1.5 rounded-full hover:bg-slate-800 text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
        {item.type === 'marker' ? (
          /* Marker View */
          <div className="w-full text-center space-y-6">
            <div className="w-20 h-20 bg-[var(--color-brand-soft)] text-[var(--color-brand)] rounded-full flex items-center justify-center mx-auto shadow-md">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Event Marker Name</label>
                <input
                  type="text"
                  autoFocus
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full text-center text-2xl font-bold font-poppins border-b-2 border-slate-300 focus:border-slate-800 outline-none pb-2 bg-transparent text-slate-900"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] font-black text-[var(--color-brand)] uppercase tracking-[0.2em]">Service Event</div>
                <h1 className="text-3xl md:text-4xl font-extrabold font-poppins text-slate-900 leading-normal">
                  {item.label}
                </h1>
              </div>
            )}

            <div className="text-slate-400 text-xs font-medium italic mt-8 select-none">
              ← Swipe screen to navigate setlist →
            </div>
          </div>
        ) : (
          /* Note View */
          <div className="w-full bg-white border border-slate-200/80 rounded-2xl shadow-xl p-8 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Note Title</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full text-lg font-bold font-poppins border border-slate-200 rounded-lg px-3 py-2 focus:border-slate-400 outline-none text-slate-900 bg-[#FAFAFA]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Note Body</label>
                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full font-lora border border-slate-200 rounded-lg px-3 py-2 focus:border-slate-400 outline-none text-slate-700 bg-[#FAFAFA] text-base leading-relaxed"
                    placeholder="Enter instructions, cues, or announcements..."
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Service Note</div>
                    <h1 className="text-xl font-bold font-poppins text-slate-800">{item.label}</h1>
                  </div>
                </div>

                <div className="font-lora text-slate-600 text-lg leading-relaxed whitespace-pre-wrap min-h-24">
                  {item.content || <span className="italic text-slate-400 text-sm">No instructions entered. Click Edit to write.</span>}
                </div>

                <div className="text-slate-400 text-[10px] text-center font-bold tracking-widest pt-4 border-t border-slate-100 uppercase select-none">
                  ← Swipe screen to navigate setlist →
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
