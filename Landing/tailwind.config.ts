import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // PCB/Landing colors
        pcb: {
          substrate: "#1a472a",
          mask: "#2d5a3d",
          copper: "#b87333",
          pad: "#c0c0c0",
          padHover: "#39ff14",
          via: "#8b5a2b",
          silkscreen: "#f0f0f0",
        },
        // Calculator colors
        calc: {
          black: "#050505",
          dark: "#0d0d0d",
          surface: "#1a1a1a",
          surfaceHover: "#252525",
          primary: "#14B8A6",
          primaryBright: "#2DD4BF",
          primaryDim: "#0D9488",
          border: "#262626",
          borderHover: "#404040",
          text: "#f0f0f0",
          textMuted: "#737373",
          textDim: "#a3a3a3",
          accent: "#14B8A6",
        },
        // Cipher colors
        cipher: {
          black: "#000000",
          dark: "#0a0a0f",
          card: "#12141a",
          cardHover: "#1a1c24",
          primary: "#0066FF",
          bright: "#3b9eff",
          border: "#1e2330",
          borderHover: "#2a3347",
          glow: "#0088FF",
          text: "#e4e6eb",
          textMuted: "#8b8f9a",
        },
        // Color Picker colors
        picker: {
          black: "#000000",
          dark: "#0a0a0a",
          card: "#111111",
          surface: "#161616",
          primary: "#F59E0B",
          bright: "#FBBF24",
          border: "#292524",
          muted: "#78716C",
        },
        // YouTube colors
        yt: {
          bg: "#0a0a0a",
          card: "#141414",
          red: "#dc2626",
          redDark: "#b91c1c",
          text: "#f5f5f5",
          textMuted: "#a3a3a3",
          border: "#262626",
        },
      },
    },
  },
  plugins: [],
};

export default config;
