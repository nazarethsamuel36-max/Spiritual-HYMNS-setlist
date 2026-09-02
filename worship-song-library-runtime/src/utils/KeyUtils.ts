export const KEY_ROOT_OPTIONS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type KeyQuality = 'major' | 'minor';

export function parseKeyDisplay(value?: string): { root: string; quality: KeyQuality } {
  const normalized = (value ?? 'C').replace(/\s+/g, '').trim();
  if (!normalized) {
    return { root: 'C', quality: 'major' };
  }

  const match = normalized.match(/^([A-G](?:[#b])?)(m?)$/i);
  if (match) {
    const root = match[1] || 'C';
    const quality = match[2]?.toLowerCase() === 'm' ? 'minor' : 'major';
    return { root, quality };
  }

  const hasMinor = /m$/i.test(normalized);
  const root = hasMinor ? normalized.slice(0, -1) : normalized;
  return {
    root: root || 'C',
    quality: hasMinor ? 'minor' : 'major',
  };
}

export function formatKeyDisplay(root: string, quality: KeyQuality): string {
  const cleanRoot = (root || 'C').replace(/\s+/g, '').trim();
  return quality === 'minor' ? `${cleanRoot}m` : cleanRoot;
}
