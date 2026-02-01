'use client'

import { Download, Loader2 } from 'lucide-react'

interface ConvertButtonProps {
  disabled: boolean
  onClick: () => void
  loading?: boolean
}

export default function ConvertButton({ disabled, onClick, loading = false }: ConvertButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      onClick={onClick}
      className="btn-convert flex items-center justify-center gap-2 
                 py-3 px-8 bg-yt-red hover:bg-yt-red-dark
                 text-white font-bold text-lg rounded-xl
                 focus:outline-none focus:ring-2 focus:ring-yt-red focus:ring-offset-2 focus:ring-offset-yt-bg
                 min-w-[160px]"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Converting...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Convert
        </>
      )}
    </button>
  )
}
