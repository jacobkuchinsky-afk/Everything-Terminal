'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import LinkInput from './LinkInput'
import FormatSelector from './FormatSelector'
import ConvertButton from './ConvertButton'
import VideoPreview, { VideoInfo } from './VideoPreview'

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
  // Now fetches oEmbed directly from client to avoid YouTube blocking server IPs
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
      // #region agent log
      console.log('[DEBUG-CLIENT] Fetching video info for:', videoUrl);
      // #endregion
      
      // Step 1: Get video ID from our API (just extracts ID, no YouTube request)
      const apiResponse = await fetch(`/api/video-info?url=${encodeURIComponent(videoUrl)}`)
      const apiData = await apiResponse.json()

      if (!apiResponse.ok) {
        throw new Error(apiData.error || 'Invalid YouTube URL')
      }

      // #region agent log
      console.log('[DEBUG-CLIENT] Got videoId:', apiData.videoId);
      // #endregion

      // Step 2: Fetch oEmbed directly from client (browser IP won't be blocked)
      const oembedResponse = await fetch(apiData.oembedUrl)
      
      // #region agent log
      console.log('[DEBUG-CLIENT] oEmbed response status:', oembedResponse.status);
      // #endregion
      
      if (!oembedResponse.ok) {
        throw new Error('Video not found or unavailable')
      }

      const oembedData = await oembedResponse.json()
      
      // #region agent log
      console.log('[DEBUG-CLIENT] oEmbed data received, title:', oembedData.title);
      // #endregion

      // Combine the data
      setVideoInfo({
        id: apiData.videoId,
        title: oembedData.title || 'Unknown Title',
        author: oembedData.author_name || 'Unknown',
        duration: 'N/A',
        durationSeconds: 0,
        thumbnail: apiData.thumbnail,
        views: 0,
        description: ''
      })
      setStatus('ready')
    } catch (err) {
      // #region agent log
      console.log('[DEBUG-CLIENT] Error:', err);
      // #endregion
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
      // Create download URL - Cobalt API handles the actual download
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
      <h1 className="text-3xl md:text-4xl font-black text-center mb-2 tracking-tight">
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
