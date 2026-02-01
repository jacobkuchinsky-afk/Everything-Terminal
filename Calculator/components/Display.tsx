'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DisplayProps {
  expression: string;
  displayValue: string;
  hasMemory: boolean;
  hasError: boolean;
}

export const Display: React.FC<DisplayProps> = ({
  expression,
  displayValue,
  hasMemory,
  hasError,
}) => {
  const displayRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(42);

  useEffect(() => {
    const contentLength = displayValue.length;
    
    if (contentLength <= 8) {
      setFontSize(42);
    } else if (contentLength <= 12) {
      setFontSize(36);
    } else if (contentLength <= 16) {
      setFontSize(28);
    } else if (contentLength <= 22) {
      setFontSize(22);
    } else {
      setFontSize(18);
    }
  }, [displayValue]);

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.scrollLeft = displayRef.current.scrollWidth;
    }
  }, [expression]);

  return (
    <div className="calc-display p-5 mb-5">
      {/* Top bar with indicators */}
      <div className="flex items-center justify-between mb-3 min-h-[20px]">
        <div className="flex items-center gap-2">
          {hasMemory && (
            <span className="memory-badge">M</span>
          )}
        </div>
        <div className="text-[10px] text-calc-textMuted font-medium uppercase tracking-widest">
          DEG
        </div>
      </div>

      {/* Expression line */}
      <div 
        className="text-right text-sm text-calc-textDim font-mono mb-2 h-6 overflow-x-auto whitespace-nowrap scrollbar-hide expression-text"
        ref={displayRef}
      >
        {expression || '\u00A0'}
      </div>

      {/* Result display */}
      <div 
        className={`
          text-right font-mono font-semibold leading-none tracking-tight
          transition-all duration-200
          ${hasError ? 'error-text' : 'text-white'}
        `}
        style={{ fontSize: `${fontSize}px` }}
      >
        {displayValue}
        <span className="inline-block w-[2px] h-[0.9em] bg-calc-accent ml-1 cursor-blink align-middle" />
      </div>
    </div>
  );
};
