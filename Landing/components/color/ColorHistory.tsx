'use client';

import React from 'react';
import { HistoryColor } from '@/hooks/useColorHistory';
import { toCssColor } from '@/lib/colorConversions';

interface ColorHistoryProps {
  history: HistoryColor[];
  onSelect: (color: HistoryColor) => void;
  onClear: () => void;
}

export const ColorHistory: React.FC<ColorHistoryProps> = ({
  history,
  onSelect,
  onClear,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-picker-muted uppercase tracking-wider flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Colors
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-picker-muted hover:text-picker-primary transition-colors uppercase tracking-wider"
        >
          Clear
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {history.map((color, index) => (
          <button
            key={`${color.hex}-${index}`}
            onClick={() => onSelect(color)}
            className="group relative w-10 h-10 rounded-lg overflow-hidden picker-border hover:border-picker-muted transition-all hover:scale-105 active:scale-95"
            title={color.hex}
          >
            {/* Checkerboard for transparency */}
            <div className="absolute inset-0 checkerboard" />
            {/* Color overlay */}
            <div
              className="absolute inset-0 transition-opacity"
              style={{ backgroundColor: toCssColor(color.h, color.s, color.l, color.a) }}
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
};
