import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// #region agent log
console.log('[DEBUG] video-info module loaded');
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
  // #region agent log
  console.log('[DEBUG] video-info API called');
  // #endregion
  
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }
  
  const videoId = extractVideoId(url)
  
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }
  
  // Return just the video ID - client will fetch oEmbed directly
  // This avoids YouTube blocking Vercel's IP
  return NextResponse.json({
    success: true,
    videoId: videoId,
    // Provide oEmbed URL for client to fetch
    oembedUrl: `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  })
}
