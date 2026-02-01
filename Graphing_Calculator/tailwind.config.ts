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
        graph: {
          bg: "#1a1a2e",
          sidebar: "#252538",
          input: "#2d2d44",
          inputHover: "#363650",
          grid: "#2a2a40",
          axes: "#505068",
          text: "#e8e8f0",
          muted: "#8888a0",
          primary: "#2d70f0",
          primaryHover: "#4080ff",
          border: "#3a3a50",
          // Equation colors
          red: "#c74440",
          blue: "#2d70b3",
          green: "#388c46",
          purple: "#6042a6",
          orange: "#fa7e19",
          pink: "#e85d9c",
          cyan: "#2d9db3",
          yellow: "#d4a72c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
