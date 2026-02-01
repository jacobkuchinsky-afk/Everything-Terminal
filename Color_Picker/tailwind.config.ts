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
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
