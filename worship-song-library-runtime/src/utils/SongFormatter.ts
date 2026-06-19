export function formatSongTitle(title: string): string {
  if (!title) return '';
  
  // 1. Strip leading and trailing asterisks, hyphens, underscores and extra whitespace
  let clean = title
    .replace(/^[\s\*\-\_]+/, '')
    .replace(/[\s\*\-\_]+$/, '')
    .trim();

  // 2. Convert to Title Case
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'from', 'by', 'of', 'in', 'with']);
  
  const words = clean.split(/\s+/);
  const formattedWords = words.map((word, idx) => {
    const lower = word.toLowerCase();
    // Always capitalize the first and last word
    if (idx === 0 || idx === words.length - 1) {
      return capitalizeWord(word);
    }
    if (minorWords.has(lower)) {
      return lower;
    }
    return capitalizeWord(word);
  });
  
  return formattedWords.join(' ');
}

function capitalizeWord(word: string): string {
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
  return key.replace(/[\s\*\-\_]+/g, '').trim();
}
