import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Charcoal / graphite base
        charcoal: {
          950: "#0A0C10",
          900: "#11151C",
          800: "#181D26",
          700: "#232A36",
          600: "#323B4A",
          500: "#4A5568",
        },
        // Warm amber / brass accent — premium dealership signature
        brass: {
          50: "#FBF3E2",
          100: "#F6E4BE",
          200: "#EFCD8A",
          300: "#E6B559",
          400: "#D9A23C",
          500: "#C68A2C",
          600: "#A36F22",
          700: "#7E561B",
        },
        ink: "#F4F1EB",
        muted: "#9AA4B2",
      },
      fontFamily: {
        display: ["var(--font-oswald)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(180deg, rgba(10,12,16,0.35) 0%, rgba(10,12,16,0.85) 70%, #0A0C10 100%)",
      },
      boxShadow: {
        card: "0 8px 30px -12px rgba(0,0,0,0.45)",
        glow: "0 0 0 1px rgba(217,162,60,0.25), 0 8px 24px -8px rgba(217,162,60,0.35)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
