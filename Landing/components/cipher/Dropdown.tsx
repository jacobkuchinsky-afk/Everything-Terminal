'use client';

import React from 'react';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-wider text-cipher-text-muted">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="dropdown-arrow pro-border bg-cipher-card text-cipher-text px-4 py-3.5 font-medium cursor-pointer rounded-xl"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-cipher-dark">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
