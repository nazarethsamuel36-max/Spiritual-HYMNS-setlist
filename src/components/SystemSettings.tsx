import { UserDataPackageService } from '../services/UserDataPackage';
import { isIOS } from '../utils/platform';
import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'app-theme-mode';

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' ? 'dark' : 'light';
}

interface FaqItem {
  q: string;
  a: string;
  ios?: boolean;
}

const ALL_FAQS: FaqItem[] = [
  {
    q: 'How do I create a Personal Song?',
    a: 'Go to Personal → +, enter the song information and content, then save it.',
    ios: false,
  },
  {
    q: 'What is the difference between a Personal Song and a Version?',
    a: 'A Personal Song is a song you create yourself. A Version is your customized version of an existing song from the main library.',
    ios: false,
  },
  {
    q: 'How do I create and use a Setlist?',
    a: 'Open Setlists, create a setlist, and add the songs you want. You can then open the setlist to navigate through its songs.',
    ios: true,
  },
  {
    q: 'How do I back up or transfer my songs and setlists?',
    a: 'Go to Settings → Data Backup → Export My Data. This downloads a JSON file named \'worship-userdata-YYYY-MM-DD.json\' (e.g. \'worship-userdata-2026-08-18.json\'). On another device, go to Settings → Data Backup → Import Backup and select that same file to restore your data.',
    ios: false,
  },
];

export function SystemSettings({ onClose }: { onClose: () => void }) {
  const isApple = isIOS();
  const faqs = ALL_FAQS.filter((faq) => !isApple || faq.ios);

  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [isExporting, setIsExporting] = useState(false);
  const [showDataBackup, setShowDataBackup] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);
  const [showImportSuccess, setShowImportSuccess] = useState(false);

  // Light/dark mode
  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const pkg = await UserDataPackageService.build();
      const json = JSON.stringify(pkg, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `worship-userdata-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('❌ Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (file: File) => {
    setIsImporting(true);
    setImportReport(null);
    try {
      const text = await file.text();
      const pkg = JSON.parse(text);
      const report = await UserDataPackageService.import(pkg);
      const fmt = (r: { imported: number; skipped: number }) => `${r.imported} new / ${r.skipped} skipped`;
      setImportReport(
        `Imported from "${file.name}":\n` +
        `· Personal songs: ${fmt(report.personalSongs)}\n` +
        `· Shared songs: ${fmt(report.sharedSongs)}\n` +
        `· Personal versions: ${fmt(report.personalVersions)}\n` +
        `· Shared versions: ${fmt(report.sharedVersions)}\n` +
        `· Setlists: ${fmt(report.personalSetlists)}\n` +
        `· Shared setlists: ${fmt(report.sharedSetlists)}`
      );
      setShowImportSuccess(true);
    } catch (err) {
      console.error('❌ Import failed:', err);
      setImportReport(`Import failed: ${err instanceof Error ? err.message : 'invalid backup file'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-sm z-[200] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 pointer-events-auto flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800">System Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            {/* Data Backup (Android / Desktop only) */}
            {!isApple && (
              <div className="bg-[var(--color-surface)] border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDataBackup((prev) => !prev)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm font-bold text-slate-700">Data Backup</span>
                  <span className="text-slate-400">{showDataBackup ? '▾' : '▸'}</span>
                </button>
                {showDataBackup && (
                  <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                    <button
                      type="button"
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-left">
                        <div className="font-bold text-slate-700 group-hover:text-blue-600">
                          {isExporting ? 'Exporting...' : 'Export My Data'}
                        </div>
                        <div className="text-xs text-slate-400">
                          Download a backup of personal songs, versions, and setlists
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => document.getElementById('udp-import-input')?.click()}
                      disabled={isImporting}
                      className="w-full flex items-center justify-between p-4 bg-[var(--color-surface)] border border-slate-200 rounded-2xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-left">
                        <div className="font-bold text-slate-700 group-hover:text-emerald-600">
                          {isImporting ? 'Importing...' : 'Import Backup'}
                        </div>
                        <div className="text-xs text-slate-400">
                          Restore from a backup file (existing data is never overwritten)
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <input
                      id="udp-import-input"
                      type="file"
                      accept="application/json,.json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleImportFile(file);
                        e.target.value = '';
                      }}
                    />
                    {importReport && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700 whitespace-pre-line font-medium">
                        {importReport}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      The backup file can be imported on another device. Shared songs and setlists are included and
                      remain shared.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Appearance — Light / Dark */}
            <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-slate-200">
              <div className="mb-1 text-sm font-bold text-slate-700">Appearance</div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${theme === 'light' ? 'bg-slate-900 text-[var(--color-on-inverse)] border-slate-900 shadow-sm' : 'bg-[var(--color-surface)] text-slate-600 border-slate-300'}`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${theme === 'dark' ? 'bg-slate-900 text-[var(--color-on-inverse)] border-slate-900 shadow-sm' : 'bg-[var(--color-surface)] text-slate-600 border-slate-300'}`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-[var(--color-surface)] border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
                <span className="text-sm font-bold text-slate-700">FAQs</span>
              </div>
              <div className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
                {faqs.map((faq, i) => (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-700">{faq.q}</span>
                      <span className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="px-4 pb-4 -mt-1">
                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAbout((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                aria-expanded={showAbout}
              >
                <span className="text-sm font-bold text-slate-700">About</span>
                <span className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${showAbout ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {showAbout && (
                <div className="border-t border-slate-100 px-4 py-4 text-xs leading-relaxed text-slate-500">
                  <h3 className="text-sm font-bold text-slate-800">BBF Song Book</h3>
                  <p className="mt-1">
                    A digital version of <span className="font-semibold text-slate-700">Hymns and Spiritual Songs</span>, created for our church community to make it easier to find, read, organize, and use the songs.
                  </p>
                  <h4 className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Feedback?</h4>
                  <p className="mt-1">
                    Have a suggestion, found an issue, or have feedback? Email us at{' '}
                    <a href="mailto:samyiis919gmail.com" className="font-semibold text-slate-700 underline underline-offset-2">
                      samyiis919gmail.com
                    </a>
                  </p>
                  <h4 className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Note</h4>
                  <p className="mt-1">Chords are being added gradually, so some songs may not have chord information available yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Success Modal Popup for Data Import */}
      {showImportSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-[var(--color-surface)] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 flex-shrink-0">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Imported Successfully!</h3>
            <div className="text-xs text-slate-600 text-left bg-slate-50 rounded-xl p-4 border border-slate-100 font-medium whitespace-pre-line leading-relaxed mb-5 w-full">
              {importReport}
            </div>
            <button
              type="button"
              onClick={() => {
                setShowImportSuccess(false);
                setImportReport(null);
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
