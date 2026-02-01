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
        cipher: {
          black: "#000000",
          dark: "#0a0a0f",
          card: "#12141a",
          "card-hover": "#1a1c24",
          primary: "#0066FF",
          bright: "#3b9eff",
          border: "#1e2330",
          "border-hover": "#2a3347",
          glow: "#0088FF",
          text: "#e4e6eb",
          "text-muted": "#8b8f9a",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
