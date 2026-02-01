import { NextRequest, NextResponse } from 'next/server'

// Force redeploy - v4 - more debug logging for Cobalt
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

// #region agent log
console.log('[DEBUG] Landing download module loaded - v4');
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
  console.log('[DEBUG-DL-H1] download API called - v4, url:', url, 'format:', format);
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
    
    // #region agent log
    console.log('[DEBUG-DL-H2] Calling Cobalt API for:', youtubeUrl);
    // #endregion
    
    // Use Cobalt API for downloading
    const cobaltBody = {
      url: youtubeUrl,
      downloadMode: isAudio ? 'audio' : 'auto',
      audioFormat: isAudio ? 'mp3' : undefined,
      videoQuality: '720',
      filenameStyle: 'basic'
    }
    
    // #region agent log
    console.log('[DEBUG-DL-H2] Cobalt request body:', JSON.stringify(cobaltBody));
    // #endregion
    
    const cobaltResponse = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cobaltBody)
    })
    
    // #region agent log
    console.log('[DEBUG-DL-H1] Cobalt response status:', cobaltResponse.status, 'ok:', cobaltResponse.ok);
    // #endregion
    
    const cobaltText = await cobaltResponse.text()
    
    // #region agent log
    console.log('[DEBUG-DL-H2] Cobalt raw response:', cobaltText.substring(0, 500));
    // #endregion
    
    if (!cobaltResponse.ok) {
      console.error('[DEBUG-DL-H1] Cobalt API error status:', cobaltResponse.status)
      return NextResponse.json(
        { error: `Download service error: ${cobaltResponse.status}` },
        { status: 503 }
      )
    }
    
    let cobaltData
    try {
      cobaltData = JSON.parse(cobaltText)
    } catch (e) {
      console.error('[DEBUG-DL-H2] Failed to parse Cobalt response:', e)
      return NextResponse.json(
        { error: 'Invalid response from download service' },
        { status: 500 }
      )
    }
    
    // #region agent log
    console.log('[DEBUG-DL-H3] Cobalt data status:', cobaltData.status, 'keys:', Object.keys(cobaltData));
    // #endregion
    
    if (cobaltData.status === 'error') {
      console.error('[DEBUG-DL-H3] Cobalt error:', cobaltData.error)
      return NextResponse.json(
        { error: cobaltData.error?.code || cobaltData.text || 'Failed to process video' },
        { status: 400 }
      )
    }
    
    // Get the download URL from Cobalt response
    let downloadUrl = cobaltData.url
    
    // Handle different response types
    if (cobaltData.status === 'picker' && cobaltData.picker) {
      // #region agent log
      console.log('[DEBUG-DL-H4] Picker response, items:', cobaltData.picker.length);
      // #endregion
      const picker = cobaltData.picker
      if (isAudio) {
        downloadUrl = picker.find((p: { type: string }) => p.type === 'audio')?.url || picker[0]?.url
      } else {
        downloadUrl = picker.find((p: { type: string }) => p.type === 'video')?.url || picker[0]?.url
      }
    } else if (cobaltData.status === 'redirect' || cobaltData.status === 'tunnel') {
      downloadUrl = cobaltData.url
    } else if (cobaltData.status === 'stream') {
      downloadUrl = cobaltData.url
    }
    
    // #region agent log
    console.log('[DEBUG-DL-H4] Final download URL exists:', !!downloadUrl, 'length:', downloadUrl?.length || 0);
    // #endregion
    
    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Could not get download URL from service' },
        { status: 500 }
      )
    }
    
    // #region agent log
    console.log('[DEBUG-DL] Redirecting to download URL');
    // #endregion
    
    // Redirect to the download URL
    return NextResponse.redirect(downloadUrl)
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    console.error('[DEBUG-DL-H5] Uncaught error:', errorMessage)
    console.error('[DEBUG-DL-H5] Stack:', errorStack)
    
    return NextResponse.json(
      { error: `Failed to download: ${errorMessage}` },
      { status: 500 }
    )
  }
}
