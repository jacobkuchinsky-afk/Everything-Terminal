'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { toCssColor } from '@/lib/colorConversions';

interface AlphaSliderProps {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  onChange: (alpha: number) => void;
}

export const AlphaSlider: React.FC<AlphaSliderProps> = ({
  hue,
  saturation,
  lightness,
  alpha,
  onChange,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newAlpha = Math.round(x * 100) / 100;
    onChange(newAlpha);
  }, [onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleInteraction(e.clientX);
  }, [handleInteraction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleInteraction(e.clientX);
  }, [isDragging, handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleInteraction(touch.clientX);
  }, [handleInteraction]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleInteraction(touch.clientX);
  }, [isDragging, handleInteraction]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const position = alpha * 100;
  const solidColor = toCssColor(hue, saturation, lightness, 1);
  const transparentColor = toCssColor(hue, saturation, lightness, 0);

  return (
    <div className="w-full">
      <label className="block text-xs text-picker-muted uppercase tracking-wider mb-2">
        Opacity
      </label>
      <div
        ref={sliderRef}
        className="relative h-4 rounded-full cursor-pointer picker-border checkerboard overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Color gradient overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, ${transparentColor}, ${solidColor})`,
          }}
        />
        
        {/* Slider thumb */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-picker-dark shadow-lg pointer-events-none z-10 transition-transform duration-75"
          style={{
            left: `${position}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  );
};
