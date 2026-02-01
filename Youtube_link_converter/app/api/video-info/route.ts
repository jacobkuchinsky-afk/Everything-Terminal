import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// #region agent log
console.log('[DEBUG-H6] video-info module loaded at:', new Date().toISOString());
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
  // #region agent log - FIRST LINE OF FUNCTION
  console.log('[DEBUG-H6] ===== FUNCTION INVOKED =====');
  console.log('[DEBUG-H8] Request URL:', request.url);
  // #endregion
  
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    // #region agent log
    console.log('[DEBUG-H1] video-info called with url:', url);
    // #endregion
    
    if (!url) {
      console.log('[DEBUG] No URL provided, returning 400');
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    const videoId = extractVideoId(url)
    
    // #region agent log
    console.log('[DEBUG-H2] Extracted videoId:', videoId, 'from url:', url);
    // #endregion
    
    if (!videoId) {
      console.log('[DEBUG-H2] FAILED: videoId is null, returning 400');
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    
    // Use YouTube oEmbed API for basic info
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    
    // #region agent log
    console.log('[DEBUG-H3] Fetching oEmbed URL:', oembedUrl);
    // #endregion
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    // #region agent log
    console.log('[DEBUG-H1-H3] oEmbed response status:', response.status, 'ok:', response.ok);
    // #endregion
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('[DEBUG-H1] oEmbed BLOCKED/FAILED. Status:', response.status, 'Body:', errorText.substring(0, 500));
      return NextResponse.json(
        { error: 'Video not found or unavailable' },
        { status: 404 }
      )
    }
    
    const responseText = await response.text()
    
    // #region agent log
    console.log('[DEBUG-H4] oEmbed response text length:', responseText.length);
    // #endregion
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log('[DEBUG-H4] Parsed successfully, title:', data.title);
    } catch (parseError) {
      console.log('[DEBUG-H4] JSON parse FAILED:', parseError);
      return NextResponse.json({ error: 'Failed to parse video data' }, { status: 500 })
    }
    
    console.log('[DEBUG] Returning success response');
    return NextResponse.json({
      success: true,
      video: {
        id: videoId,
        title: data.title || 'Unknown Title',
        author: data.author_name || 'Unknown',
        duration: 'N/A',
        durationSeconds: 0,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        views: 0,
        description: ''
      }
    })
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    
    // #region agent log
    console.log('[DEBUG-H5] UNCAUGHT ERROR:', errorMessage);
    console.log('[DEBUG-H5] Stack:', errorStack);
    // #endregion
    
    return NextResponse.json(
      { error: `Failed to fetch video information: ${errorMessage}` },
      { status: 500 }
    )
  }
}
