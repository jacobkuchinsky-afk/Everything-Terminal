'use client'

import { useEffect, useState } from 'react'

interface AdSidebarProps {
  side: 'left' | 'right'
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdSidebar({ side }: AdSidebarProps) {
  const [adLoaded, setAdLoaded] = useState(false)

  useEffect(() => {
    try {
      if (window.adsbygoogle && window.adsbygoogle.length > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
        setAdLoaded(true)
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [])

  return (
    <div className={`hidden lg:flex flex-col gap-4 ${side === 'left' ? 'pr-4' : 'pl-4'}`}>
      <div className="w-[160px] h-[600px] sticky top-8 relative">
        {/* Placeholder shown when ad isn't loaded */}
        {!adLoaded && (
          <div className="ad-placeholder w-full h-full rounded-lg flex flex-col items-center justify-center gap-2">
            <span className="text-yt-text-muted text-xs uppercase tracking-widest">Ad</span>
            <span className="text-yt-text-muted text-xs uppercase tracking-widest">Space</span>
          </div>
        )}
        <ins
          className="adsbygoogle"
          style={{ display: adLoaded ? 'block' : 'none' }}
          data-ad-client="ca-pub-4605302973659792"
          data-ad-slot="REPLACE_WITH_YOUR_AD_SLOT_ID"
          data-ad-format="vertical"
        />
      </div>
    </div>
  )
}
