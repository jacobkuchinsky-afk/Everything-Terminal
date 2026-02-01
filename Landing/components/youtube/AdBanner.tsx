'use client'

import { useEffect, useState } from 'react'

interface AdBannerProps {
  position: 'top' | 'bottom'
}

declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdBanner({ position }: AdBannerProps) {
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
    <div className={`w-full px-4 ${position === 'top' ? 'pt-4' : 'pb-4'}`}>
      <div className="w-full max-w-[728px] h-[90px] mx-auto relative">
        {/* Placeholder shown when ad isn't loaded */}
        {!adLoaded && (
          <div className="ad-placeholder w-full h-full rounded-lg flex items-center justify-center">
            <span className="text-neutral-400 text-xs uppercase tracking-widest">Ad Space</span>
          </div>
        )}
        <ins
          className="adsbygoogle"
          style={{ display: adLoaded ? 'block' : 'none' }}
          data-ad-client="ca-pub-4605302973659792"
          data-ad-slot="REPLACE_WITH_YOUR_AD_SLOT_ID"
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  )
}
