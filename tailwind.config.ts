import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-tajawal)", "system-ui", "sans-serif"],
      },
      colors: {
        dark: { DEFAULT: "#0a0a0f", card: "#12121a", border: "#1e1e2a" },
        cyber: { DEFAULT: "#00f0ff", dark: "#00b4c5", light: "#66f7ff", glow: "rgba(0,240,255,0.3)" },
        accent: { DEFAULT: "#7c3aed", light: "#a855f7", dark: "#6d28d9" },
      },
      backdropBlur: { xs: "2px" },
    },
  },
  plugins: [],
}
export default config
