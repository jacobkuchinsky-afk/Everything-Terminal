import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

// Force Node.js runtime (not Edge)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Increase timeout for large video downloads
export const maxDuration = 60

// Sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const format = searchParams.get('format') || 'mp4'
  
  console.log('[download] Request received - URL:', url, 'Format:', format)
  
  try {
    if (!url) {
      console.log('[download] Error: No URL provided')
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      console.log('[download] Error: Invalid YouTube URL')
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }
    
    console.log('[download] Fetching video info...')
    
    // Get video info
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      }
    })
    
    const title = sanitizeFilename(info.videoDetails.title)
    console.log('[download] Video title:', title)
    
    const isAudio = format === 'mp3' || format === 'm4a'
    
    // Select the appropriate format
    let selectedFormat
    
    if (isAudio) {
      console.log('[download] Selecting audio format...')
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly'
      })
    } else {
      console.log('[download] Selecting video format...')
      // Get best video+audio format (mp4 preferred)
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highest',
        filter: (f) => f.container === 'mp4' && f.hasVideo && f.hasAudio
      })
      
      // Fallback to any format with video+audio
      if (!selectedFormat) {
        console.log('[download] No MP4 found, trying fallback...')
        selectedFormat = ytdl.chooseFormat(info.formats, {
          quality: 'highest',
          filter: 'videoandaudio'
        })
      }
    }
    
    if (!selectedFormat || !selectedFormat.url) {
      console.log('[download] Error: No suitable format found')
      return NextResponse.json(
        { error: 'No suitable format found for this video' },
        { status: 404 }
      )
    }
    
    console.log('[download] Selected format:', selectedFormat.qualityLabel || selectedFormat.audioBitrate, 'Container:', selectedFormat.container)
    
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
    console.log('[download] Streaming file:', filename)
    
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
      console.log('[download] Error: Failed to fetch stream, status:', response.status)
      return NextResponse.json(
        { error: 'Failed to fetch video stream' },
        { status: 500 }
      )
    }
    
    console.log('[download] Stream started successfully')
    
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
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    
    console.error('[download] Error:', errorMessage)
    console.error('[download] Stack:', errorStack)
    
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
    
    return NextResponse.json(
      { error: `Failed to download video: ${errorMessage}` },
      { status: 500 }
    )
  }
}
