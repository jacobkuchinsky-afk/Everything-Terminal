'use client';

import React from 'react';

interface ConvertButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ConvertButton: React.FC<ConvertButtonProps> = ({ onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-8 font-semibold text-base
        bg-cipher-primary text-white
        rounded-xl
        pro-glow
        transition-all duration-200
        ${disabled 
          ? 'opacity-40 cursor-not-allowed shadow-none' 
          : 'hover:bg-[#1a75ff] active:scale-[0.98]'
        }
      `}
    >
      Convert
    </button>
  );
};
