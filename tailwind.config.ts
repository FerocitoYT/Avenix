import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B1220",
        surface: "#111827",
        "surface-raised": "#1E293B",
        "surface-card": "rgba(17, 24, 39, 0.75)",
        primary: {
          DEFAULT: "#3B82F6",
          hover: "#2563EB",
          light: "#60A5FA",
          dark: "#1D4ED8",
        },
        accent: {
          DEFAULT: "#60A5FA",
          glow: "rgba(59, 130, 246, 0.15)",
        },
        border: "rgba(148, 163, 184, 0.12)",
        "border-glow": "rgba(96, 165, 250, 0.3)",
        text: {
          main: "#F8FAFC",
          muted: "#94A3B8",
          subtle: "#64748B",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      boxShadow: {
        "glow-sm": "0 0 15px -3px rgba(59, 130, 246, 0.25)",
        "glow-md": "0 0 30px -5px rgba(59, 130, 246, 0.35)",
        "glow-lg": "0 0 50px -10px rgba(59, 130, 246, 0.45)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.22), transparent 70%)",
        "card-glow":
          "radial-gradient(circle at top left, rgba(59, 130, 246, 0.08), transparent 50%)",
      },
    },
  },
  plugins: [],
};

export default config;
