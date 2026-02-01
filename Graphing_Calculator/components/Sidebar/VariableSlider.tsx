"use client";

import React, { useState, useEffect, useRef } from "react";
import { Variable } from "@/types/graph";

interface VariableSliderProps {
  variable: Variable;
  onUpdate: (updates: Partial<Variable>) => void;
  onDelete: () => void;
  onValueChange: (value: number) => void;
  onToggleAnimation: () => void;
}

export const VariableSlider: React.FC<VariableSliderProps> = ({
  variable,
  onUpdate,
  onDelete,
  onValueChange,
  onToggleAnimation,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    if (!variable.isAnimating) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      const stepTime = 1000 / variable.animationSpeed;

      if (delta >= stepTime) {
        let newValue = variable.value + variable.step * variable.animationDirection;

        // Bounce at boundaries
        if (newValue >= variable.max) {
          newValue = variable.max;
          onUpdate({ animationDirection: -1 as 1 | -1 });
        } else if (newValue <= variable.min) {
          newValue = variable.min;
          onUpdate({ animationDirection: 1 as 1 | -1 });
        }

        onValueChange(newValue);
        lastTimeRef.current = time;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variable.isAnimating, variable.animationSpeed, variable.animationDirection, variable.step, variable.min, variable.max, variable.value, onValueChange, onUpdate]);

  // Format value for display
  const formatValue = (val: number) => {
    if (Math.abs(val) < 0.01 && val !== 0) {
      return val.toExponential(2);
    }
    return val.toFixed(2);
  };

  return (
    <div className="bg-graph-input/50 rounded-lg p-3 border border-transparent hover:border-graph-border transition-all">
      {/* Header row */}
      <div className="flex items-center gap-2 mb-2">
        {/* Variable name */}
        <span className="text-sm font-mono font-semibold text-graph-primary">
          {variable.name}
        </span>

        {/* Value display */}
        <span className="text-sm font-mono text-graph-text">
          = {formatValue(variable.value)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Play/Pause button */}
        <button
          onClick={onToggleAnimation}
          className={`btn-icon w-7 h-7 ${
            variable.isAnimating
              ? "bg-graph-primary/20 text-graph-primary"
              : "text-graph-muted hover:text-graph-text"
          }`}
          title={variable.isAnimating ? "Pause" : "Play"}
        >
          {variable.isAnimating ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Settings toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`btn-icon w-7 h-7 ${
            isExpanded ? "text-graph-text" : "text-graph-muted hover:text-graph-text"
          }`}
          title="Settings"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>

        {/* Delete button */}
        <button
          onClick={onDelete}
          className="btn-icon w-7 h-7 text-graph-muted hover:text-red-400"
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

      {/* Slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-graph-muted font-mono w-12 text-right">
          {formatValue(variable.min)}
        </span>
        <input
          type="range"
          min={variable.min}
          max={variable.max}
          step={variable.step}
          value={variable.value}
          onChange={(e) => onValueChange(parseFloat(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs text-graph-muted font-mono w-12">
          {formatValue(variable.max)}
        </span>
      </div>

      {/* Expanded settings */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-graph-border/50 grid grid-cols-3 gap-2 fade-in">
          <div>
            <label className="text-[10px] text-graph-muted uppercase tracking-wider block mb-1">
              Min
            </label>
            <input
              type="number"
              value={variable.min}
              onChange={(e) => onUpdate({ min: parseFloat(e.target.value) || -10 })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[10px] text-graph-muted uppercase tracking-wider block mb-1">
              Max
            </label>
            <input
              type="number"
              value={variable.max}
              onChange={(e) => onUpdate({ max: parseFloat(e.target.value) || 10 })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[10px] text-graph-muted uppercase tracking-wider block mb-1">
              Step
            </label>
            <input
              type="number"
              value={variable.step}
              step="0.01"
              onChange={(e) => onUpdate({ step: parseFloat(e.target.value) || 0.1 })}
              className="w-full"
            />
          </div>
          <div className="col-span-3">
            <label className="text-[10px] text-graph-muted uppercase tracking-wider block mb-1">
              Animation Speed ({variable.animationSpeed} steps/sec)
            </label>
            <input
              type="range"
              min={5}
              max={100}
              value={variable.animationSpeed}
              onChange={(e) => onUpdate({ animationSpeed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};
