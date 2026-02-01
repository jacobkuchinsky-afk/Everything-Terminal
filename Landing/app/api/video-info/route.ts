import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

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
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }
    
    // Get video info
    const info = await ytdl.getInfo(url)
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
        description: videoDetails.description || ''
      }
    })
    
  } catch (error) {
    console.error('Error fetching video info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video information. The video may be private or unavailable.' },
      { status: 500 }
    )
  }
}
