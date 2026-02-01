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
        calc: {
          bg: "#1a1a2e",
          surface: "#16213e",
          card: "#0f3460",
          input: "#1a1a2e",
          accent: "#e94560",
          accentHover: "#ff6b6b",
          secondary: "#533483",
          text: "#eaeaea",
          textDim: "#a0a0a0",
          textMuted: "#6b6b6b",
          border: "#2a2a4a",
          number: "#252550",
          numberHover: "#303065",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["Source Code Pro", "SF Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(233, 69, 96, 0.3)",
        soft: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      },
    },
  },
  plugins: [],
};

export default config;
