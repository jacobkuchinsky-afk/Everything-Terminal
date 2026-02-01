'use client'

interface AdPlaceholderProps {
  variant: 'banner' | 'sidebar'
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export default function AdPlaceholder({ variant, position, className = '' }: AdPlaceholderProps) {
  if (variant === 'banner') {
    return (
      <div className={`w-full px-4 ${position === 'top' ? 'pt-4' : 'pb-4'} ${className}`}>
        <div className="w-full max-w-[728px] h-[90px] mx-auto ad-placeholder rounded-lg flex items-center justify-center">
          <span className="text-neutral-500 text-xs uppercase tracking-widest">Ad Space</span>
        </div>
      </div>
    )
  }

  if (variant === 'sidebar') {
    return (
      <div className={`hidden lg:flex flex-col gap-4 ${position === 'left' ? 'pr-4' : 'pl-4'} ${className}`}>
        <div className="w-[160px] h-[600px] sticky top-8 ad-placeholder rounded-lg flex flex-col items-center justify-center gap-2">
          <span className="text-neutral-500 text-xs uppercase tracking-widest">Ad</span>
          <span className="text-neutral-500 text-xs uppercase tracking-widest">Space</span>
        </div>
      </div>
    )
  }

  return null
}
