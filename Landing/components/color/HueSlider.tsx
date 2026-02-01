'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';

interface HueSliderProps {
  hue: number;
  onChange: (hue: number) => void;
}

export const HueSlider: React.FC<HueSliderProps> = ({ hue, onChange }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = useCallback((clientX: number) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newHue = Math.round(x * 360);
    onChange(newHue);
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

  const position = (hue / 360) * 100;

  return (
    <div className="w-full">
      <label className="block text-xs text-picker-muted uppercase tracking-wider mb-2">
        Hue
      </label>
      <div
        ref={sliderRef}
        className="relative h-4 rounded-full cursor-pointer picker-border"
        style={{
          background: `linear-gradient(to right, 
            hsl(0, 100%, 50%), 
            hsl(60, 100%, 50%), 
            hsl(120, 100%, 50%), 
            hsl(180, 100%, 50%), 
            hsl(240, 100%, 50%), 
            hsl(300, 100%, 50%), 
            hsl(360, 100%, 50%)
          )`,
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Slider thumb */}
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-picker-dark shadow-lg pointer-events-none transition-transform duration-75"
          style={{
            left: `${position}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  );
};
