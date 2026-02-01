import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

// Sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const format = searchParams.get('format') || 'mp4'
    
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
    const title = sanitizeFilename(info.videoDetails.title)
    
    const isAudio = format === 'mp3' || format === 'm4a'
    
    // Select the appropriate format
    let selectedFormat
    
    if (isAudio) {
      // Get best audio format
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly'
      })
    } else {
      // Get best video+audio format (mp4 preferred)
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highest',
        filter: (f) => f.container === 'mp4' && f.hasVideo && f.hasAudio
      })
      
      // Fallback to any format with video+audio
      if (!selectedFormat) {
        selectedFormat = ytdl.chooseFormat(info.formats, {
          quality: 'highest',
          filter: 'videoandaudio'
        })
      }
    }
    
    if (!selectedFormat || !selectedFormat.url) {
      return NextResponse.json(
        { error: 'No suitable format found for this video' },
        { status: 404 }
      )
    }
    
    // Determine content type and extension
    let contentType: string
    let extension: string
    
    switch (format) {
      case 'mp3':
        contentType = 'audio/mpeg'
        extension = 'mp3'
        break
      case 'm4a':
        contentType = 'audio/mp4'
        extension = 'm4a'
        break
      case 'webm':
        contentType = 'video/webm'
        extension = 'webm'
        break
      case 'mp4':
      default:
        contentType = selectedFormat.mimeType?.split(';')[0] || 'video/mp4'
        extension = 'mp4'
    }
    
    const filename = `${title}.${extension}`
    
    // Fetch the video/audio stream from YouTube
    const response = await fetch(selectedFormat.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': 'bytes=0-'
      }
    })
    
    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: 'Failed to fetch video stream' },
        { status: 500 }
      )
    }
    
    // Return the stream response
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': selectedFormat.contentLength || response.headers.get('Content-Length') || '',
        'Cache-Control': 'no-cache',
        'Accept-Ranges': 'bytes'
      }
    })
    
  } catch (error) {
    console.error('Error downloading video:', error)
    return NextResponse.json(
      { error: 'Failed to download video. The video may be private, age-restricted, or unavailable.' },
      { status: 500 }
    )
  }
}
