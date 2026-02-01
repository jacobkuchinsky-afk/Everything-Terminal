import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouTube Link to MP4 Converter | Free Online Video Downloader',
  description: 'Convert YouTube videos to MP4, MP3, WEBM, and M4A formats. Fast, free, and easy-to-use YouTube video downloader. No registration required.',
  keywords: 'YouTube converter, YouTube to MP4, YouTube downloader, video converter, MP3 converter, free YouTube download',
  authors: [{ name: 'YouTube Converter' }],
  openGraph: {
    title: 'YouTube Link to MP4 Converter',
    description: 'Convert YouTube videos to MP4, MP3, WEBM, and M4A formats. Fast, free, and easy-to-use.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Link to MP4 Converter',
    description: 'Convert YouTube videos to MP4, MP3, WEBM, and M4A formats.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-yt-bg text-yt-text min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
