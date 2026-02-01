'use client'

interface AdBannerProps {
  position: 'top' | 'bottom'
}

export default function AdBanner({ position }: AdBannerProps) {
  return (
    <div className={`w-full px-4 ${position === 'top' ? 'pt-4' : 'pb-4'}`}>
      <div className="ad-placeholder w-full max-w-[728px] h-[90px] mx-auto rounded-lg">
        <span>Advertisement</span>
      </div>
    </div>
  )
}
