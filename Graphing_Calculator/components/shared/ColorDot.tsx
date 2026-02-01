"use client";

import React, { useState, useRef, useEffect } from "react";
import { EQUATION_COLORS, EquationColor } from "@/types/graph";

interface ColorDotProps {
  color: EquationColor;
  onChange: (color: EquationColor) => void;
}

export const ColorDot: React.FC<ColorDotProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="color-dot cursor-pointer hover:scale-110 transition-transform"
        style={{ backgroundColor: color }}
        title="Change color"
      />

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 p-4 bg-graph-sidebar border border-graph-border rounded-xl shadow-xl z-50 fade-in">
          <div className="grid grid-cols-4 gap-3">
            {EQUATION_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  onChange(c);
                  setIsOpen(false);
                }}
                className={`w-7 h-7 rounded-full cursor-pointer hover:scale-110 transition-transform ${
                  c === color ? "ring-2 ring-white ring-offset-2 ring-offset-graph-sidebar" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
