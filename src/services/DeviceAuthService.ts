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

export function clearAdminSession(): void {
  activeSession = null;
}

export async function updateAdminSong(songId: number, updates: Record<string, unknown>): Promise<void> {
  const session = getAdminSession();
  if (!session) throw new Error('Admin session expired.');

  const { error } = await supabase.functions.invoke('admin-song-update', {
    headers: { Authorization: `Bearer ${session.token}` },
    body: { song_id: songId, updates }
  });
  if (error) throw new Error(error.message);
}
