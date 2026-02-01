"use client";

import React, { useState, useRef, useEffect } from "react";
import { Equation, EquationColor } from "@/types/graph";
import { ColorDot } from "@/components/shared/ColorDot";

interface EquationInputProps {
  equation: Equation;
  index: number;
  isSelected: boolean;
  onUpdate: (expression: string) => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onColorChange: (color: EquationColor) => void;
  onSelect: () => void;
}

export const EquationInput: React.FC<EquationInputProps> = ({
  equation,
  index,
  isSelected,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onColorChange,
  onSelect,
}) => {
  const [localValue, setLocalValue] = useState(equation.expression);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local value with equation expression
  useEffect(() => {
    setLocalValue(equation.expression);
  }, [equation.expression]);

  // Debounced update
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onUpdate(value);
    }, 300);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onUpdate(localValue);
    }
  };

  // Get equation type badge
  const getTypeBadge = () => {
    if (!equation.expression) return null;
    
    const badges: Record<string, { text: string; className: string }> = {
      explicit: { text: "y=f(x)", className: "bg-graph-blue/20 text-graph-blue" },
      implicit: { text: "F(x,y)=0", className: "bg-graph-purple/20 text-graph-purple" },
      parametric: { text: "(x(t), y(t))", className: "bg-graph-green/20 text-graph-green" },
      polar: { text: "r=f(θ)", className: "bg-graph-orange/20 text-graph-orange" },
      inequality: { text: "y ⋚ f(x)", className: "bg-graph-pink/20 text-graph-pink" },
    };

    const badge = badges[equation.type];
    if (!badge) return null;

    return (
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div
      className={`group relative p-3 rounded-lg transition-all ${
        isSelected
          ? "bg-graph-input border border-graph-primary"
          : "bg-graph-input/50 border border-transparent hover:bg-graph-input hover:border-graph-border"
      }`}
      onClick={onSelect}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Equation number */}
        <span className="text-xs text-graph-muted font-mono w-4">{index + 1}</span>

        {/* Color dot */}
        <ColorDot color={equation.color} onChange={onColorChange} />

        {/* Type badge */}
        {getTypeBadge()}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className={`btn-icon w-7 h-7 ${
            equation.visible ? "text-graph-text" : "text-graph-muted"
          }`}
          title={equation.visible ? "Hide" : "Show"}
        >
          {equation.visible ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          )}
        </button>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="btn-icon w-7 h-7 text-graph-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        placeholder="Enter equation (e.g., y = x^2)"
        className="equation-input w-full px-3 py-2 text-sm"
        style={{ borderLeftColor: equation.color, borderLeftWidth: 3 }}
      />

      {/* Error message */}
      {equation.error && (
        <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {equation.error}
        </div>
      )}
    </div>
  );
};
