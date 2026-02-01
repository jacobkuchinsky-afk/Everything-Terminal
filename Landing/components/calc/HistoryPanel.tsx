'use client';

import React from 'react';
import { HistoryEntry } from '@/hooks/useCalculator';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onSelect,
  onClear,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 history-panel rounded-[24px] z-20 flex flex-col fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-calc-border">
        <h3 className="text-sm font-semibold text-white">History</h3>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={onClear}
              className="text-xs text-calc-textMuted hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-calc-textMuted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-calc-textMuted py-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-calc-textMuted">No calculations yet</p>
            <p className="text-xs text-calc-textMuted mt-1">Your history will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((entry, index) => (
              <button
                key={entry.timestamp + index}
                onClick={() => onSelect(entry)}
                className="history-item w-full text-left group"
              >
                <div className="text-xs text-calc-textMuted font-mono truncate group-hover:text-calc-textDim transition-colors">
                  {entry.expression}
                </div>
                <div className="text-lg text-white font-mono font-medium mt-0.5">
                  <span className="text-calc-accent mr-2">=</span>
                  {entry.result}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
