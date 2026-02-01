'use client'

interface FormatSelectorProps {
  value: string
  onChange: (value: string) => void
}

const formats = [
  { value: 'mp4', label: 'MP4 (Video)' },
  { value: 'mp3', label: 'MP3 (Audio)' },
  { value: 'webm', label: 'WEBM (Video)' },
  { value: 'm4a', label: 'M4A (Audio)' },
]

export default function FormatSelector({ value, onChange }: FormatSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="py-3 px-4 pr-10 bg-yt-bg border-2 border-yt-border rounded-xl
                 text-yt-text cursor-pointer
                 focus:outline-none focus:border-yt-red
                 transition-colors duration-200 min-w-[140px]"
    >
      {formats.map((format) => (
        <option key={format.value} value={format.value} className="bg-yt-card">
          {format.label}
        </option>
      ))}
    </select>
  )
}
