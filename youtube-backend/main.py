from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yt_dlp
import os

app = FastAPI(title="YouTube Downloader API")

# Allow CORS from your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "youtube-downloader"}

@app.get("/api/download")
def get_download_url(url: str, format: str = "mp4"):
    """
    Get download URL for a YouTube video.
    
    Args:
        url: YouTube video URL
        format: 'mp4' for video or 'mp3' for audio
    """
    if not url:
        raise HTTPException(status_code=400, detail="Missing url parameter")
    
    try:
        # Configure yt-dlp options based on format
        if format == 'mp3':
            format_spec = 'bestaudio[ext=m4a]/bestaudio/best'
        else:
            format_spec = 'best[ext=mp4][height<=720]/best[ext=mp4]/best[height<=720]/best'
        
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'format': format_spec,
            # Use cookies if available (for authenticated requests)
            'cookiefile': os.environ.get('YOUTUBE_COOKIES_FILE'),
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                raise HTTPException(status_code=404, detail="Video not found")
            
            # Get the direct URL - yt-dlp should have selected the best format
            download_url = info.get('url')
            
            # If no direct URL, check requested_formats (for merged formats)
            if not download_url and info.get('requested_formats'):
                # For video, prefer the video+audio format
                for rf in info['requested_formats']:
                    if rf.get('url'):
                        download_url = rf.get('url')
                        break
            
            # Fallback: search through formats
            if not download_url:
                formats = info.get('formats', [])
                
                if format == 'mp3':
                    # Find audio-only format
                    audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') in ('none', None) and f.get('url')]
                    if audio_formats:
                        best = max(audio_formats, key=lambda x: x.get('abr') or x.get('tbr') or 0)
                        download_url = best.get('url')
                else:
                    # Find video format with audio
                    video_formats = [f for f in formats if f.get('vcodec') not in ('none', None) and f.get('acodec') not in ('none', None) and f.get('url') and 'ytimg.com' not in f.get('url', '')]
                    if video_formats:
                        # Prefer 720p or lower
                        good = [f for f in video_formats if (f.get('height') or 9999) <= 720]
                        if good:
                            best = max(good, key=lambda x: x.get('height') or 0)
                        else:
                            best = video_formats[0]
                        download_url = best.get('url')
                    
                    # Last fallback: any format with actual video URL
                    if not download_url:
                        for f in formats:
                            url_candidate = f.get('url', '')
                            if url_candidate and 'googlevideo.com' in url_candidate:
                                download_url = url_candidate
                                break
            
            if not download_url:
                raise HTTPException(status_code=500, detail="Could not extract download URL")
            
            return {
                "success": True,
                "title": info.get('title', 'Unknown'),
                "author": info.get('uploader', 'Unknown'),
                "duration": info.get('duration', 0),
                "thumbnail": info.get('thumbnail', ''),
                "download_url": download_url,
                "format": format
            }
            
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        if 'Sign in' in error_msg or 'bot' in error_msg.lower():
            raise HTTPException(
                status_code=403, 
                detail="YouTube is temporarily blocking requests. Please try again in a few minutes."
            )
        raise HTTPException(status_code=500, detail=f"Download error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/info")
def get_video_info(url: str):
    """Get video metadata without download URL."""
    if not url:
        raise HTTPException(status_code=400, detail="Missing url parameter")
    
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            
            if not info:
                raise HTTPException(status_code=404, detail="Video not found")
            
            return {
                "success": True,
                "id": info.get('id', ''),
                "title": info.get('title', 'Unknown'),
                "author": info.get('uploader', 'Unknown'),
                "duration": info.get('duration', 0),
                "thumbnail": info.get('thumbnail', ''),
                "view_count": info.get('view_count', 0),
                "description": info.get('description', '')[:500] if info.get('description') else ''
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
