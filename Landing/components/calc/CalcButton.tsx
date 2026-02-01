'use client';

import React from 'react';

export type ButtonVariant = 'number' | 'operator' | 'function' | 'memory' | 'special' | 'equals' | '2nd';

interface CalcButtonProps {
  label: string;
  secondLabel?: string;
  variant?: ButtonVariant;
  onClick: () => void;
  isActive?: boolean;
  span?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CalcButton: React.FC<CalcButtonProps> = ({
  label,
  secondLabel,
  variant = 'number',
  onClick,
  isActive = false,
  span = 1,
  disabled = false,
  size = 'md',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'number':
        return 'calc-btn-number';
      case 'operator':
        return 'calc-btn-operator';
      case 'function':
        return 'calc-btn-function';
      case 'memory':
        return 'calc-btn-memory';
      case 'special':
        return 'calc-btn-special';
      case 'equals':
        return 'calc-btn-equals';
      case '2nd':
        return `calc-btn-2nd ${isActive ? 'active' : ''}`;
      default:
        return 'calc-btn-number';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-10 text-xs';
      case 'lg':
        return 'h-16 text-lg';
      default:
        return 'h-[52px]';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        calc-btn
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${span === 2 ? 'col-span-2' : ''}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {secondLabel && (
        <span className="absolute top-1 right-1.5 text-[8px] text-calc-textMuted opacity-60">
          {secondLabel}
        </span>
      )}
      {label}
    </button>
  );
};
