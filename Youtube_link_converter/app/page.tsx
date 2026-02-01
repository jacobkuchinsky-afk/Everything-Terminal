import Header from '@/components/Header'
import AdBanner from '@/components/AdBanner'
import AdSidebar from '@/components/AdSidebar'
import ConverterCard from '@/components/ConverterCard'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-yt-bg">
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
