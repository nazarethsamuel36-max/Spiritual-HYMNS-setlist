const PROPER_NOUNS = new Set([
  'god', "god's", 'lord', "lord's", 'jesus', "jesus'", 'christ', "christ's", 
  'father', 'king', 'savior', 'saviour', 'messiah', 
  'yahova', 'jehovah', 'jireh', 'nissi', 'shalom', 'rapha', 'yahweh', 'abba', 
  'immanuel', 'emmanuel', 'lamb', 'creator', 'redeemer', 'master', 
  'hallelujah', 'alleluia', 'amen', 'calvary', 'zion', 'israel', 'bible', 
  'i', "i'll", "i'm", "i've", "i'd"
]);

const CONTRACTIONS: Record<string, string> = {
  'ill': "I'll",
  'ive': "I've",
  'im': "I'm",
  'its': "It's",
  'hes': "He's",
  'shes': "She's",
  'theres': "There's",
  'whats': "What's",
  'cant': "Can't",
  'dont': "Don't",
  'wont': "Won't",
  'isnt': "Isn't",
  'arent': "Aren't",
  'wasnt': "Wasn't",
  'werent': "Weren't",
  'hasnt': "Hasn't",
  'havent': "Haven't",
  'hadnt': "Hadn't",
  'couldnt': "Couldn't",
  'wouldnt': "Wouldn't",
  'shouldnt': "Shouldn't",
  'youre': "You're",
  'theyre': "They're",
  'were': "We're",
  'youve': "You've",
  'weve': "We've",
  'youll': "You'll",
  'theyll': "They'll",
  'well': "We'll"
};

export function formatSongTitle(title: string): string {
  if (!title) return '';
  
  // 1. Strip leading and trailing asterisks, hyphens, underscores and extra whitespace
  let clean = normalizeImportedText(title)
    .replace(/^[\s\*\-\_]+/, '')
    .replace(/[\s\*\-\_]+$/, '')
    .trim();

  // 2. Check if text contains non-Latin scripts (Hindi/Devanagari, etc.)
  // If it does, skip formatting as it corrupts these scripts
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(clean)) {
    return clean;
  }

  // 3. Sentence Case formatting with Deity & Proper Noun Capitalization
  const words = clean.split(/\s+/);
  
  const formattedWords = words.map((word, idx) => {
    const cleanWord = word.replace(/[^a-zA-Z']/g, '');
    const lowerClean = cleanWord.toLowerCase();
    
    // Contractions fix (like "ill" -> "I'll")
    if (CONTRACTIONS[lowerClean] && idx !== 0) {
      return CONTRACTIONS[lowerClean];
    }
    
    // Check "Holy Spirit" / "Holy Ghost"
    if (lowerClean === 'holy' && idx < words.length - 1) {
      const nextWord = words[idx + 1].replace(/[^a-zA-Z']/g, '').toLowerCase();
      if (nextWord === 'spirit' || nextWord === 'ghost') {
        return 'Holy';
      }
    }
    if (lowerClean === 'spirit' || lowerClean === 'ghost') {
      if (idx > 0) {
        const prevWord = words[idx - 1].replace(/[^a-zA-Z']/g, '').toLowerCase();
        if (prevWord === 'holy' || prevWord === 'living' || prevWord === 'god' || prevWord === "god's") {
          return 'Spirit';
        }
      }
    }
    
    // First word is always capitalized
    if (idx === 0) {
      if (CONTRACTIONS[lowerClean]) {
        const fix = CONTRACTIONS[lowerClean];
        return fix.charAt(0).toUpperCase() + fix.slice(1);
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    // Proper nouns / Deity words / Pronoun I
    if (PROPER_NOUNS.has(lowerClean)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    // Divine pronouns "His" / "Him"
    if (lowerClean === 'his' || lowerClean === 'him') {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    
    // All other words lowercase
    return word.toLowerCase();
  });
  
  return formattedWords.join(' ');
}

export function normalizeImportedText(value: string | undefined): string {
  if (!value) return '';

  return value
    // Double UTF-8 encoding artifacts (mojibake)
    .replace(/aÌ‚â‚¬â„¢/g, "'")
    .replace(/aÌ‚â‚¬Å“/g, '"')
    .replace(/aÌ‚â‚¬Â/g, '"')
    // Single UTF-8 encoding artifacts
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€/g, "'")
    .replace(/â€/g, "'")
    .replace(/â€/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€”/g, '-')
    .replace(/â€“/g, '-')
    .replace(/â€"/g, '-')
    .replace(/â€–/g, '-')
    .replace(/â€¦/g, '...')
    // Smart quotes normalization
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2014\u2013]/g, '-')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export function capitalizeWord(word: string): string {
  if (!word) return '';
  // Check for internal capitals (e.g. "I've", "PWA")
  const rest = word.slice(1);
  if (rest !== rest.toLowerCase() && rest !== rest.toUpperCase()) {
    return word; // Preserve camelCase or mixed case
  }
  // Convert all-caps or all-lowercase to title capitalized word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function formatKey(key: string | undefined): string {
  if (!key) return 'C';
  return normalizeImportedText(key).replace(/[\s\*\-\_]+/g, '').trim();
}

const LANGUAGE_ALIASES: Record<string, string[]> = {
  english: ['english', 'eng', 'en'],
  hindi: ['hindi', 'hin', 'hi'],
  marathi: ['marathi', 'mar', 'mr'],
  konkani: ['konkani', 'kok', 'kn'],
};

export function toCanonicalLanguage(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = normalizeImportedText(value).toLowerCase();
  if (!normalized) return undefined;

  for (const [canonical, aliases] of Object.entries(LANGUAGE_ALIASES)) {
    if (aliases.includes(normalized)) {
      return canonical;
    }
  }

  return normalized;
}

export function songMatchesLanguageFilter(songLanguage: string | undefined, selectedLanguage: string): boolean {
  const filter = toCanonicalLanguage(selectedLanguage);
  if (!filter || filter === 'all') return true;

  const songLang = toCanonicalLanguage(songLanguage);
  return songLang === filter;
}

const LANGUAGE_ORDER = ['english', 'hindi', 'marathi', 'konkani'];

export function getLanguagePriority(lang: string | undefined): number {
  const canonical = toCanonicalLanguage(lang);
  if (!canonical) return 999;
  const idx = LANGUAGE_ORDER.indexOf(canonical);
  return idx === -1 ? 999 : idx;
}

