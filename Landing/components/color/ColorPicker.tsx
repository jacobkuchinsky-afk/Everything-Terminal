'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ColorCanvas } from '@/components/color/ColorCanvas';
import { HueSlider } from '@/components/color/HueSlider';
import { AlphaSlider } from '@/components/color/AlphaSlider';
import { ColorPreview } from '@/components/color/ColorPreview';
import { HexInput } from '@/components/color/HexInput';
import { FormatList } from '@/components/color/FormatList';
import { ColorHistory } from '@/components/color/ColorHistory';
import { useColorHistory, HistoryColor } from '@/hooks/useColorHistory';
import { getAllFormats, rgbToHex, hslToRgb } from '@/lib/colorConversions';

export const ColorPicker: React.FC = () => {
  // Color state stored as HSLA
  const [hue, setHue] = useState(210);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(50);
  const [alpha, setAlpha] = useState(1);

  // Color history
  const { history, addColor, clearHistory, isLoaded } = useColorHistory();

  // Calculate all formats
  const formats = useMemo(() => {
    return getAllFormats(hue, saturation, lightness, alpha);
  }, [hue, saturation, lightness, alpha]);

  // Get current hex for history
  const currentHex = useMemo(() => {
    const rgb = hslToRgb(hue, saturation, lightness);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }, [hue, saturation, lightness]);

  // Handle saturation/lightness change from canvas
  const handleCanvasChange = useCallback((newSaturation: number, newLightness: number) => {
    setSaturation(newSaturation);
    setLightness(newLightness);
  }, []);

  // Handle hex input change
  const handleHexChange = useCallback((h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
  }, []);

  // Handle history color selection
  const handleHistorySelect = useCallback((color: HistoryColor) => {
    setHue(color.h);
    setSaturation(color.s);
    setLightness(color.l);
    setAlpha(color.a);
  }, []);

  // Add to history on interaction end (debounced through button)
  const handleAddToHistory = useCallback(() => {
    addColor({
      h: hue,
      s: saturation,
      l: lightness,
      a: alpha,
      hex: currentHex,
    });
  }, [addColor, hue, saturation, lightness, alpha, currentHex]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          <span className="text-white">Color</span>
          <span className="text-picker-primary"> Picker</span>
        </h1>
        <p className="text-picker-muted text-sm md:text-base max-w-md mx-auto">
          Pick any color and get the code in all formats. Click any format to copy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Column - Picker Controls */}
        <div className="space-y-6">
          {/* Color Canvas */}
          <div>
            <label className="block text-xs text-picker-muted uppercase tracking-wider mb-2">
              Pick Color
            </label>
            <ColorCanvas
              hue={hue}
              saturation={saturation}
              lightness={lightness}
              onChange={handleCanvasChange}
            />
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <HueSlider hue={hue} onChange={setHue} />
            <AlphaSlider
              hue={hue}
              saturation={saturation}
              lightness={lightness}
              alpha={alpha}
              onChange={setAlpha}
            />
          </div>

          {/* Preview and Hex Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPreview
              hue={hue}
              saturation={saturation}
              lightness={lightness}
              alpha={alpha}
            />
            <HexInput
              hue={hue}
              saturation={saturation}
              lightness={lightness}
              onChange={handleHexChange}
            />
          </div>

          {/* Save to History Button */}
          <button
            onClick={handleAddToHistory}
            className="w-full py-3 px-6 bg-picker-primary text-black font-semibold rounded-lg
              transition-all duration-150 hover:bg-picker-bright active:scale-[0.98]
              flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Save to History
          </button>

          {/* Color History */}
          {isLoaded && (
            <ColorHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={clearHistory}
            />
          )}
        </div>

        {/* Right Column - Format Outputs */}
        <div>
          <FormatList formats={formats} />
        </div>
      </div>
    </div>
  );
};
