import { NextRequest, NextResponse } from 'next/server'

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
    
    // Use Cobalt API for downloading
    const cobaltResponse = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: youtubeUrl,
        downloadMode: isAudio ? 'audio' : 'auto',
        audioFormat: isAudio ? 'mp3' : undefined,
        videoQuality: '1080',
        filenameStyle: 'basic'
      })
    })
    
    if (!cobaltResponse.ok) {
      const errorText = await cobaltResponse.text()
      console.error('[download] Cobalt API error:', errorText)
      return NextResponse.json(
        { error: 'Download service temporarily unavailable' },
        { status: 503 }
      )
    }
    
    const cobaltData = await cobaltResponse.json()
    
    if (cobaltData.status === 'error') {
      return NextResponse.json(
        { error: cobaltData.error?.code || 'Failed to process video' },
        { status: 400 }
      )
    }
    
    // Get the download URL from Cobalt response
    let downloadUrl = cobaltData.url
    
    // Handle picker (multiple formats available)
    if (cobaltData.status === 'picker' && cobaltData.picker) {
      // Find the best option
      const picker = cobaltData.picker
      if (isAudio) {
        downloadUrl = picker.find((p: { type: string }) => p.type === 'audio')?.url || picker[0]?.url
      } else {
        downloadUrl = picker.find((p: { type: string }) => p.type === 'video')?.url || picker[0]?.url
      }
    }
    
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
    console.error('[download] Error:', errorMessage)
    
    return NextResponse.json(
      { error: `Failed to download video: ${errorMessage}` },
      { status: 500 }
    )
  }
}
