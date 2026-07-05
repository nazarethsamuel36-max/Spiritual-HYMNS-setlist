import { useState, useEffect, useRef, useMemo } from 'react';
import { SongRenderer } from '../../utils/SongRenderer';

interface DeterministicSongViewProps {
  lyrics: string;
  chords: Array<{ chord: string; position: number }>;
}

export function DeterministicSongView({ lyrics, chords }: DeterministicSongViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(20); // Start at 20pt
  const [containerWidth, setContainerWidth] = useState(0);
  
  const MIN_FONT = 14;
  const MAX_FONT = 28;
  const PADDING = 32; // 16px left + 16px right

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth - PADDING);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Render engine - always recalculates from original data
  const renderedLines = useMemo(() => {
    if (containerWidth === 0) return [];

    const renderer = new SongRenderer();
    return renderer.render(
      { lyrics, chords },
      containerWidth,
      fontSize,
      'sans-serif'
    );
  }, [lyrics, chords, containerWidth, fontSize]);

  const handleFontSizeChange = (delta: number) => {
    const newSize = fontSize + delta;
    if (newSize >= MIN_FONT && newSize <= MAX_FONT) {
      setFontSize(newSize);
    }
  };

  return (
    <div ref={containerRef} className="w-full px-4 py-6">
      {/* Font Size Controls */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button
          onClick={() => handleFontSizeChange(-1)}
          disabled={fontSize <= MIN_FONT}
          className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 font-bold"
        >
          -
        </button>
        <span className="text-sm font-bold text-slate-700">{fontSize}pt</span>
        <button
          onClick={() => handleFontSizeChange(1)}
          disabled={fontSize >= MAX_FONT}
          className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 font-bold"
        >
          +
        </button>
      </div>

      {/* Rendered Lines */}
      <div className="space-y-6">
        {renderedLines.map((line, lineIdx) => (
          <div key={lineIdx} className="relative">
            {/* Chord Line */}
            <div 
              className="relative h-6 mb-1"
              style={{ fontSize: `${fontSize * 0.75}pt` }}
            >
              {line.chords.map((chord, chordIdx) => (
                <span
                  key={chordIdx}
                  className="absolute font-bold text-blue-600"
                  style={{ left: `${chord.pixelPosition}px` }}
                >
                  {chord.chord}
                </span>
              ))}
            </div>

            {/* Lyrics Line */}
            <div
              className="text-slate-800 leading-relaxed"
              style={{ 
                fontSize: `${fontSize}pt`,
                whiteSpace: 'pre' // Prevent browser wrapping
              }}
            >
              {line.lyrics}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
