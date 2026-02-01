'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import LinkInput from '@/components/youtube/LinkInput'
import FormatSelector from '@/components/youtube/FormatSelector'
import ConvertButton from '@/components/youtube/ConvertButton'
import VideoPreview, { VideoInfo } from '@/components/youtube/VideoPreview'

type Status = 'idle' | 'fetching' | 'ready' | 'downloading' | 'error'

export default function ConverterCard() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState('mp4')
  const [status, setStatus] = useState<Status>('idle')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if URL looks like a valid YouTube URL
  const isValidUrl = url.includes('youtube.com') || url.includes('youtu.be')

  // Fetch video info when URL changes (debounced)
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
      // Fetch from our API (using ytdl-core on server)
      const response = await fetch(`/api/video-info?url=${encodeURIComponent(videoUrl)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch video info')
      }

      setVideoInfo(data.video)
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

  // Handle download
  const handleConvert = async () => {
    if (!videoInfo || !url) return

    setStatus('downloading')
    setError(null)

    try {
      // Create download URL
      const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&format=${format}`
      
      // Open in new tab to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `${videoInfo.title}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Show success briefly then reset to ready
      setTimeout(() => {
        setStatus('ready')
      }, 2000)
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

      {/* Download status */}
      {status === 'downloading' && (
        <div className="flex items-center justify-center gap-2 text-yt-red mt-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Starting download...</span>
        </div>
      )}

      {/* Helper text */}
      <p className="text-yt-text-muted text-sm text-center mt-6">
        Supports YouTube, YouTube Shorts, and YouTube Music links
      </p>
    </div>
  )
}
