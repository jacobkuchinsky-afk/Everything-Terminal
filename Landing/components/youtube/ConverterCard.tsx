'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, Download } from 'lucide-react'
import LinkInput from '@/components/youtube/LinkInput'
import FormatSelector from '@/components/youtube/FormatSelector'
import VideoPreview, { VideoInfo } from '@/components/youtube/VideoPreview'

type Status = 'idle' | 'fetching' | 'ready' | 'downloading' | 'error'

// Extract video ID from YouTube URL (client-side)
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default function ConverterCard() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('mp4')
  const [status, setStatus] = useState<Status>('idle')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  // Check if URL looks like a valid YouTube URL
  const isValidUrl = url.includes('youtube.com') || url.includes('youtu.be')

  // Fetch video info entirely from client-side (user's browser IP won't be blocked)
  const fetchVideoInfo = useCallback(async (videoUrl: string) => {
    if (!videoUrl || !isValidUrl) {
      setVideoInfo(null)
      setStatus('idle')
      setError(null)
      setDownloadUrl(null)
      return
    }

    setStatus('fetching')
    setError(null)
    setDownloadUrl(null)

    try {
      const videoId = extractVideoId(videoUrl)
      
      if (!videoId) {
        throw new Error('Invalid YouTube URL')
      }

      // Fetch oEmbed data directly from client (user's IP, not blocked)
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      const response = await fetch(oembedUrl)
      
      if (!response.ok) {
        throw new Error('Video not found or unavailable')
      }

      const data = await response.json()

      setVideoInfo({
        id: videoId,
        title: data.title || 'Unknown Title',
        author: data.author_name || 'Unknown',
        duration: 'N/A',
        durationSeconds: 0,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        views: 0,
        description: ''
      })
      setStatus('ready')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch video info')
      setVideoInfo(null)
      setStatus('error')
    }
  }, [isValidUrl])

  // Debounce the URL input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url && isValidUrl) {
        fetchVideoInfo(url)
      } else {
        setVideoInfo(null)
        setStatus('idle')
        setError(null)
        setDownloadUrl(null)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [url, isValidUrl, fetchVideoInfo])

  // Handle convert - call Railway Python backend
  const handleConvert = async () => {
    if (!videoInfo || !url) return

    setStatus('downloading')
    setError(null)
    setDownloadUrl(null)

    const videoId = videoInfo.id
    const fullYouTubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    
    // Railway backend URL
    const backendUrl = 'https://everything-terminal-production.up.railway.app'

    try {
      // Call Railway Python backend
      const apiUrl = `${backendUrl}/api/download?url=${encodeURIComponent(fullYouTubeUrl)}&format=${format}`
      console.log('[DEBUG] Calling:', apiUrl)
      const response = await fetch(apiUrl)
      console.log('[DEBUG] Response status:', response.status)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Download failed')
      }

      if (data.download_url) {
        setDownloadUrl(data.download_url)
        setStatus('ready')
        
        // Open download URL in new tab
        window.open(data.download_url, '_blank')
      } else {
        throw new Error('No download URL available')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
      setStatus('error')
    }
  }

  // Handle URL change
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    if (!newUrl) {
      setVideoInfo(null)
      setStatus('idle')
      setError(null)
      setDownloadUrl(null)
    }
  }

  return (
    <div className="converter-card w-full max-w-2xl mx-auto p-8 md:p-10 rounded-2xl">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-black text-center mb-2 tracking-tight text-yt-text">
        Youtube link to <span className="text-yt-red">mp4</span>
      </h1>
      
      {/* Subtitle */}
      <p className="text-yt-text-muted text-center mb-8">
        Fast, free, and easy video conversion
      </p>

      {/* Input */}
      <div className="mb-6">
        <LinkInput value={url} onChange={handleUrlChange} />
      </div>

      {/* Loading indicator */}
      {status === 'fetching' && (
        <div className="flex items-center justify-center gap-2 text-yt-text-muted mb-6">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Fetching video info...</span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center justify-center gap-2 text-red-500 mb-6 p-3 bg-red-500/10 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Video Preview */}
      {videoInfo && status !== 'fetching' && (
        <VideoPreview video={videoInfo} />
      )}

      {/* Format selector and convert button */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <FormatSelector value={format} onChange={setFormat} />
        <button
          onClick={handleConvert}
          disabled={status !== 'ready' || !videoInfo}
          className="px-8 py-3 bg-yt-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all flex items-center gap-2"
        >
          {status === 'downloading' ? (
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
      </div>

      {/* Download link if available */}
      {downloadUrl && (
        <div className="mt-4 p-4 bg-green-500/10 rounded-lg text-center">
          <p className="text-green-400 mb-2">Download ready!</p>
          <a 
            href={downloadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-yt-red hover:underline"
          >
            Click here if download didn&apos;t start automatically
          </a>
        </div>
      )}

      {/* Helper text */}
      <p className="text-yt-text-muted text-sm text-center mt-6">
        Supports YouTube, YouTube Shorts, and YouTube Music links
      </p>
    </div>
  )
}
