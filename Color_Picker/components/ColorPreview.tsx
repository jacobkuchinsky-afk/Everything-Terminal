'use client';

import React from 'react';
import { toCssColor } from '@/lib/colorConversions';

interface ColorPreviewProps {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
}

export const ColorPreview: React.FC<ColorPreviewProps> = ({
  hue,
  saturation,
  lightness,
  alpha,
}) => {
  const color = toCssColor(hue, saturation, lightness, alpha);

  return (
    <div className="w-full">
      <label className="block text-xs text-picker-muted uppercase tracking-wider mb-2">
        Preview
      </label>
      <div className="relative w-full h-20 rounded-lg overflow-hidden picker-border checkerboard">
        <div
          className="absolute inset-0 transition-colors duration-150"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};
