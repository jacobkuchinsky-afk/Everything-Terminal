'use client';

import React, { useState } from 'react';

interface TextAreaProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChange,
  readOnly = false,
  placeholder,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-cipher-text-muted">
          {label}
        </label>
        {readOnly && value && (
          <button
            onClick={handleCopy}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
              copied 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-cipher-card border border-cipher-border hover:border-cipher-border-hover hover:bg-cipher-card-hover text-cipher-text-muted hover:text-cipher-text'
            }`}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
      <div className="relative">
        <textarea
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`cipher-textarea w-full h-52 p-4 bg-cipher-card pro-border text-cipher-text placeholder-cipher-text-muted/50 rounded-xl ${
            readOnly ? 'cursor-default bg-cipher-dark/50' : ''
          } ${copied ? 'copy-flash' : ''}`}
        />
      </div>
    </div>
  );
};
