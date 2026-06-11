interface LanguageTabsProps {
  languages: string[];
  selected: string;
  onSelect: (lang: string) => void;
}

export function LanguageTabs({ languages, selected, onSelect }: LanguageTabsProps) {
  return (
    <div className="flex space-x-1.5 mt-2 overflow-x-auto hide-scrollbar px-1 pb-1">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-tight transition-all duration-150 flex-shrink-0 ${
            selected === lang
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
