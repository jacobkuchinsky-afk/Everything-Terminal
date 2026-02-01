from http.server import BaseHTTPRequestHandler
import json
import yt_dlp
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        try:
            # Parse query parameters
            parsed = urllib.parse.urlparse(self.path)
            params = urllib.parse.parse_qs(parsed.query)
            
            video_url = params.get('url', [None])[0]
            format_type = params.get('format', ['mp4'])[0]
            
            if not video_url:
                self._send_error(400, 'Missing url parameter')
                return

            # Configure yt-dlp
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
            }

            # Get video info
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                
                if not info:
                    self._send_error(404, 'Video not found')
                    return

                # Find best format
                formats = info.get('formats', [])
                download_url = None
                
                if format_type == 'mp3':
                    # Find best audio format
                    audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
                    if audio_formats:
                        best_audio = max(audio_formats, key=lambda x: x.get('abr', 0) or 0)
                        download_url = best_audio.get('url')
                else:
                    # Find best video format with audio
                    video_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') != 'none']
                    if video_formats:
                        # Prefer 720p or lower for faster downloads
                        good_formats = [f for f in video_formats if (f.get('height') or 0) <= 720]
                        if good_formats:
                            best_video = max(good_formats, key=lambda x: (x.get('height') or 0))
                        else:
                            best_video = min(video_formats, key=lambda x: (x.get('height') or 9999))
                        download_url = best_video.get('url')
                    
                    # Fallback to any format with URL
                    if not download_url:
                        for f in formats:
                            if f.get('url'):
                                download_url = f.get('url')
                                break

                response_data = {
                    'success': True,
                    'title': info.get('title', 'Unknown'),
                    'author': info.get('uploader', 'Unknown'),
                    'duration': info.get('duration', 0),
                    'thumbnail': info.get('thumbnail', ''),
                    'download_url': download_url,
                }

                self._send_json(200, response_data)

        except yt_dlp.utils.DownloadError as e:
            error_msg = str(e)
            if 'Sign in' in error_msg or 'bot' in error_msg.lower():
                self._send_error(403, 'YouTube is blocking this request. Try again later.')
            else:
                self._send_error(500, f'Download error: {error_msg}')
        except Exception as e:
            self._send_error(500, f'Error: {str(e)}')

    def _send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _send_error(self, status_code, message):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({'success': False, 'error': message}).encode())
