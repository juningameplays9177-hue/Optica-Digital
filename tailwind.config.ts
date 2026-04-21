import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090B",
        panel: "#111217",
        soft: "#181A21",
        accent: "#06B6D4",
        accentStrong: "#22D3EE"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34, 211, 238, 0.2), 0 10px 40px rgba(6, 182, 212, 0.15)"
      }
    }
  },
  plugins: []
};

export default config;
