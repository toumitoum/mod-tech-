import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0d9488",
          foreground: "#ffffff",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#171717",
        },
        border: "#e2e8f0",
        ring: "#0d9488",
      },
      fontFamily: {
        heading: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
