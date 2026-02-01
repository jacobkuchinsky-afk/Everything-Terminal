'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';

interface ColorCanvasProps {
  hue: number;
  saturation: number;
  lightness: number;
  onChange: (saturation: number, lightness: number) => void;
}

export const ColorCanvas: React.FC<ColorCanvasProps> = ({
  hue,
  saturation,
  lightness,
  onChange,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert lightness (0-100) to Y position
  // In our picker: top = light (100), bottom = dark (0)
  // And saturation: left = gray (0), right = saturated (100)
  const getPositionFromValues = useCallback(() => {
    // We need to convert HSL to a position in an HSV-style picker
    // For simplicity, use saturation as X and invert lightness for Y
    const x = saturation;
    const y = 100 - lightness;
    return { x, y };
  }, [saturation, lightness]);

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    // Convert position to saturation and lightness
    // X axis = saturation (0-100)
    // Y axis = brightness (top = 100, bottom = 0)
    const newSaturation = Math.round(x * 100);
    const newLightness = Math.round((1 - y) * 100);

    onChange(newSaturation, newLightness);
  }, [onChange]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleInteraction(e.clientX, e.clientY);
  }, [isDragging, handleInteraction]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
  }, [handleInteraction]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleInteraction(touch.clientX, touch.clientY);
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

  const position = getPositionFromValues();

  return (
    <div
      ref={canvasRef}
      className="relative w-full aspect-square rounded-lg cursor-crosshair overflow-hidden picker-border"
      style={{
        background: `
          linear-gradient(to top, #000 0%, transparent 100%),
          linear-gradient(to right, #fff 0%, hsl(${hue}, 100%, 50%) 100%)
        `,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Picker indicator */}
      <div
        className="absolute w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
        }}
      >
        <div className="w-full h-full rounded-full border-2 border-white shadow-lg"
          style={{
            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
};
