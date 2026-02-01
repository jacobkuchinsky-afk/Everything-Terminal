from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pytube import YouTube
from pytube.exceptions import VideoUnavailable, RegexMatchError
import os

app = FastAPI(title="YouTube Downloader API")

# Allow CORS from your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    Get download URL for a YouTube video using pytube.
    
    Args:
        url: YouTube video URL
        format: 'mp4' for video or 'mp3' for audio
    """
    if not url:
        raise HTTPException(status_code=400, detail="Missing url parameter")
    
    try:
        # Create YouTube object
        yt = YouTube(url)
        
        # Get video info
        title = yt.title
        author = yt.author
        duration = yt.length
        thumbnail = yt.thumbnail_url
        
        # Get stream based on format
        if format == 'mp3':
            # Get best audio stream
            stream = yt.streams.filter(only_audio=True).order_by('abr').desc().first()
            if not stream:
                stream = yt.streams.filter(only_audio=True).first()
        else:
            # Get best progressive stream (video + audio in single file)
            # Progressive streams have both video and audio, no merging needed
            stream = yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first()
            if not stream:
                # Fallback to any progressive stream
                stream = yt.streams.filter(progressive=True).first()
        
        if not stream:
            raise HTTPException(status_code=500, detail="No suitable stream found")
        
        # Get the direct download URL
        download_url = stream.url
        
        return {
            "success": True,
            "title": title,
            "author": author,
            "duration": duration,
            "thumbnail": thumbnail,
            "download_url": download_url,
            "format": format,
            "quality": getattr(stream, 'resolution', None) or getattr(stream, 'abr', 'unknown')
        }
            
    except VideoUnavailable:
        raise HTTPException(status_code=404, detail="Video is unavailable or private")
    except RegexMatchError:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    except Exception as e:
        error_msg = str(e)
        if 'Sign in' in error_msg or 'bot' in error_msg.lower() or 'confirm' in error_msg.lower():
            raise HTTPException(
                status_code=403, 
                detail="YouTube is temporarily blocking requests. Please try again later."
            )
        raise HTTPException(status_code=500, detail=f"Error: {error_msg}")

@app.get("/api/info")
def get_video_info(url: str):
    """Get video metadata without download URL."""
    if not url:
        raise HTTPException(status_code=400, detail="Missing url parameter")
    
    try:
        yt = YouTube(url)
        
        return {
            "success": True,
            "id": yt.video_id,
            "title": yt.title,
            "author": yt.author,
            "duration": yt.length,
            "thumbnail": yt.thumbnail_url,
            "view_count": yt.views,
            "description": yt.description[:500] if yt.description else ''
        }
    except VideoUnavailable:
        raise HTTPException(status_code=404, detail="Video is unavailable or private")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
