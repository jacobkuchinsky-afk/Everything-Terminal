'use client'

import { Clock, Eye, User } from 'lucide-react'
import Image from 'next/image'

export interface VideoInfo {
  id: string
  title: string
  author: string
  duration: string
  durationSeconds: number
  thumbnail: string
  views: number
  description: string
}

interface VideoPreviewProps {
  video: VideoInfo
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`
  }
  return `${views} views`
}

export default function VideoPreview({ video }: VideoPreviewProps) {
  return (
    <div className="w-full bg-yt-bg/50 rounded-xl border border-yt-border p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-yt-card">
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-yt-text-muted">
              No thumbnail
            </div>
          )}
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-yt-text font-semibold text-lg leading-tight line-clamp-2 mb-2">
            {video.title}
          </h3>
          
          <div className="flex flex-wrap gap-3 text-yt-text-muted text-sm">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {video.author}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatViews(video.views)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {video.duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
