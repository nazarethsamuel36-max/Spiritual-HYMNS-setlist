export const EnharmonicPref = {
  AUTO: 0,
  SHARP: 1,
  FLAT: 2,
  FORCE_SHARP: 3,
  FORCE_FLAT: 4,
  PRESERVE_INPUT_STYLE: 5
} as const;

export type EnharmonicPref = typeof EnharmonicPref[keyof typeof EnharmonicPref];

const SHARP_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_SCALE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const NATURAL_SCALE = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const AMBIGUOUS_MASK = [false, true, false, true, false, false, true, false, true, false, true, false];

const NAME_TO_INDEX: Record<string, number> = {
  "C": 0, "B#": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3,
  "E": 4, "Fb": 4, "F": 5, "E#": 5, "F#": 6, "Gb": 6, "G": 7,
  "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11, "Cb": 11
};

export class ChordTransposer {
  
  static transposeChord(chordStr: string, semitones: number, pref: EnharmonicPref = EnharmonicPref.AUTO): string {
    if (semitones === 0) return chordStr;
    
    // Simple regex parser for Root / Bass
    // Match Root (A-G with optional #/b) and everything else (modifiers), then optional /Bass
    const match = chordStr.match(/^([A-G][#b]?)([^/]*)(?:\/([A-G][#b]?))?$/);
    if (!match) return chordStr;

    const root = match[1];
    const modifiers = match[2];
    const bass = match[3];

    let transposedRoot = this.shiftNote(root, semitones, pref);
    let transposedBass = bass ? this.shiftNote(bass, semitones, pref) : null;

    // Cleanup C/C -> C
    if (transposedBass === transposedRoot) {
      transposedBass = null;
    }

    return transposedRoot + modifiers + (transposedBass ? '/' + transposedBass : '');
  }

  private static shiftNote(note: string, semitones: number, pref: EnharmonicPref): string {
    if (semitones === 0) return note;

    const index = NAME_TO_INDEX[note];
    if (index === undefined) return note;

    const newIndex = ((index + semitones) % 12 + 12) % 12;

    // 1. Force overrides
    if (pref === EnharmonicPref.FORCE_SHARP) return SHARP_SCALE[newIndex];
    if (pref === EnharmonicPref.FORCE_FLAT) return FLAT_SCALE[newIndex];

    if (pref === EnharmonicPref.PRESERVE_INPUT_STYLE) {
      if (note.includes('#')) return SHARP_SCALE[newIndex];
      if (note.includes('b')) return FLAT_SCALE[newIndex];
    }

    // 2. Natural note shortcut
    if (!AMBIGUOUS_MASK[newIndex]) {
      return NATURAL_SCALE[newIndex];
    }

    // 3. Smart Fallback (simplified AUTO)
    // Common keys logic: use Sharps for G, D, A, E, B. Flats for F, Bb, Eb, Ab, Db.
    // Here we just use a basic heuristic based on direction or just default to common
    if (semitones > 0) return SHARP_SCALE[newIndex];
    return FLAT_SCALE[newIndex];
  }

  static getCapoSuggestion(semitones: number): number {
    const normalized = ((semitones % 12) + 12) % 12;
    if (normalized === 0) return 0;
    const capo = 12 - normalized;
    return capo <= 7 ? capo : 0;
  }
}

