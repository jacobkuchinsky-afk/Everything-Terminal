'use client';

import React from 'react';
import { FormatOutput } from '@/components/color/FormatOutput';
import { ColorFormats } from '@/lib/colorConversions';

interface FormatListProps {
  formats: ColorFormats;
}

const formatLabels: { key: keyof ColorFormats; label: string }[] = [
  { key: 'hex', label: 'HEX' },
  { key: 'hex8', label: 'HEX8 (with Alpha)' },
  { key: 'rgb', label: 'RGB' },
  { key: 'rgba', label: 'RGBA' },
  { key: 'hsl', label: 'HSL' },
  { key: 'hsla', label: 'HSLA' },
  { key: 'hsb', label: 'HSB / HSV' },
  { key: 'cmyk', label: 'CMYK' },
];

export const FormatList: React.FC<FormatListProps> = ({ formats }) => {
  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-picker-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Color Formats
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {formatLabels.map(({ key, label }) => (
          <FormatOutput
            key={key}
            label={label}
            value={formats[key]}
          />
        ))}
      </div>
    </div>
  );
};
