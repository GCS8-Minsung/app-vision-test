import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Design system — Material You dark scheme (stitch_ui spec)
        primary: "#cfbcff",
        "primary-container": "#6750a4",
        "on-primary": "#381e72",
        "on-primary-container": "#e0d2ff",
        "primary-fixed": "#e9ddff",
        "primary-fixed-dim": "#cfbcff",
        "on-primary-fixed": "#22005d",
        "on-primary-fixed-variant": "#4f378a",
        "inverse-primary": "#6750a4",
        secondary: "#cdc0e9",
        "secondary-container": "#4d4465",
        "on-secondary": "#342b4b",
        "on-secondary-container": "#bfb2da",
        "secondary-fixed": "#e9ddff",
        "secondary-fixed-dim": "#cdc0e9",
        "on-secondary-fixed": "#1f1635",
        "on-secondary-fixed-variant": "#4b4263",
        tertiary: "#e7c365",
        "tertiary-container": "#c9a74d",
        "on-tertiary": "#3e2e00",
        "on-tertiary-container": "#503d00",
        "tertiary-fixed": "#ffdf93",
        "tertiary-fixed-dim": "#e7c365",
        "on-tertiary-fixed": "#241a00",
        "on-tertiary-fixed-variant": "#594400",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        surface: "#141218",
        "surface-dim": "#141218",
        "surface-bright": "#3b383e",
        "surface-container-lowest": "#0f0d13",
        "surface-container-low": "#1d1b20",
        "surface-container": "#211f24",
        "surface-container-high": "#2b292f",
        "surface-container-highest": "#36343a",
        "on-surface": "#e6e0e9",
        "on-surface-variant": "#cbc4d2",
        "surface-variant": "#36343a",
        "surface-tint": "#cfbcff",
        "inverse-surface": "#e6e0e9",
        "inverse-on-surface": "#322f35",
        background: "#141218",
        "on-background": "#e6e0e9",
        outline: "#948e9c",
        "outline-variant": "#494551",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 8px 32px rgba(0, 0, 0, 0.18)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.25)",
        glow: "0 0 24px rgba(124, 77, 255, 0.45)",
        "glow-sm": "0 0 14px rgba(124, 77, 255, 0.3)",
        soft: "0 4px 20px rgba(0, 0, 0, 0.12)"
      },
      borderRadius: {
        "4xl": "2rem",
      }
    }
  },
  plugins: []
};

export default config;
