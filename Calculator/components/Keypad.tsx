'use client';

import React from 'react';
import { CalcButton } from './CalcButton';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onOperator: (op: string) => void;
  onFunction: (func: string) => void;
  onConstant: (constant: string) => void;
  onParen: (paren: '(' | ')') => void;
  onCalculate: () => void;
  onClear: () => void;
  onBackspace: () => void;
  onToggleSign: () => void;
  onPercentage: () => void;
  onSquare: () => void;
  onCube: () => void;
  onPower: () => void;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onMemoryAdd: () => void;
  onMemorySubtract: () => void;
  onToggleSecond: () => void;
  isSecondFunction: boolean;
  hasMemory: boolean;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onDecimal,
  onOperator,
  onFunction,
  onConstant,
  onParen,
  onCalculate,
  onClear,
  onBackspace,
  onToggleSign,
  onPercentage,
  onSquare,
  onCube,
  onPower,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  onToggleSecond,
  isSecondFunction,
  hasMemory,
}) => {
  return (
    <div className="space-y-3">
      {/* Top row - Memory & Mode */}
      <div className="grid grid-cols-6 gap-2">
        <CalcButton
          label="2nd"
          variant="2nd"
          onClick={onToggleSecond}
          isActive={isSecondFunction}
          size="sm"
        />
        <CalcButton
          label="MC"
          variant="memory"
          onClick={onMemoryClear}
          disabled={!hasMemory}
          size="sm"
        />
        <CalcButton
          label="MR"
          variant="memory"
          onClick={onMemoryRecall}
          disabled={!hasMemory}
          size="sm"
        />
        <CalcButton
          label="M+"
          variant="memory"
          onClick={onMemoryAdd}
          size="sm"
        />
        <CalcButton
          label="M−"
          variant="memory"
          onClick={onMemorySubtract}
          size="sm"
        />
        <CalcButton
          label="AC"
          variant="special"
          onClick={onClear}
          size="sm"
        />
      </div>

      {/* Scientific functions row */}
      <div className="grid grid-cols-5 gap-2">
        <CalcButton
          label={isSecondFunction ? 'sin⁻¹' : 'sin'}
          variant="function"
          onClick={() => onFunction(isSecondFunction ? 'asin' : 'sin')}
        />
        <CalcButton
          label={isSecondFunction ? 'cos⁻¹' : 'cos'}
          variant="function"
          onClick={() => onFunction(isSecondFunction ? 'acos' : 'cos')}
        />
        <CalcButton
          label={isSecondFunction ? 'tan⁻¹' : 'tan'}
          variant="function"
          onClick={() => onFunction(isSecondFunction ? 'atan' : 'tan')}
        />
        <CalcButton
          label={isSecondFunction ? 'eˣ' : 'ln'}
          variant="function"
          onClick={() => isSecondFunction ? onFunction('exp') : onFunction('ln')}
        />
        <CalcButton
          label="log"
          variant="function"
          onClick={() => onFunction('log')}
        />
      </div>

      {/* More functions */}
      <div className="grid grid-cols-5 gap-2">
        <CalcButton
          label={isSecondFunction ? '∛' : '√'}
          variant="function"
          onClick={() => onFunction(isSecondFunction ? 'cbrt' : 'sqrt')}
        />
        <CalcButton
          label={isSecondFunction ? 'x³' : 'x²'}
          variant="function"
          onClick={isSecondFunction ? onCube : onSquare}
        />
        <CalcButton
          label="xʸ"
          variant="function"
          onClick={onPower}
        />
        <CalcButton
          label="("
          variant="function"
          onClick={() => onParen('(')}
        />
        <CalcButton
          label=")"
          variant="function"
          onClick={() => onParen(')')}
        />
      </div>

      {/* Divider */}
      <div className="divider my-1" />

      {/* Main keypad */}
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <CalcButton label="7" onClick={() => onDigit('7')} />
        <CalcButton label="8" onClick={() => onDigit('8')} />
        <CalcButton label="9" onClick={() => onDigit('9')} />
        <CalcButton label="÷" variant="operator" onClick={() => onOperator('÷')} />

        {/* Row 2 */}
        <CalcButton label="4" onClick={() => onDigit('4')} />
        <CalcButton label="5" onClick={() => onDigit('5')} />
        <CalcButton label="6" onClick={() => onDigit('6')} />
        <CalcButton label="×" variant="operator" onClick={() => onOperator('×')} />

        {/* Row 3 */}
        <CalcButton label="1" onClick={() => onDigit('1')} />
        <CalcButton label="2" onClick={() => onDigit('2')} />
        <CalcButton label="3" onClick={() => onDigit('3')} />
        <CalcButton label="−" variant="operator" onClick={() => onOperator('-')} />

        {/* Row 4 */}
        <CalcButton label="0" onClick={() => onDigit('0')} />
        <CalcButton label="." onClick={onDecimal} />
        <CalcButton label="⌫" variant="special" onClick={onBackspace} />
        <CalcButton label="+" variant="operator" onClick={() => onOperator('+')} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-4 gap-2">
        <CalcButton label="π" variant="function" onClick={() => onConstant('π')} />
        <CalcButton label="±" variant="function" onClick={onToggleSign} />
        <CalcButton label="%" variant="function" onClick={onPercentage} />
        <CalcButton label="=" variant="equals" onClick={onCalculate} />
      </div>
    </div>
  );
};
