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
        primary: "#D6A35C", // Deep warm amber/gold
        "primary-dark": "#B8884A",
        "primary-light": "#E8C17D",
        secondary: "#7A1F2B", // Muted wine red
        "secondary-dark": "#5A1720",
        "secondary-light": "#9A2835",
        dark: "#000000",
        "dark-secondary": "#0A0A0A",
        "dark-tertiary": "#1A1A1A",
        text: {
          main: "#EDEDED",
          muted: "#9A9A9A",
        },
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(214, 163, 92, 0.1), rgba(214, 163, 92, 0.05))",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
