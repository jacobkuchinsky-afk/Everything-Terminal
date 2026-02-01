import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'

// Force redeploy - v7 - back to ytdl-core
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// #region agent log
console.log('[DEBUG] video-info module loaded - v7 (ytdl-core)');
// #endregion

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
  
  // #region agent log
  console.log('[DEBUG-VI] video-info called - v7, url:', url);
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
    console.log('[DEBUG-VI] Fetching video info with ytdl-core');
    // #endregion
    
    // Get video info with custom request options
    const info = await ytdl.getInfo(url, {
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      }
    })
    
    const { videoDetails } = info
    
    // #region agent log
    console.log('[DEBUG-VI] Got video info, title:', videoDetails.title);
    // #endregion
    
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
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[DEBUG-VI] Error:', errorMessage)
    
    return NextResponse.json(
      { error: `Failed to fetch video info: ${errorMessage}` },
      { status: 500 }
    )
  }
}
