import Link from 'next/link'
import Header from '@/components/youtube/Header'
import AdBanner from '@/components/youtube/AdBanner'
import AdSidebar from '@/components/youtube/AdSidebar'
import ConverterCard from '@/components/youtube/ConverterCard'

export default function YouTubePage() {
  return (
    <div className="min-h-screen flex flex-col bg-yt-bg">
      {/* Back to Home */}
      <Link 
        href="/" 
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-yt-card/80 backdrop-blur border border-yt-border rounded-lg text-yt-text-muted hover:text-yt-text hover:border-yt-red/50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm">Home</span>
      </Link>
      
      {/* Header */}
      <Header />

      {/* Top Banner Ad */}
      <AdBanner position="top" />

      {/* Main Content Area with Sidebars */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="flex items-start justify-center w-full max-w-7xl">
          {/* Left Sidebar Ad */}
          <AdSidebar side="left" />

          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center max-w-3xl">
            <ConverterCard />
          </div>

          {/* Right Sidebar Ad */}
          <AdSidebar side="right" />
        </div>
      </main>

      {/* Bottom Banner Ad */}
      <AdBanner position="bottom" />

      {/* Footer */}
      <footer className="py-6 text-center text-yt-text-muted text-sm border-t border-yt-border">
        <p>© 2026 YTConvert. For personal use only.</p>
        <p className="mt-1 text-xs">
          We do not host any videos. All content belongs to their respective owners.
        </p>
      </footer>
    </div>
  )
}
