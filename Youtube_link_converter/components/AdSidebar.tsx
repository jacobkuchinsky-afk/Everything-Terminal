'use client'

interface AdSidebarProps {
  side: 'left' | 'right'
}

export default function AdSidebar({ side }: AdSidebarProps) {
  return (
    <div className={`hidden lg:flex flex-col gap-4 ${side === 'left' ? 'pr-4' : 'pl-4'}`}>
      <div className="ad-placeholder w-[160px] h-[600px] rounded-lg sticky top-8">
        <span className="rotate-90 whitespace-nowrap">Advertisement</span>
      </div>
    </div>
  )
}
