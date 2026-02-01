import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'yt-bg': '#0a0a0a',
        'yt-card': '#121212',
        'yt-red': '#dc2626',
        'yt-red-dark': '#991b1b',
        'yt-text': '#f5f5f5',
        'yt-text-muted': '#a3a3a3',
        'yt-border': '#2a2a2a',
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(220, 38, 38, 0.3)',
        'red-glow-lg': '0 0 30px rgba(220, 38, 38, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config
