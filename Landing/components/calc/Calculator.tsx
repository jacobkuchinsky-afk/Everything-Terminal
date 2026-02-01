'use client';

import React, { useState } from 'react';
import { Display } from '@/components/calc/Display';
import { Keypad } from '@/components/calc/Keypad';
import { HistoryPanel } from '@/components/calc/HistoryPanel';
import { useCalculator } from '@/hooks/useCalculator';

export const Calculator: React.FC = () => {
  const [showHistory, setShowHistory] = useState(false);
  
  const {
    state,
    inputDigit,
    inputDecimal,
    inputOperator,
    inputFunction,
    inputConstant,
    inputParen,
    calculate,
    clearAll,
    backspace,
    toggleSign,
    percentage,
    square,
    cube,
    power,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    toggleSecondFunction,
    loadHistoryEntry,
    clearHistory,
  } = useCalculator();

  return (
    <div className="fade-in">
      {/* Calculator Card */}
      <div className="calculator-container w-[360px] sm:w-[400px] p-5 sm:p-6 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-calc-accent to-pink-500 flex items-center justify-center shadow-lg shadow-calc-accent/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-semibold text-white block leading-tight">Scientific</span>
              <span className="text-[10px] text-calc-textMuted uppercase tracking-wider">Calculator</span>
            </div>
          </div>
          
          {/* History toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`
              p-2.5 rounded-xl transition-all
              ${showHistory 
                ? 'bg-calc-accent text-white shadow-lg shadow-calc-accent/30' 
                : 'text-calc-textMuted hover:text-white hover:bg-white/5'
              }
            `}
            aria-label="Toggle history"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Display */}
        <Display
          expression={state.expression}
          displayValue={state.displayValue}
          hasMemory={state.memory !== 0}
          hasError={state.hasError}
        />

        {/* Keypad */}
        <Keypad
          onDigit={inputDigit}
          onDecimal={inputDecimal}
          onOperator={inputOperator}
          onFunction={inputFunction}
          onConstant={inputConstant}
          onParen={inputParen}
          onCalculate={calculate}
          onClear={clearAll}
          onBackspace={backspace}
          onToggleSign={toggleSign}
          onPercentage={percentage}
          onSquare={square}
          onCube={cube}
          onPower={power}
          onMemoryClear={memoryClear}
          onMemoryRecall={memoryRecall}
          onMemoryAdd={memoryAdd}
          onMemorySubtract={memorySubtract}
          onToggleSecond={toggleSecondFunction}
          isSecondFunction={state.isSecondFunction}
          hasMemory={state.memory !== 0}
        />

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/5 text-center">
          <span className="text-[10px] text-calc-textMuted uppercase tracking-widest">
            Keyboard supported
          </span>
        </div>

        {/* History Panel */}
        <HistoryPanel
          history={state.history}
          onSelect={loadHistoryEntry}
          onClear={clearHistory}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      </div>
    </div>
  );
};
