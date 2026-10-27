const PROPER_NOUNS = new Set([
  'god', "god's", 'lord', "lord's", 'jesus', "jesus'", 'christ', "christ's", 
  'father', 'savior', 'saviour', 'messiah', 
  'yahova', 'jehovah', 'jireh', 'nissi', 'shalom', 'rapha', 'yahweh', 'abba', 
  'immanuel', 'emmanuel', 'creator', 'redeemer', 'master', 
  'hallelujah', 'alleluia', 'amen', 'calvary', 'zion', 'israel', 'bible', 
  'i', "i'll", "i'm", "i've", "i'd"
]);

const CONTRACTIONS: Record<string, string> = {
  'ill': "I'll", "i'll": "I'll",
  'ive': "I've", "i've": "I've",
  'im': "I'm", "i'm": "I'm",
  'id': "I'd", "i'd": "I'd",
  'its': "It's", "it's": "It's",
  'hes': "He's", "he's": "He's",
  'shes': "She's", "she's": "She's",
  'theres': "There's", "there's": "There's",
  'whats': "What's", "what's": "What's",
  'cant': "Can't", "can't": "Can't",
  'dont': "Don't", "don't": "Don't",
  'wont': "Won't", "won't": "Won't",
  'isnt': "Isn't", "isn't": "Isn't",
  'arent': "Aren't", "aren't": "Aren't",
  'wasnt': "Wasn't", "wasn't": "Wasn't",
  'werent': "Weren't", "weren't": "Weren't",
  'hasnt': "Hasn't", "hasn't": "Hasn't",
  'havent': "Haven't", "haven't": "Haven't",
  'hadnt': "Hadn't", "hadn't": "Hadn't",
  'couldnt': "Couldn't", "couldn't": "Couldn't",
  'wouldnt': "Wouldn't", "wouldn't": "Wouldn't",
  'shouldnt': "Shouldn't", "shouldn't": "Shouldn't",
  'youre': "You're", "you're": "You're",
  'theyre': "They're", "they're": "They're",
  'were': "We're", "we're": "We're",
  'youve': "You've", "you've": "You've",
  'weve': "We've", "we've": "We've",
  'youll': "You'll", "you'll": "You'll",
  'theyll': "They'll", "they'll": "They'll",
  'well': "We'll", "we'll": "We'll"
};

function capitalizeSingleWord(word: string): string {
  const clean = word.replace(/[^a-zA-Z']/g, '');
  const lower = clean.toLowerCase();
  if (CONTRACTIONS[lower]) {
    return word.replace(clean, CONTRACTIONS[lower]);
  }
  if (/^i'[a-z]+$/i.test(clean)) {
    const fixed = "I'" + clean.slice(2).toLowerCase();
    return word.replace(clean, fixed);
  }
  return word.replace(/[a-zA-Z]+/g, (m) => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase());
}

export function formatSongTitle(title: string): string {
  if (!title) return '';
  
  // 1. Strip leading and trailing asterisks, hyphens, underscores and extra whitespace
  let clean = normalizeImportedText(title)
    .replace(/^[\s\*\-\_]+/, '')
    .replace(/[\s\*\-\_]+$/, '')
    .trim();

  // 2. Check if text contains non-Latin scripts (Hindi/Devanagari, etc.)
  // If it does, skip formatting as it corrupts these scripts, unless it contains an English bracket
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(clean)) {
    if (/\([A-Za-z\s,']+\)/.test(clean)) {
      return clean.replace(/\(([^)]+)\)/, (_, inside) => `(${formatSongTitle(inside)})`);
    }
    return clean;
  }

  // 3. Sentence Case formatting with Deity & Proper Noun Capitalization
  const words = clean.split(/\s+/);
  
  const formattedWords = words.map((word, idx) => {
    const cleanWord = word.replace(/[^a-zA-Z']/g, '');
    const lowerClean = cleanWord.toLowerCase();
    
    // Contractions fix (like "ill" -> "I'll", "don't" -> "Don't")
    if (CONTRACTIONS[lowerClean]) {
      if (idx === 0 || lowerClean.startsWith("i'")) {
        return word.replace(cleanWord, CONTRACTIONS[lowerClean]);
      }
      return word.replace(cleanWord, CONTRACTIONS[lowerClean].toLowerCase());
    }
    
    // Check "Holy Spirit" / "Holy Ghost" / "Holy One"
    if (lowerClean === 'holy' && idx < words.length - 1) {
      const nextWord = words[idx + 1].replace(/[^a-zA-Z']/g, '').toLowerCase();
      if (nextWord === 'spirit' || nextWord === 'ghost' || nextWord === 'one') {
        return 'Holy';
      }
    }
    if (lowerClean === 'spirit' || lowerClean === 'ghost') {
      if (idx > 0) {
        const prevWord = words[idx - 1].replace(/[^a-zA-Z']/g, '').toLowerCase();
        if (prevWord === 'holy' || prevWord === 'living' || prevWord === 'god' || prevWord === "god's") {
          return capitalizeSingleWord(word);
        }
      }
    }
    if (lowerClean === 'one' && idx > 0) {
      const prevWord = words[idx - 1].replace(/[^a-zA-Z']/g, '').toLowerCase();
      if (prevWord === 'holy') {
        return capitalizeSingleWord(word);
      }
    }
    
    // First word is always capitalized (only first letter)
    if (idx === 0) {
      return capitalizeSingleWord(word);
    }

    // Special reverent exclamations like "O" or "Oh"
    if (lowerClean === 'o' || lowerClean === 'oh') {
      return capitalizeSingleWord(word);
    }
    
    // Proper nouns / Deity words / Pronoun I
    if (PROPER_NOUNS.has(lowerClean)) {
      return capitalizeSingleWord(word);
    }
    
    // Divine pronouns "His" / "Him" / "Thou" / "Thee" / "Thy"
    if (lowerClean === 'his' || lowerClean === 'him' || lowerClean === 'thou' || lowerClean === 'thee' || lowerClean === 'thy') {
      return capitalizeSingleWord(word);
    }

    // Disambiguation labels like "(Song 346)"
    if (lowerClean === 'song' && idx < words.length - 1 && /^\(?\d+\)?$/.test(words[idx + 1])) {
      return capitalizeSingleWord(word);
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
    .replace(/â€ /g, '"')
    .replace(/â€˜/g, "'")
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€ /g, '"')
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
  const rest = word.slice(1);
  if (rest !== rest.toLowerCase() && rest !== rest.toUpperCase()) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function songMatchesLanguageFilter(
  songLanguage: string | undefined,
  filterLanguage: string
): boolean {
  if (!filterLanguage || filterLanguage === 'All') return true;
  if (!songLanguage) return false;
  return songLanguage.toLowerCase().trim() === filterLanguage.toLowerCase().trim();
}

export function getLanguagePriority(lang: string | undefined): number {
  if (!lang) return 99;
  const l = lang.toLowerCase();
  if (l === 'marathi') return 1;
  if (l === 'hindi') return 2;
  if (l === 'english') return 3;
  if (l === 'konkani') return 4;
  return 5;
}

export function formatKey(key: string | undefined): string {
  if (!key) return '-';
  const clean = key.trim();
  if (clean === '-' || clean === 'N/A' || clean === 'NA') return '-';
  return clean;
}
