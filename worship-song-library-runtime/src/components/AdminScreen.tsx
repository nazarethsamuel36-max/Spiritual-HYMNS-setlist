import { useCallback, useEffect, useState } from 'react';
import {
  acceptEnrollmentLink,
  approveEnrollment,
  bootstrapMainDevice,
  createEnrollmentLink,
  listEnrollmentRequests,
  listTrustedDevices,
  rejectEnrollment,
  revokeTrustedDevice,
  type EnrollmentRequest,
  type TrustedDevice
} from '../services/DeviceRegistrationService';

type AdminScreenProps = {
  authenticated: boolean;
  onClose: () => void;
  onExit: () => void;
  onBootstrapped: () => Promise<void>;
};

export function AdminScreen({ authenticated, onClose, onExit, onBootstrapped }: AdminScreenProps) {
  const [deviceName, setDeviceName] = useState('My phone');
  const [bootstrapSecret, setBootstrapSecret] = useState('');
  const [enrollmentToken, setEnrollmentToken] = useState(() => new URLSearchParams(window.location.search).get('admin_enroll') ?? '');
  const [devices, setDevices] = useState<TrustedDevice[]>([]);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [link, setLink] = useState(() => window.localStorage.getItem('latest-admin-enrollment-link') ?? '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement('textarea');
    input.value = value;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.focus();
    input.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(input);
    if (!copied) {
      window.prompt('Copy this enrollment link:', value);
    }
  };

  const shareLink = async (value: string) => {
    if (navigator.share) {
      await navigator.share({ title: 'BBF Song book device enrollment', url: value });
      return;
    }
    await copyText(value);
  };

  const refresh = useCallback(async () => {
    if (!authenticated) return;
    const [nextDevices, nextRequests] = await Promise.all([listTrustedDevices(), listEnrollmentRequests()]);
    setDevices(nextDevices);
    setRequests(nextRequests);
  }, [authenticated]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Unable to load admin data.'));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setError('');
    setStatus('');
    try {
      await action();
      setStatus(success);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The operation failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">BBF Song book</p><h1 className="mt-2 text-3xl font-black tracking-tight">Admin access</h1><p className="mt-2 text-sm text-slate-400">Manage trusted phones without changing the song library.</p></div>
          <div className="flex gap-2"><button type="button" onClick={onClose} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800">Back</button>{authenticated && <button type="button" onClick={onExit} className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-200 hover:bg-rose-950">Sign out</button>}</div>
        </div>
        {status && <div className="mb-4 rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200">{status}</div>}
        {error && <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}

        {!authenticated && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <h2 className="text-xl font-bold">Set up this phone</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">Use the one-time bootstrap secret configured in Supabase. This works only while no admin device exists.</p>
            <label className="mt-5 block text-sm font-semibold text-slate-300">Device name<input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-300" /></label>
            <label className="mt-4 block text-sm font-semibold text-slate-300">Bootstrap secret<input type="password" value={bootstrapSecret} onChange={(event) => setBootstrapSecret(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-300" /></label>
            <button type="button" disabled={busy || !deviceName.trim() || !bootstrapSecret} onClick={() => run(async () => { await bootstrapMainDevice(deviceName, bootstrapSecret); await onBootstrapped(); }, 'This phone is now the first admin device.')} className="mt-5 w-full rounded-lg bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Create first admin device</button>
          </section>
        )}

        {authenticated && (
          <div className="grid gap-5 md:grid-cols-2">
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><h2 className="text-xl font-bold">Add another phone</h2><p className="mt-2 text-sm leading-6 text-slate-400">Create a short-lived link and open it on the phone you want to trust.</p><button type="button" disabled={busy} onClick={() => run(async () => { const created = await createEnrollmentLink(); const url = `${window.location.origin}/?admin_enroll=${encodeURIComponent(created.token)}`; setLink(url); window.localStorage.setItem('latest-admin-enrollment-link', url); try { await copyText(url); } catch { setStatus('Link created. Use Copy link, Share link, or press and hold the link.'); } }, 'Enrollment link created. It expires in 10 minutes.')} className="mt-5 w-full rounded-lg bg-cyan-300 px-4 py-3 font-bold text-slate-950 disabled:opacity-40">Create enrollment link</button>{link && <div className="mt-4 rounded-lg border border-cyan-300/40 bg-cyan-300/10 p-3"><p className="text-xs font-bold uppercase tracking-wider text-cyan-200">Enrollment link</p><textarea readOnly rows={4} value={link} onFocus={(event) => event.currentTarget.select()} className="mt-2 w-full resize-none rounded-md border border-slate-700 bg-slate-950 p-3 text-xs leading-5 text-slate-100 outline-none focus:border-cyan-300" aria-label="Enrollment link to copy" /><div className="mt-2 grid grid-cols-2 gap-2"><button type="button" disabled={busy} onClick={() => run(async () => { await copyText(link); }, 'Enrollment link copied.')} className="rounded-lg border border-cyan-300 px-4 py-2 text-sm font-bold text-cyan-200 disabled:opacity-40">Copy link</button><button type="button" disabled={busy} onClick={() => run(async () => { await shareLink(link); }, 'Enrollment link shared.')} className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-bold text-slate-200 disabled:opacity-40">Share link</button></div></div>}</section>
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl"><h2 className="text-xl font-bold">Accept an enrollment</h2><p className="mt-2 text-sm leading-6 text-slate-400">Use this on a new phone after opening its enrollment link.</p><input value={enrollmentToken} onChange={(event) => setEnrollmentToken(event.target.value)} placeholder="Enrollment token" className="mt-5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-300" /><input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} placeholder="Device name" className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-300" /><button type="button" disabled={busy || !enrollmentToken.trim()} onClick={() => run(async () => { await acceptEnrollmentLink(enrollmentToken.trim(), deviceName); }, 'Enrollment accepted. Ask the existing admin phone to approve it.')} className="mt-3 w-full rounded-lg border border-cyan-300 px-4 py-3 font-bold text-cyan-200 disabled:opacity-40">Accept enrollment</button></section>
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl md:col-span-2"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Pending requests</h2><button type="button" disabled={busy} onClick={() => run(refresh, 'Admin data refreshed.')} className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40">Refresh</button></div><div className="mt-4 space-y-3">{requests.length === 0 && <p className="text-sm text-slate-500">No pending requests.</p>}{requests.map((request) => <div key={request.id} className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{request.device_name || 'Unnamed device'}</p><p className="text-xs text-slate-500">{request.id}</p></div><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => run(async () => { await approveEnrollment(request.id); await refresh(); }, 'Device approved.')} className="rounded-md bg-emerald-300 px-3 py-2 text-sm font-bold text-slate-950">Approve</button><button type="button" disabled={busy} onClick={() => run(async () => { await rejectEnrollment(request.id); await refresh(); }, 'Request rejected.')} className="rounded-md border border-rose-300 px-3 py-2 text-sm font-bold text-rose-200">Reject</button></div></div>)}</div></section>
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-xl md:col-span-2"><h2 className="text-xl font-bold">Trusted devices</h2><div className="mt-4 space-y-3">{devices.map((device) => <div key={device.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950 p-3"><div><p className="font-semibold">{device.device_name}</p><p className="text-xs text-slate-500">{device.revoked_at ? 'Revoked' : 'Active'}</p></div><button type="button" disabled={busy || Boolean(device.revoked_at)} onClick={() => run(async () => { await revokeTrustedDevice(device.id); await refresh(); }, 'Device revoked.')} className="rounded-md border border-rose-300 px-3 py-2 text-sm font-bold text-rose-200 disabled:opacity-40">Revoke</button></div>)}</div></section>
          </div>
        )}
      </div>
    </main>
  );
}