interface LanguageTabsProps {
  languages: string[];
  selected: string;
  onSelect: (lang: string) => void;
}

export function LanguageTabs({ languages, selected, onSelect }: LanguageTabsProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-0.5">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-tight transition-all duration-150 flex-shrink-0 ${
            selected === lang
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
