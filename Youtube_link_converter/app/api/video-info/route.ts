import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Format duration from seconds to MM:SS or HH:MM:SS
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  console.log('[video-info] Request received for URL:', url)
  
  try {
    if (!url) {
      console.log('[video-info] Error: No URL provided')
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      console.log('[video-info] Error: Invalid YouTube URL')
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }
    
    console.log('[video-info] Fetching info from YouTube...')
    
    // Get video info with custom agent options
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }
    })
    
    console.log('[video-info] Successfully fetched video info')
    
    const { videoDetails } = info
    
    // Get best thumbnail
    const thumbnails = videoDetails.thumbnails
    const thumbnail = thumbnails[thumbnails.length - 1]?.url || ''
    
    return NextResponse.json({
      success: true,
      video: {
        id: videoDetails.videoId,
        title: videoDetails.title,
        author: videoDetails.author.name,
        duration: formatDuration(parseInt(videoDetails.lengthSeconds)),
        durationSeconds: parseInt(videoDetails.lengthSeconds),
        thumbnail: thumbnail,
        views: parseInt(videoDetails.viewCount) || 0,
        description: videoDetails.shortDescription || ''
      }
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    
    console.error('[video-info] Error:', errorMessage)
    console.error('[video-info] Stack:', errorStack)
    
    // Return more specific error messages
    if (errorMessage.includes('Sign in to confirm your age')) {
      return NextResponse.json(
        { error: 'This video is age-restricted and cannot be downloaded.' },
        { status: 403 }
      )
    }
    
    if (errorMessage.includes('private video')) {
      return NextResponse.json(
        { error: 'This video is private and cannot be accessed.' },
        { status: 403 }
      )
    }
    
    if (errorMessage.includes('Video unavailable')) {
      return NextResponse.json(
        { error: 'This video is unavailable.' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: `Failed to fetch video information: ${errorMessage}` },
      { status: 500 }
    )
  }
}
