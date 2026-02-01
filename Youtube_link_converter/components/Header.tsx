'use client'

import { Youtube } from 'lucide-react'

export default function Header() {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yt-red rounded-lg">
          <Youtube className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-yt-text tracking-tight">
          YT<span className="text-yt-red">Convert</span>
        </span>
      </div>
    </header>
  )
}
