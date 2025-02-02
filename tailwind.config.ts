import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#FF8BA7",
          50: "#FFF0F4",
          100: "#FFE4EB",
          200: "#FFD1DD",
          300: "#FFBDCF",
          400: "#FFA4BB",
          500: "#FF8BA7",
          600: "#FF5983",
          700: "#FF275F",
          800: "#F4003D",
          900: "#C00030",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFDDD2",
          50: "#FFFFFF",
          100: "#FFFFFF",
          200: "#FFFFFF",
          300: "#FFF5F2",
          400: "#FFE9E2",
          500: "#FFDDD2",
          600: "#FFC0A8",
          700: "#FFA37E",
          800: "#FF8654",
          900: "#FF692A",
          foreground: "#4A5568",
        },
        muted: {
          DEFAULT: "#F7FAFC",
          foreground: "#718096",
        },
        accent: {
          DEFAULT: "#FFF5F7",
          foreground: "#FF8BA7",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2D3748",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2D3748",
        },
        border: "#E2E8F0",
        input: "#EDF2F7",
        ring: "#FF8BA7",
        destructive: {
          DEFAULT: "#FF5983",
          foreground: "#FFFFFF",
        },
        chart: {
          1: "#FF8BA7",
          2: "#FFDDD2",
          3: "#FFE4EB",
          4: "#FFF0F4",
          5: "#FFF5F7",
        },
      },
      borderRadius: {
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      fontFamily: {
        sans: ['"Nunito"', "sans-serif"],
        display: ['"Playfair Display"', "serif"],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
