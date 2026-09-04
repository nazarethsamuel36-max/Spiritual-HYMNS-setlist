export const GENRES = [
  'Worship',
  'Praise',
  'Gospel',
  'Trust',
  'Surrender',
  'Second Coming',
  'Holy Spirit',
  'Thanksgiving',
  'Adoration',
  'Victory',
  'Prayer',
  'Repentance',
  'Wedding',
  'Funeral',
  'Healing',
  'Revival',
  'Unity',
  'Lord Supper',
  'Peace',
  'Children',
  'Blessing',
  'Other',
] as const;

export const LANGUAGES = ['All', 'English', 'Hindi', 'Marathi', 'Konkani', 'Bengali', 'Other'];

export type Genre = (typeof GENRES)[number];

const aliases: Record<string, Genre> = {
  'holy spirit': 'Holy Spirit',
  'lord supper': 'Lord Supper',
  communion: 'Lord Supper',
  'second coming': 'Second Coming',
};

export function normalizeGenre(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!normalized) return undefined;
  return aliases[normalized] || GENRES.find((genre) => genre.toLowerCase() === normalized);
}

export function normalizeGenres(values: string[] | undefined): string[] {
  return [...new Set((values || []).map(normalizeGenre).filter((genre): genre is string => Boolean(genre)))];
}