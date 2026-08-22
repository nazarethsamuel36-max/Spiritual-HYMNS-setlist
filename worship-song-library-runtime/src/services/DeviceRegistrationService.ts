import { supabase } from '../lib/supabaseClient';
import {
  ensureDeviceIdentity,
  exportDevicePublicKey
} from '../security/DeviceIdentity';
import { getAdminSession } from './DeviceAuthService';

export type EnrollmentLink = {
  token: string;
  requestId: string;
  expiresAt: string;
};

export type TrustedDevice = {
  id: string;
  device_name: string;
  registered_at: string;
  last_seen: string | null;
  revoked_at: string | null;
};

export type EnrollmentRequest = {
  id: string;
  device_name: string | null;
  expires_at: string;
  accepted_at: string | null;
};

export async function bootstrapMainDevice(deviceName: string, bootstrapSecret: string): Promise<void> {
  const identity = await ensureDeviceIdentity();
  const publicKey = await exportDevicePublicKey();
  const { data, error } = await supabase.functions.invoke<{ registered: boolean }>('admin-bootstrap', {
    body: {
      device_id: identity.deviceId,
      device_name: deviceName,
      public_key: publicKey,
      bootstrap_secret: bootstrapSecret
    }
  });
  if (error || !data?.registered) throw new Error(error?.message ?? 'Unable to bootstrap main device.');
}

function sessionHeaders(): Record<string, string> {
  const session = getAdminSession();
  if (!session) throw new Error('Admin session expired.');
  return { Authorization: `Bearer ${session.token}` };
}

export async function createEnrollmentLink(): Promise<EnrollmentLink> {
  const { data, error } = await supabase.functions.invoke<{ enrollment_token: string; request_id: string; expires_at: string }>('admin-enroll', {
    headers: sessionHeaders(),
    body: { action: 'create' }
  });
  if (error || !data) throw new Error(error?.message ?? 'Unable to create enrollment link.');
  return { token: data.enrollment_token, requestId: data.request_id, expiresAt: data.expires_at };
}

export async function listEnrollmentRequests(): Promise<EnrollmentRequest[]> {
  const { data, error } = await supabase.functions.invoke<{ requests: EnrollmentRequest[] }>('admin-enroll', {
    headers: sessionHeaders(),
    body: { action: 'pending' }
  });
  if (error || !data) throw new Error(error?.message ?? 'Unable to list enrollment requests.');
  return data.requests;
}

export async function acceptEnrollmentLink(token: string, deviceName: string): Promise<string> {
  const identity = await ensureDeviceIdentity();
  const publicKey = await exportDevicePublicKey();
  const { data, error } = await supabase.functions.invoke<{ accepted: boolean; request_id: string }>('admin-enroll', {
    body: {
      action: 'accept',
      token,
      device_id: identity.deviceId,
      device_name: deviceName,
      public_key: publicKey
    }
  });
  if (error || !data?.accepted) throw new Error(error?.message ?? 'Unable to accept enrollment link.');
  return data.request_id;
}

export async function approveEnrollment(requestId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-enroll', {
    headers: sessionHeaders(),
    body: { action: 'approve', request_id: requestId }
  });
  if (error) throw new Error(error.message);
}

export async function rejectEnrollment(requestId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-enroll', {
    headers: sessionHeaders(),
    body: { action: 'reject', request_id: requestId }
  });
  if (error) throw new Error(error.message);
}

export async function listTrustedDevices(): Promise<TrustedDevice[]> {
  const { data, error } = await supabase.functions.invoke<{ devices: TrustedDevice[] }>('admin-devices', {
    headers: sessionHeaders(),
    body: { action: 'list' }
  });
  if (error || !data) throw new Error(error?.message ?? 'Unable to list trusted devices.');
  return data.devices;
}

export async function revokeTrustedDevice(deviceId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-devices', {
    headers: sessionHeaders(),
    body: { action: 'revoke', device_id: deviceId }
  });
  if (error) throw new Error(error.message);
}
