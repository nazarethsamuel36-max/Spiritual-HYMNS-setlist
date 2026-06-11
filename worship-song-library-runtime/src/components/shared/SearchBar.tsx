interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative mx-1">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 rounded-lg border-none bg-slate-200/70 focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all text-sm font-medium text-slate-800 placeholder-slate-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
