import { supabase } from '../lib/supabaseClient';
import {
  getDeviceIdentity,
  signDeviceChallenge
} from '../security/DeviceIdentity';

export type AdminSession = {
  token: string;
  expiresAt: string;
  deviceId: string;
};

type ChallengeResponse = {
  challenge_id: string;
  challenge: string;
  expires_at: string;
};

type VerifyResponse = {
  authenticated: boolean;
  session_token?: string;
  expires_at?: string;
};

let activeSession: AdminSession | null = null;

export async function authenticateDevice(): Promise<AdminSession | null> {
  const identity = await getDeviceIdentity();
  if (!identity) return null;

  const { data: challenge, error: challengeError } = await supabase.functions.invoke<ChallengeResponse>(
    'admin-challenge',
    { body: { device_id: identity.deviceId } }
  );
  if (challengeError || !challenge) return null;

  const signatureBuffer = await signDeviceChallenge(challenge.challenge);
  const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));
  const { data: verification, error: verifyError } = await supabase.functions.invoke<VerifyResponse>(
    'admin-verify',
    {
      body: {
        device_id: identity.deviceId,
        challenge_id: challenge.challenge_id,
        challenge: challenge.challenge,
        signature
      }
    }
  );

  if (verifyError || !verification?.authenticated || !verification.session_token || !verification.expires_at) {
    activeSession = null;
    return null;
  }

  activeSession = {
    token: verification.session_token,
    expiresAt: verification.expires_at,
    deviceId: identity.deviceId
  };
  return activeSession;
}

export function getAdminSession(): AdminSession | null {
  if (!activeSession || Date.parse(activeSession.expiresAt) <= Date.now()) {
    activeSession = null;
    return null;
  }
  return activeSession;
}

const ADMIN_CODE_STORAGE_KEY = 'worship-admin-code';

export function getAdminPasscode(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ADMIN_CODE_STORAGE_KEY);
}

export function setAdminPasscode(code: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ADMIN_CODE_STORAGE_KEY, code);
}

export function clearAdminPasscode(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ADMIN_CODE_STORAGE_KEY);
}

export async function getEffectiveAdminToken(): Promise<string | null> {
  // 1. Passcode
  const code = getAdminPasscode();
  if (code && code.toLowerCase() === 'bantle') return code;

  // 2. Supabase Auth session
  const { data: { session: authSession } } = await supabase.auth.getSession();
  if (authSession?.access_token) return authSession.access_token;

  // 3. Device session
  return getAdminSession()?.token || null;
}

export function clearAdminSession(): void {
  activeSession = null;
  clearAdminPasscode();
}

export async function updateAdminSong(songId: number, updates: Record<string, unknown>): Promise<void> {
  const token = await getEffectiveAdminToken();
  if (!token) throw new Error('Admin session expired. Please sign in again.');

  const { error } = await supabase.functions.invoke('admin-song-update', {
    headers: { Authorization: `Bearer ${token}` },
    body: { song_id: songId, updates }
  });
  if (error) throw new Error(error.message);
}

export async function createAdminSong(songData: Record<string, unknown>): Promise<any> {
  const token = await getEffectiveAdminToken();
  if (!token) throw new Error('Admin session expired. Please sign in again.');

  const { data, error } = await supabase.functions.invoke('admin-song-update', {
    headers: { Authorization: `Bearer ${token}` },
    body: { action: 'create', song_data: songData }
  });
  if (error) throw new Error(error.message);
  return data?.data;
}
