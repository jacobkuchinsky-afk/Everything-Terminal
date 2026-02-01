'use client';

import React, { useState, useCallback } from 'react';

interface FormatOutputProps {
  label: string;
  value: string;
}

export const FormatOutput: React.FC<FormatOutputProps> = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setIsFlashing(true);
      
      setTimeout(() => setCopied(false), 1500);
      setTimeout(() => setIsFlashing(false), 300);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [value]);

  return (
    <div
      onClick={handleCopy}
      className={`
        group relative p-4 bg-picker-card border border-picker-border rounded-lg cursor-pointer
        transition-all duration-150 hover:border-picker-muted hover:bg-picker-surface
        active:scale-[0.98]
        ${isFlashing ? 'copy-flash' : ''}
      `}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-picker-muted uppercase tracking-wider font-medium">
          {label}
        </span>
        <span className={`
          text-xs uppercase tracking-wider transition-all duration-200
          ${copied ? 'text-green-400' : 'text-picker-muted opacity-0 group-hover:opacity-100'}
        `}>
          {copied ? 'Copied!' : 'Click to copy'}
        </span>
      </div>
      
      {/* Value */}
      <div className="font-mono text-sm text-white break-all">
        {value}
      </div>

      {/* Copy indicator overlay */}
      {copied && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 rounded-lg pointer-events-none fade-in">
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
};
