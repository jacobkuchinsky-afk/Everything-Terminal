# YouTube Link Converter

A modern, SEO-optimized YouTube video converter frontend built with Next.js 14 and Tailwind CSS.

## Features

- **Clean, Modern UI** - Black and red theme with bold typography
- **Format Selection** - Support for MP4, MP3, WEBM, and M4A formats
- **SEO Optimized** - Server-side rendered with comprehensive meta tags
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Ad-Ready Layout** - Reserved spaces for banner and sidebar advertisements

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
Youtube_link_converter/
├── app/
│   ├── layout.tsx      # Root layout with SEO metadata
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/
│   ├── Header.tsx      # Logo and site title
│   ├── ConverterCard.tsx # Main converter container
│   ├── LinkInput.tsx   # YouTube URL input
│   ├── FormatSelector.tsx # Format dropdown
│   ├── ConvertButton.tsx # Convert button
│   ├── AdBanner.tsx    # Top/bottom banner ads
│   └── AdSidebar.tsx   # Sidebar ads
└── ...config files
```

## Color Theme

| Element | Color |
|---------|-------|
| Background | `#0a0a0a` |
| Card | `#121212` |
| Primary (Red) | `#dc2626` |
| Text | `#f5f5f5` |
| Muted Text | `#a3a3a3` |

## Notes

- Conversion functionality is not yet implemented - this is the frontend only
- Ad placeholders are visual markers for where ads can be integrated
- The design is responsive and hides sidebar ads on smaller screens
