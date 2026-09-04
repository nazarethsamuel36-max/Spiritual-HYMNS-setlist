import { db, type DeviceIdentityRecord } from '../db/Database';
import { generateUUID } from '../utils/uuid';

const KEY_ALGORITHM = {
  name: 'ECDSA',
  namedCurve: 'P-256'
} as const;

const SIGN_ALGORITHM = {
  name: 'ECDSA',
  hash: 'SHA-256'
} as const;

function requireWebCrypto(): SubtleCrypto {
  if (!globalThis.isSecureContext || !globalThis.crypto?.subtle) {
    throw new Error('Device identity requires a secure context with Web Crypto support.');
  }

  return globalThis.crypto.subtle;
}

function toChallengeBytes(challenge: string | ArrayBuffer): ArrayBuffer {
  let bytes: Uint8Array;

  if (typeof challenge === 'string') {
    bytes = new TextEncoder().encode(challenge);
  } else {
    bytes = new Uint8Array(challenge);
  }

  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

async function createIdentity(): Promise<DeviceIdentityRecord> {
  const subtle = requireWebCrypto();
  const keyPair = await subtle.generateKey(KEY_ALGORITHM, false, ['sign', 'verify']) as CryptoKeyPair;

  const identity: DeviceIdentityRecord = {
    id: 'current',
    deviceId: generateUUID(),
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    createdAt: Date.now()
  };

  await db.deviceIdentity.put(identity);
  return identity;
}

export async function getDeviceIdentity(): Promise<DeviceIdentityRecord | null> {
  requireWebCrypto();
  return (await db.deviceIdentity.get('current')) ?? null;
}

export async function ensureDeviceIdentity(): Promise<DeviceIdentityRecord> {
  const existingIdentity = await getDeviceIdentity();
  return existingIdentity ?? createIdentity();
}

export async function hasLocalDeviceIdentity(): Promise<boolean> {
  return (await getDeviceIdentity()) !== null;
}

export async function exportDevicePublicKey(): Promise<JsonWebKey> {
  const subtle = requireWebCrypto();
  const identity = await getDeviceIdentity();

  if (!identity) {
    throw new Error('No local device identity exists.');
  }

  return subtle.exportKey('jwk', identity.publicKey);
}

export async function signDeviceChallenge(challenge: string | ArrayBuffer): Promise<ArrayBuffer> {
  const subtle = requireWebCrypto();
  const identity = await getDeviceIdentity();

  if (!identity) {
    throw new Error('No local device identity exists.');
  }

  return subtle.sign(SIGN_ALGORITHM, identity.privateKey, toChallengeBytes(challenge));
}