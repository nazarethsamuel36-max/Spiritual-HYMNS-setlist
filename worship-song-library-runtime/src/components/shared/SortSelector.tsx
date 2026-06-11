interface SortSelectorProps {
  value: 'number' | 'title';
  onChange: (value: 'number' | 'title') => void;
}

export function SortSelector({ value, onChange }: SortSelectorProps) {
  return (
    <div className="mx-1 mt-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mr-2">
        Sort:
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'number' | 'title')}
        className="text-sm font-medium text-slate-700 bg-slate-200/70 border-none rounded-md px-2 py-1 pr-6 focus:ring-1 focus:ring-slate-300 cursor-pointer"
      >
        <option value="number">Number</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
}
