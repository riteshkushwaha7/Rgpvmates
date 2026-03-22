import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff3f1",
          100: "#ffe2de",
          200: "#ffc9c1",
          300: "#ffa79c",
          400: "#ff7f71",
          500: "#ff6256",
          600: "#eb4339",
          700: "#c9352f",
          800: "#a72f2d",
          900: "#87302f",
        },
        ink: "#17141f",
        mist: "#f7f1ee",
        sand: "#fffaf6",
        teal: "#8ee7d9",
      },
      boxShadow: {
        soft: "0 16px 60px rgba(23, 20, 31, 0.08)",
        float: "0 20px 80px rgba(235, 67, 57, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(255, 127, 113, 0.24), transparent 42%), radial-gradient(circle at 82% 18%, rgba(142, 231, 217, 0.28), transparent 30%)",
      },
      animation: {
        drift: "drift 14s ease-in-out infinite",
        rise: "rise 700ms ease-out both",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-12px,0)" },
        },
        rise: {
          from: { opacity: "0", transform: "translate3d(0,18px,0)" },
          to: { opacity: "1", transform: "translate3d(0,0,0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
