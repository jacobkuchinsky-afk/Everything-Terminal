'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { rgbToHex, hslToRgb, parseHex } from '@/lib/colorConversions';

interface HexInputProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (h: number, s: number, l: number) => void;
}

export const HexInput: React.FC<HexInputProps> = ({
  hue,
  saturation,
  lightness,
  onChange,
}) => {
  const rgb = hslToRgb(hue, saturation, lightness);
  const currentHex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const [inputValue, setInputValue] = useState(currentHex);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentHex);
    }
  }, [currentHex, isEditing]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase();
    
    // Auto-add # if missing
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    
    // Only allow valid hex characters
    const cleaned = value.replace(/[^#0-9A-F]/g, '');
    setInputValue(cleaned);

    // Try to parse and update if valid
    if (cleaned.length === 7) {
      const hsl = parseHex(cleaned);
      if (hsl) {
        onChange(hsl.h, hsl.s, hsl.l);
      }
    }
  }, [onChange]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    // Reset to current color if invalid
    if (inputValue.length !== 7) {
      setInputValue(currentHex);
    }
  }, [inputValue, currentHex]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  }, []);

  return (
    <div className="w-full">
      <label className="block text-xs text-picker-muted uppercase tracking-wider mb-2">
        Hex Input
      </label>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        maxLength={7}
        placeholder="#000000"
        className="w-full px-4 py-3 bg-picker-card border border-picker-border rounded-lg font-mono text-sm text-white placeholder-picker-muted focus:outline-none focus:border-picker-primary transition-colors"
      />
    </div>
  );
};
