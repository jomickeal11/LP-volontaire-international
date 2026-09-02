import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/views/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans: ['"Outfit"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Courier New"', "monospace"],
      },
      colors: {
        "blue-inst": "#1B4F7C",
        "blue-hover": "#163f63",
        "blue-light": "#3A8BC4",
        "blue-pale": "#E8F2FA",
        "green-nat": "#2E7D52",
        "green-hover": "#256643",
        "green-pale": "#E6F4EC",
        "bg-light": "#F4F6F9",
        "bg-mid": "#EEF1F6",
        "text-dark": "#1A2B3C",
        "text-mid": "#4A5A6A",
        "text-light": "#7A8A9A",
        "border-color": "#D1DCE5",
        "border-light": "#E8ECF2",
      },
    },
  },
  plugins: [],
}

export default config
