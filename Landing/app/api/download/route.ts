import { NextRequest, NextResponse } from 'next/server'

// Force redeploy - v5 - use public cobalt instance
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// #region agent log
console.log('[DEBUG] Landing download module loaded - v5');
// #endregion

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
  console.log('[DEBUG-DL] download API called - v5, url:', url, 'format:', format);
  // #endregion
  
  try {
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    const videoId = extractVideoId(url)
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`
    const isAudio = format === 'mp3' || format === 'm4a'
    
    // Try multiple public cobalt instances
    const cobaltInstances = [
      'https://co.wuk.sh/api/json',
      'https://cobalt.api.timelessnesses.me/api/json',
      'https://api.cobalt.best/api/json'
    ]
    
    const cobaltBody = {
      url: youtubeUrl,
      vCodec: 'h264',
      vQuality: '720',
      aFormat: isAudio ? 'mp3' : 'mp3',
      filenamePattern: 'basic',
      isAudioOnly: isAudio
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Cobalt request body:', JSON.stringify(cobaltBody));
    // #endregion
    
    let cobaltData: { status?: string; url?: string; error?: { code?: string }; text?: string; picker?: Array<{ type: string; url: string }> } | null = null
    let lastError = ''
    
    for (const instance of cobaltInstances) {
      try {
        // #region agent log
        console.log('[DEBUG-DL] Trying cobalt instance:', instance);
        // #endregion
        
        const cobaltResponse = await fetch(instance, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cobaltBody)
        })
        
        // #region agent log
        console.log('[DEBUG-DL] Instance response status:', cobaltResponse.status);
        // #endregion
        
        if (cobaltResponse.ok) {
          const text = await cobaltResponse.text()
          // #region agent log
          console.log('[DEBUG-DL] Instance response:', text.substring(0, 300));
          // #endregion
          
          cobaltData = JSON.parse(text)
          
          if (cobaltData?.status !== 'error') {
            break // Found a working instance
          }
          lastError = cobaltData?.error?.code || cobaltData?.text || 'Unknown error'
        }
      } catch (e) {
        // #region agent log
        console.log('[DEBUG-DL] Instance failed:', instance, e);
        // #endregion
        lastError = e instanceof Error ? e.message : 'Request failed'
      }
    }
    
    if (!cobaltData || cobaltData.status === 'error') {
      console.error('[DEBUG-DL] All cobalt instances failed, last error:', lastError)
      return NextResponse.json(
        { error: `Download service unavailable: ${lastError}` },
        { status: 503 }
      )
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Cobalt success, status:', cobaltData.status);
    // #endregion
    
    // Get the download URL from Cobalt response
    let downloadUrl = cobaltData.url
    
    // Handle picker response
    if (cobaltData.status === 'picker' && cobaltData.picker) {
      const picker = cobaltData.picker
      if (isAudio) {
        downloadUrl = picker.find((p) => p.type === 'audio')?.url || picker[0]?.url
      } else {
        downloadUrl = picker.find((p) => p.type === 'video')?.url || picker[0]?.url
      }
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Download URL exists:', !!downloadUrl);
    // #endregion
    
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Could not get download URL' },
        { status: 500 }
      )
    }
    
    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[DEBUG-DL] Uncaught error:', errorMessage)
    
    return NextResponse.json(
      { error: `Failed to download: ${errorMessage}` },
      { status: 500 }
    )
  }
}
