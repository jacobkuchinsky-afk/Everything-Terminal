import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

// Force redeploy - v8 - fix read-only filesystem
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// #region agent log
console.log('[DEBUG] download module loaded - v8');
// #endregion

// Sanitize filename
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
}

// Create agent with no file caching
const agent = ytdl.createAgent(undefined, {
  localAddress: undefined,
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const format = searchParams.get('format') || 'mp4'
  
  // #region agent log
  console.log('[DEBUG-DL] download called - v8, url:', url, 'format:', format);
  // #endregion
  
  try {
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Getting video info');
    // #endregion
    
    // Get video info
    const info = await ytdl.getInfo(url, {
      agent,
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      }
    })
    
    const title = sanitizeFilename(info.videoDetails.title)
    const isAudio = format === 'mp3' || format === 'm4a'
    
    // #region agent log
    console.log('[DEBUG-DL] Choosing format, isAudio:', isAudio);
    // #endregion
    
    // Select the appropriate format
    let selectedFormat
    
    if (isAudio) {
      selectedFormat = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly'
      })
    } else {
      // Try to get mp4 with video+audio
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
      // #region agent log
      console.log('[DEBUG-DL] No suitable format found');
      // #endregion
      return NextResponse.json(
        { error: 'No suitable format found for this video' },
        { status: 404 }
      )
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Selected format:', selectedFormat.qualityLabel || selectedFormat.audioBitrate);
    // #endregion
    
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
    
    // #region agent log
    console.log('[DEBUG-DL] Fetching stream from URL');
    // #endregion
    
    // Fetch the video/audio stream from YouTube
    const response = await fetch(selectedFormat.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Range': 'bytes=0-'
      }
    })
    
    if (!response.ok || !response.body) {
      // #region agent log
      console.log('[DEBUG-DL] Stream fetch failed:', response.status);
      // #endregion
      return NextResponse.json(
        { error: 'Failed to fetch video stream' },
        { status: 500 }
      )
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Returning stream response');
    // #endregion
    
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
    console.error('[DEBUG-DL] Error:', errorMessage)
    
    return NextResponse.json(
      { error: `Failed to download: ${errorMessage}` },
      { status: 500 }
    )
  }
}
