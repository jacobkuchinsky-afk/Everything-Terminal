# Circuit Board Landing Page

An interactive circuit board visualization built with Next.js, featuring a realistic PCB aesthetic with configurable interactive pin buttons.

## Features

- **Realistic PCB Design**: Classic green circuit board with copper traces, vias, and silkscreen elements
- **Interactive Pins**: Square solder pad buttons that light up with an LED glow effect on hover
- **Configurable**: Adjust pin count, cell size, trace width, and seed via component props
- **Semi-Random Generation**: Circuit traces are procedurally generated with a seed for reproducibility
- **45/90 Degree Routing**: Traces follow realistic PCB routing angles
- **Responsive**: Scales proportionally to fit any screen size

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Configuration

The `CircuitBoard` component accepts the following props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pinCount` | number | 8 | Number of interactive pin buttons |
| `cellSize` | number | 40 | Grid cell size in pixels |
| `traceWidth` | number | 3 | Width of copper traces |
| `seed` | number | 42 | Random seed for reproducible generation |

### Example Usage

```tsx
import CircuitBoard from "@/components/CircuitBoard";

// Default configuration
<CircuitBoard />

// Custom configuration
<CircuitBoard 
  pinCount={16}
  cellSize={35}
  traceWidth={4}
  seed={123}
/>
```

## Color Palette

| Element | Hex |
|---------|-----|
| Board Substrate | `#1a472a` |
| Solder Mask | `#2d5a3d` |
| Copper Traces | `#b87333` |
| Solder Pads | `#c0c0c0` |
| Pad Hover (LED) | `#39ff14` |
| Vias | `#8b5a2b` |
| Silkscreen | `#f0f0f0` |

## Project Structure

```
Landing/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles & CSS variables
├── components/
│   ├── CircuitBoard.tsx    # Main container component
│   ├── PinButton.tsx       # Interactive pin buttons
│   ├── Trace.tsx           # Copper trace paths
│   ├── Via.tsx             # Via holes
│   └── DecorativeElements.tsx  # Silkscreen & decorations
├── utils/
│   ├── traceGenerator.ts   # Circuit generation algorithm
│   └── gridSystem.ts       # Grid coordinate utilities
└── types/
    └── circuit.ts          # TypeScript interfaces
```

## Tech Stack

- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- seedrandom (for reproducible randomness)
