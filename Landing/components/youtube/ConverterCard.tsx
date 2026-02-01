'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import LinkInput from '@/components/youtube/LinkInput'
import FormatSelector from '@/components/youtube/FormatSelector'
import ConvertButton from '@/components/youtube/ConvertButton'
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

  // Check if URL looks like a valid YouTube URL
  const isValidUrl = url.includes('youtube.com') || url.includes('youtu.be')

  // Fetch video info entirely from client-side (user's browser IP won't be blocked)
  const fetchVideoInfo = useCallback(async (videoUrl: string) => {
    if (!videoUrl || !isValidUrl) {
      setVideoInfo(null)
      setStatus('idle')
      setError(null)
      return
    }

    setStatus('fetching')
    setError(null)

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
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [url, isValidUrl, fetchVideoInfo])

  // Handle download - redirect to external download service
  const handleConvert = async () => {
    if (!videoInfo || !url) return

    setStatus('downloading')
    setError(null)

    const videoId = videoInfo.id
    
    // Use y2mate which is still operational
    // It will open in a new tab where user can download
    const downloadUrl = `https://www.y2mate.com/youtube/${videoId}`
    
    // Open in new tab
    window.open(downloadUrl, '_blank')
    
    // Reset status after a moment
    setTimeout(() => {
      setStatus('ready')
    }, 1000)
  }

  // Handle URL change
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    if (!newUrl) {
      setVideoInfo(null)
      setStatus('idle')
      setError(null)
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
        <ConvertButton 
          disabled={status !== 'ready' || !videoInfo} 
          onClick={handleConvert}
          loading={status === 'downloading'}
        />
      </div>

      {/* Download note */}
      {videoInfo && (
        <div className="flex items-center justify-center gap-2 text-yt-text-muted text-sm mt-4">
          <ExternalLink className="w-4 h-4" />
          <span>Opens download page in new tab</span>
        </div>
      )}

      {/* Helper text */}
      <p className="text-yt-text-muted text-sm text-center mt-6">
        Supports YouTube, YouTube Shorts, and YouTube Music links
      </p>
    </div>
  )
}
