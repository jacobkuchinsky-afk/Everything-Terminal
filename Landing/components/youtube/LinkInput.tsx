'use client'

import { Link2 } from 'lucide-react'

interface LinkInputProps {
  value: string
  onChange: (value: string) => void
}

export default function LinkInput({ value, onChange }: LinkInputProps) {
  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yt-text-muted">
        <Link2 className="w-5 h-5" />
      </div>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your YouTube link here..."
        className="w-full py-4 pl-12 pr-4 bg-yt-bg border-2 border-yt-border rounded-xl 
                   text-yt-text placeholder:text-yt-text-muted
                   focus:outline-none focus:border-yt-red input-glow
                   transition-colors duration-200 text-lg"
      />
    </div>
  )
}
