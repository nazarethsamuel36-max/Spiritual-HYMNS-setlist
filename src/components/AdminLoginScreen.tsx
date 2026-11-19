import React, { useState } from 'react';
import { setAdminPasscode } from '../services/DeviceAuthService';

interface AdminLoginScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminLoginScreen({ onSuccess, onCancel }: AdminLoginScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = passcode.trim().toLowerCase();

    if (!cleanCode) {
      setError('Please enter the admin passcode.');
      return;
    }

    if (cleanCode === 'bantle') {
      setAdminPasscode('bantle');
      onSuccess();
    } else {
      setError('Incorrect passcode. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[var(--color-surface,white)] p-6 shadow-2xl border border-slate-200">
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/bbf-logo-transparent.png"
            alt="BBF Logo"
            className="w-16 h-16 object-contain mb-3 drop-shadow-sm"
          />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Admin Access</h2>
          <p className="text-xs text-slate-500 mt-1">Enter passcode to manage and edit songs</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-700 flex items-start gap-2 animate-in fade-in">
            <span className="text-sm">⚠️</span>
            <span className="flex-1">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Passcode
            </label>
            <input
              type="text"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter passcode..."
              required
              className="w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 text-center text-base tracking-widest font-semibold text-slate-800 placeholder-slate-400 placeholder:tracking-normal placeholder:font-normal focus:bg-white focus:border-[var(--color-brand,#0284c7)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand,#0284c7)]/20 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--color-brand,#0284c7)] py-2.5 px-4 text-sm font-bold text-white shadow-md hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2"
          >
            Unlock Admin
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Return to Songbook
          </button>
        </div>
      </div>
    </div>
  );
}
