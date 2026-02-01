'use client';

import { useState, useCallback, useEffect } from 'react';
import { evaluate, formatNumber, validateExpression, endsWithOperator } from '@/lib/calculator';

export interface HistoryEntry {
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalculatorState {
  expression: string;
  displayValue: string;
  memory: number;
  history: HistoryEntry[];
  isSecondFunction: boolean;
  hasError: boolean;
  justCalculated: boolean;
}

const initialState: CalculatorState = {
  expression: '',
  displayValue: '0',
  memory: 0,
  history: [],
  isSecondFunction: false,
  hasError: false,
  justCalculated: false,
};

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);

  // Input a digit
  const inputDigit = useCallback((digit: string) => {
    setState((prev) => {
      // If we just calculated, start fresh with new number
      if (prev.justCalculated) {
        return {
          ...prev,
          expression: digit,
          displayValue: digit,
          justCalculated: false,
          hasError: false,
        };
      }

      // If there's an error, clear and start fresh
      if (prev.hasError) {
        return {
          ...prev,
          expression: digit,
          displayValue: digit,
          hasError: false,
        };
      }

      const newExpression = prev.expression + digit;
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
      };
    });
  }, []);

  // Input decimal point
  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) {
        return {
          ...prev,
          expression: '0.',
          displayValue: '0.',
          hasError: false,
        };
      }

      // Check if last number already has a decimal
      const parts = prev.expression.split(/[+\-×÷^%()]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) return prev;

      // If expression is empty or ends with operator, add "0."
      if (prev.expression === '' || endsWithOperator(prev.expression)) {
        const newExpression = prev.expression + '0.';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
          justCalculated: false,
        };
      }

      const newExpression = prev.expression + '.';
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
        justCalculated: false,
      };
    });
  }, []);

  // Input operator
  const inputOperator = useCallback((operator: string) => {
    setState((prev) => {
      // If there's an error, don't allow operators
      if (prev.hasError) return prev;

      // If expression is empty and operator is minus, allow it for negative numbers
      if (prev.expression === '' && operator === '-') {
        return {
          ...prev,
          expression: '-',
          displayValue: '-',
        };
      }

      // If expression is empty, don't allow operators
      if (prev.expression === '') return prev;

      // If ends with operator, replace it (except for minus after other operators for negative)
      if (endsWithOperator(prev.expression)) {
        const trimmed = prev.expression.slice(0, -1);
        // Allow minus after other operators for negative numbers
        if (operator === '-' && !/[+\-×÷^%]$/.test(trimmed)) {
          const newExpression = prev.expression + operator;
          return {
            ...prev,
            expression: newExpression,
            displayValue: newExpression,
          };
        }
        // Otherwise replace the operator
        const newExpression = trimmed + operator;
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
        };
      }

      const newExpression = prev.expression + operator;
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
        justCalculated: false,
      };
    });
  }, []);

  // Input function
  const inputFunction = useCallback((func: string) => {
    setState((prev) => {
      if (prev.hasError) {
        return {
          ...prev,
          expression: func + '(',
          displayValue: func + '(',
          hasError: false,
        };
      }

      // If we just calculated, apply function to result
      if (prev.justCalculated) {
        const newExpression = func + '(' + prev.expression + ')';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
          justCalculated: false,
        };
      }

      // If expression is empty or ends with operator, just add function
      if (prev.expression === '' || endsWithOperator(prev.expression) || prev.expression.endsWith('(')) {
        const newExpression = prev.expression + func + '(';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
        };
      }

      // Otherwise, add multiplication and function
      const newExpression = prev.expression + '×' + func + '(';
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
      };
    });
  }, []);

  // Input constant
  const inputConstant = useCallback((constant: string) => {
    setState((prev) => {
      if (prev.hasError) {
        return {
          ...prev,
          expression: constant,
          displayValue: constant,
          hasError: false,
        };
      }

      if (prev.justCalculated) {
        return {
          ...prev,
          expression: constant,
          displayValue: constant,
          justCalculated: false,
        };
      }

      // If expression ends with a number or closing paren, add multiplication
      if (/[\d)π]$/.test(prev.expression)) {
        const newExpression = prev.expression + '×' + constant;
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
        };
      }

      const newExpression = prev.expression + constant;
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
      };
    });
  }, []);

  // Input parenthesis
  const inputParen = useCallback((paren: '(' | ')') => {
    setState((prev) => {
      if (prev.hasError) {
        return {
          ...prev,
          expression: paren === '(' ? '(' : '',
          displayValue: paren === '(' ? '(' : '0',
          hasError: false,
        };
      }

      if (paren === '(') {
        // If expression ends with a number or ), add multiplication
        if (/[\d)π]$/.test(prev.expression)) {
          const newExpression = prev.expression + '×(';
          return {
            ...prev,
            expression: newExpression,
            displayValue: newExpression,
            justCalculated: false,
          };
        }
        const newExpression = prev.expression + '(';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
          justCalculated: false,
        };
      } else {
        // Only add ) if there are unmatched (
        const openCount = (prev.expression.match(/\(/g) || []).length;
        const closeCount = (prev.expression.match(/\)/g) || []).length;
        if (closeCount >= openCount) return prev;

        const newExpression = prev.expression + ')';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
        };
      }
    });
  }, []);

  // Calculate result
  const calculate = useCallback(() => {
    setState((prev) => {
      if (prev.expression === '' || prev.hasError) return prev;

      // Don't recalculate if we just calculated
      if (prev.justCalculated) return prev;

      // Validate expression
      if (!validateExpression(prev.expression)) {
        return {
          ...prev,
          displayValue: 'Error',
          hasError: true,
        };
      }

      try {
        const result = evaluate(prev.expression);
        const formattedResult = formatNumber(result);

        // Add to history
        const historyEntry: HistoryEntry = {
          expression: prev.expression,
          result: formattedResult,
          timestamp: Date.now(),
        };

        return {
          ...prev,
          expression: formattedResult,
          displayValue: formattedResult,
          history: [historyEntry, ...prev.history].slice(0, 20),
          justCalculated: true,
          hasError: formattedResult === 'Error',
        };
      } catch (error) {
        return {
          ...prev,
          displayValue: 'Error',
          hasError: true,
        };
      }
    });
  }, []);

  // Clear entry (CE)
  const clearEntry = useCallback(() => {
    setState((prev) => ({
      ...prev,
      expression: '',
      displayValue: '0',
      hasError: false,
      justCalculated: false,
    }));
  }, []);

  // Clear all (AC)
  const clearAll = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      memory: prev.memory,
      history: prev.history,
    }));
  }, []);

  // Backspace
  const backspace = useCallback(() => {
    setState((prev) => {
      if (prev.hasError || prev.justCalculated) {
        return {
          ...prev,
          expression: '',
          displayValue: '0',
          hasError: false,
          justCalculated: false,
        };
      }

      if (prev.expression.length <= 1) {
        return {
          ...prev,
          expression: '',
          displayValue: '0',
        };
      }

      // Check if we need to remove a function name
      const funcNames = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'log', 'sqrt', 'cbrt', 'abs', 'floor', 'ceil', 'round', 'exp', 'fact'];
      for (const func of funcNames) {
        if (prev.expression.endsWith(func + '(')) {
          const newExpression = prev.expression.slice(0, -(func.length + 1));
          return {
            ...prev,
            expression: newExpression,
            displayValue: newExpression || '0',
          };
        }
      }

      const newExpression = prev.expression.slice(0, -1);
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression || '0',
      };
    });
  }, []);

  // Toggle sign
  const toggleSign = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;

      if (prev.expression === '' || prev.expression === '0') {
        return {
          ...prev,
          expression: '-',
          displayValue: '-',
        };
      }

      // If just calculated, negate the result
      if (prev.justCalculated) {
        const num = parseFloat(prev.expression);
        if (!isNaN(num)) {
          const negated = formatNumber(-num);
          return {
            ...prev,
            expression: negated,
            displayValue: negated,
          };
        }
        return prev;
      }

      // Try to negate the last number in the expression
      const match = prev.expression.match(/(.*?)(-?[\d.]+)$/);
      if (match) {
        const [, prefix, num] = match;
        const negated = num.startsWith('-') ? num.slice(1) : '-' + num;
        const newExpression = prefix + negated;
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
        };
      }

      return prev;
    });
  }, []);

  // Percentage
  const percentage = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;

      if (prev.expression === '') return prev;

      try {
        const result = evaluate(prev.expression);
        const percentValue = formatNumber(result / 100);
        return {
          ...prev,
          expression: percentValue,
          displayValue: percentValue,
          justCalculated: true,
        };
      } catch {
        return prev;
      }
    });
  }, []);

  // Square
  const square = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;

      if (prev.expression === '') return prev;

      if (prev.justCalculated) {
        const newExpression = '(' + prev.expression + ')^2';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
          justCalculated: false,
        };
      }

      const newExpression = prev.expression + '^2';
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
      };
    });
  }, []);

  // Cube
  const cube = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;

      if (prev.expression === '') return prev;

      if (prev.justCalculated) {
        const newExpression = '(' + prev.expression + ')^3';
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
          justCalculated: false,
        };
      }

      const newExpression = prev.expression + '^3';
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
      };
    });
  }, []);

  // Power
  const power = useCallback(() => {
    setState((prev) => {
      if (prev.hasError) return prev;
      if (prev.expression === '') return prev;

      const newExpression = prev.expression + '^';
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
        justCalculated: false,
      };
    });
  }, []);

  // Memory functions
  const memoryClear = useCallback(() => {
    setState((prev) => ({ ...prev, memory: 0 }));
  }, []);

  const memoryRecall = useCallback(() => {
    setState((prev) => {
      if (prev.memory === 0) return prev;

      const memValue = formatNumber(prev.memory);
      
      if (prev.justCalculated || prev.expression === '') {
        return {
          ...prev,
          expression: memValue,
          displayValue: memValue,
          justCalculated: false,
        };
      }

      // If ends with operator, add memory value
      if (endsWithOperator(prev.expression)) {
        const newExpression = prev.expression + memValue;
        return {
          ...prev,
          expression: newExpression,
          displayValue: newExpression,
        };
      }

      // Otherwise replace or multiply
      const newExpression = prev.expression + '×' + memValue;
      return {
        ...prev,
        expression: newExpression,
        displayValue: newExpression,
      };
    });
  }, []);

  const memoryAdd = useCallback(() => {
    setState((prev) => {
      try {
        const currentValue = prev.expression ? evaluate(prev.expression) : 0;
        return {
          ...prev,
          memory: prev.memory + currentValue,
        };
      } catch {
        return prev;
      }
    });
  }, []);

  const memorySubtract = useCallback(() => {
    setState((prev) => {
      try {
        const currentValue = prev.expression ? evaluate(prev.expression) : 0;
        return {
          ...prev,
          memory: prev.memory - currentValue,
        };
      } catch {
        return prev;
      }
    });
  }, []);

  // Toggle second function mode
  const toggleSecondFunction = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isSecondFunction: !prev.isSecondFunction,
    }));
  }, []);

  // Load history entry
  const loadHistoryEntry = useCallback((entry: HistoryEntry) => {
    setState((prev) => ({
      ...prev,
      expression: entry.result,
      displayValue: entry.result,
      justCalculated: true,
      hasError: false,
    }));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      history: [],
    }));
  }, []);

  // Keyboard handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key;

    // Prevent default for calculator keys
    if (/^[0-9.+\-*\/^%()=]$/.test(key) || ['Enter', 'Backspace', 'Delete', 'Escape'].includes(key)) {
      event.preventDefault();
    }

    // Digits
    if (/^[0-9]$/.test(key)) {
      inputDigit(key);
      return;
    }

    // Decimal
    if (key === '.') {
      inputDecimal();
      return;
    }

    // Operators
    if (key === '+') { inputOperator('+'); return; }
    if (key === '-') { inputOperator('-'); return; }
    if (key === '*') { inputOperator('×'); return; }
    if (key === '/') { inputOperator('÷'); return; }
    if (key === '^') { power(); return; }
    if (key === '%') { percentage(); return; }

    // Parentheses
    if (key === '(') { inputParen('('); return; }
    if (key === ')') { inputParen(')'); return; }

    // Calculate
    if (key === 'Enter' || key === '=') {
      calculate();
      return;
    }

    // Backspace
    if (key === 'Backspace') {
      backspace();
      return;
    }

    // Clear
    if (key === 'Delete' || key === 'Escape') {
      clearAll();
      return;
    }
  }, [inputDigit, inputDecimal, inputOperator, inputParen, calculate, backspace, clearAll, power, percentage]);

  // Set up keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    state,
    inputDigit,
    inputDecimal,
    inputOperator,
    inputFunction,
    inputConstant,
    inputParen,
    calculate,
    clearEntry,
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
  };
}
