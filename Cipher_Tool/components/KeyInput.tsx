'use client';

import React from 'react';
import type { CipherKey } from '@/lib/ciphers';

interface KeyInputProps {
  keyType: 'shift' | 'keyword' | 'rails' | 'affine';
  keyDescription: string;
  value: CipherKey;
  onChange: (key: CipherKey) => void;
}

export const KeyInput: React.FC<KeyInputProps> = ({ keyType, keyDescription, value, onChange }) => {
  const inputClass = "pro-border bg-cipher-card text-cipher-text px-4 py-3.5 font-mono rounded-xl w-full";
  const labelClass = "text-xs font-semibold uppercase tracking-wider text-cipher-text-muted";
  const hintClass = "text-xs text-cipher-text-muted/70 mt-1";

  if (keyType === 'shift') {
    return (
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Shift Key</label>
        <input
          type="number"
          min={1}
          max={25}
          value={value.shift ?? 3}
          onChange={(e) => onChange({ ...value, shift: parseInt(e.target.value) || 3 })}
          placeholder={keyDescription}
          className={inputClass}
        />
        <span className={hintClass}>{keyDescription}</span>
      </div>
    );
  }

  if (keyType === 'keyword') {
    return (
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Keyword</label>
        <input
          type="text"
          value={value.keyword ?? ''}
          onChange={(e) => onChange({ ...value, keyword: e.target.value })}
          placeholder="Enter keyword..."
          className={`${inputClass} uppercase`}
        />
        <span className={hintClass}>{keyDescription}</span>
      </div>
    );
  }

  if (keyType === 'rails') {
    return (
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Number of Rails</label>
        <input
          type="number"
          min={2}
          max={10}
          value={value.rails ?? 3}
          onChange={(e) => onChange({ ...value, rails: parseInt(e.target.value) || 3 })}
          placeholder={keyDescription}
          className={inputClass}
        />
        <span className={hintClass}>{keyDescription}</span>
      </div>
    );
  }

  if (keyType === 'affine') {
    return (
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Affine Keys</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              min={1}
              max={25}
              value={value.a ?? 5}
              onChange={(e) => onChange({ ...value, a: parseInt(e.target.value) || 5 })}
              placeholder="a"
              className={inputClass}
            />
            <span className={hintClass}>a value</span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              min={0}
              max={25}
              value={value.b ?? 8}
              onChange={(e) => onChange({ ...value, b: parseInt(e.target.value) || 8 })}
              placeholder="b"
              className={inputClass}
            />
            <span className={hintClass}>b value</span>
          </div>
        </div>
        <span className={hintClass}>{keyDescription}</span>
      </div>
    );
  }

  return null;
};
