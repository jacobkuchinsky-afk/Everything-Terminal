import { NextRequest, NextResponse } from 'next/server'

// Force redeploy - v6 - fallback to redirect service
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Extract video ID from YouTube URL
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  const format = searchParams.get('format') || 'mp4'
  
  // #region agent log
  console.log('[DEBUG-DL] download API called - v6, url:', url, 'format:', format);
  // #endregion
  
  try {
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    
    const isAudio = format === 'mp3' || format === 'm4a'
    
    // Use y2mate-style services that work via redirect
    // These services accept a YouTube URL and return a download page
    const downloadServices = [
      // ssyoutube - prepend "ss" before youtube in URL
      `https://www.ssyoutube.com/watch?v=${videoId}`,
      // y2mate
      `https://www.y2mate.com/youtube/${videoId}`,
      // savefrom
      `https://en.savefrom.net/1-youtube-video-downloader-2/?url=https://www.youtube.com/watch?v=${videoId}`
    ]
    
    // Try cobalt instances with new API format first
    const cobaltInstances = [
      'https://cobalt-backend.canine.tools',
      'https://cobalt.tskau.team',
      'https://dl.khyernet.xyz'
    ]
    
    for (const instance of cobaltInstances) {
      try {
        // #region agent log
        console.log('[DEBUG-DL] Trying cobalt instance:', instance);
        // #endregion
        
        const response = await fetch(instance, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://www.youtube.com/watch?v=${videoId}`,
            downloadMode: isAudio ? 'audio' : 'auto',
            audioFormat: 'mp3',
            videoQuality: '720'
          })
        })
        
        // #region agent log
        console.log('[DEBUG-DL] Response status:', response.status);
        // #endregion
        
        if (response.ok) {
          const data = await response.json()
          
          // #region agent log
          console.log('[DEBUG-DL] Response data:', JSON.stringify(data).substring(0, 300));
          // #endregion
          
          if (data.url) {
            return NextResponse.redirect(data.url)
          }
          if (data.status === 'redirect' && data.url) {
            return NextResponse.redirect(data.url)
          }
          if (data.status === 'tunnel' && data.url) {
            return NextResponse.redirect(data.url)
          }
          if (data.status === 'picker' && data.picker?.[0]?.url) {
            return NextResponse.redirect(data.picker[0].url)
          }
        }
      } catch (e) {
        // #region agent log
        console.log('[DEBUG-DL] Instance error:', instance, e instanceof Error ? e.message : e);
        // #endregion
      }
    }
    
    // #region agent log
    console.log('[DEBUG-DL] All cobalt instances failed, redirecting to download service');
    // #endregion
    
    // Fallback: redirect to a web-based download service
    // User will need to click download on that page
    return NextResponse.redirect(downloadServices[0])
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[DEBUG-DL] Error:', errorMessage)
    
    return NextResponse.json(
      { error: `Download failed: ${errorMessage}` },
      { status: 500 }
    )
  }
}
