import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

// Format duration from ISO 8601 or seconds
function formatDuration(duration: string | number): string {
  if (typeof duration === 'number') {
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const secs = duration % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  return duration || '0:00'
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  // #region agent log
  console.log('[DEBUG-H1] video-info called with url:', url);
  fetch('http://127.0.0.1:7247/ingest/49f0dc33-bebf-44a3-b728-c2694e495afc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'video-info/route.ts:38',message:'API called',data:{url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  try {
    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }
    
    const videoId = extractVideoId(url)
    
    // #region agent log
    console.log('[DEBUG-H2] Extracted videoId:', videoId, 'from url:', url);
    fetch('http://127.0.0.1:7247/ingest/49f0dc33-bebf-44a3-b728-c2694e495afc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'video-info/route.ts:50',message:'Video ID extraction',data:{videoId,url},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    
    if (!videoId) {
      // #region agent log
      console.log('[DEBUG-H2] FAILED: videoId is null');
      // #endregion
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }
    
    // Use YouTube oEmbed API for basic info (doesn't get blocked)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    
    // #region agent log
    console.log('[DEBUG-H3] Fetching oEmbed URL:', oembedUrl);
    fetch('http://127.0.0.1:7247/ingest/49f0dc33-bebf-44a3-b728-c2694e495afc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'video-info/route.ts:65',message:'Before oEmbed fetch',data:{oembedUrl},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    // #region agent log
    console.log('[DEBUG-H1-H3] oEmbed response status:', response.status, 'ok:', response.ok);
    fetch('http://127.0.0.1:7247/ingest/49f0dc33-bebf-44a3-b728-c2694e495afc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'video-info/route.ts:76',message:'oEmbed response received',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1-H3'})}).catch(()=>{});
    // #endregion
    
    if (!response.ok) {
      // #region agent log
      const errorText = await response.text();
      console.log('[DEBUG-H1] oEmbed BLOCKED/FAILED. Status:', response.status, 'Body:', errorText);
      // #endregion
      return NextResponse.json(
        { error: 'Video not found or unavailable' },
        { status: 404 }
      )
    }
    
    const responseText = await response.text()
    
    // #region agent log
    console.log('[DEBUG-H4] oEmbed response text length:', responseText.length, 'preview:', responseText.substring(0, 200));
    fetch('http://127.0.0.1:7247/ingest/49f0dc33-bebf-44a3-b728-c2694e495afc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'video-info/route.ts:93',message:'oEmbed response text',data:{length:responseText.length,preview:responseText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      // #region agent log
      console.log('[DEBUG-H4] JSON parse FAILED:', parseError);
      // #endregion
      return NextResponse.json({ error: 'Failed to parse video data' }, { status: 500 })
    }
    
    // #region agent log
    console.log('[DEBUG-H4] Parsed data:', JSON.stringify(data).substring(0, 300));
    // #endregion
    
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
    console.log('[DEBUG-H5] UNCAUGHT ERROR:', errorMessage, 'Stack:', errorStack);
    fetch('http://127.0.0.1:7247/ingest/49f0dc33-bebf-44a3-b728-c2694e495afc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'video-info/route.ts:130',message:'Uncaught error',data:{errorMessage,errorStack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    return NextResponse.json(
      { error: `Failed to fetch video information: ${errorMessage}` },
      { status: 500 }
    )
  }
}
