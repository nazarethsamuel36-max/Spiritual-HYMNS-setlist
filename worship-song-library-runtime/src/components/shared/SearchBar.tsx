import { useState, useRef, useEffect } from 'react';
import { SearchEngine } from '../../utils/SearchEngine';

interface SearchBarProps {
  placeholder?: string;
  onSearchResults?: (results: any[]) => void;
  onOverlayVisibilityChange?: (isVisible: boolean) => void;
  songs?: any[];
  autoFocus?: boolean;
  value?: string;
  onChange?: (val: string) => void;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearchResults,
  onOverlayVisibilityChange,
  songs = [],
  autoFocus = false,
  value: controlledValue,
  onChange: controlledOnChange
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  
  const inputRef = useRef<HTMLInputElement>(null);
  const renderCount = useRef(0);
  renderCount.current++;

  console.log(`[PERF] SearchBar render #${renderCount.current}`);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (newValue: string) => {
    const startTime = performance.now();
    console.log(`[PERF] SearchBar handleChange start: "${newValue}"`);
    
    if (controlledOnChange) {
      controlledOnChange(newValue);
    } else {
      setInternalValue(newValue);
    }
    
    if (onOverlayVisibilityChange) {
      onOverlayVisibilityChange(newValue.trim().length > 0);
    }
    
    if (onSearchResults && songs.length > 0) {
      if (newValue.trim()) {
        const searchStart = performance.now();
        const results = SearchEngine.searchWithLimit(songs, newValue, 100);
        const searchEnd = performance.now();
        console.log(`[PERF] SearchEngine.searchWithLimit took ${(searchEnd - searchStart).toFixed(2)}ms`);
        onSearchResults(results);
      } else {
        onSearchResults([]);
      }
    }
    
    const endTime = performance.now();
    console.log(`[PERF] SearchBar handleChange total took ${(endTime - startTime).toFixed(2)}ms`);
  };

  const handleClear = () => {
    if (controlledOnChange) {
      controlledOnChange('');
    } else {
      setInternalValue('');
    }
    if (onOverlayVisibilityChange) {
      onOverlayVisibilityChange(false);
    }
    if (onSearchResults) {
      onSearchResults([]);
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id="song-search-input"
        type="text"
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 rounded-2xl border-none bg-slate-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all text-[15px] font-medium text-slate-800 placeholder-slate-400"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
      />
      <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-300 text-slate-500 hover:bg-slate-400 transition-colors"
          aria-label="Clear search"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
