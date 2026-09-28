/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: "#0B0B0A",
        surface: {
          lowest: "#0B0B0A",
          low: "#161513",
          DEFAULT: "#1C1A17",
          high: "#25231F",
          highest: "#353534",
        },
        cream: {
          DEFAULT: "#E5DECE",
          light: "#F4EFE6",
          dim: "#CFC6B1",
          container: "#D6CDB8",
        },
        mint: {
          DEFAULT: "#4EBA86",
          dark: "#3CA672",
          light: "#70DBA4",
          container: "#003822",
        },
        contradiction: {
          DEFAULT: "#E05656",
          bright: "#FFB4AB",
          container: "#690005",
          dark: "#410006",
        },
        muted: {
          DEFAULT: "#7E7768",
          dark: "#4A463E",
          light: "#959086",
        },
        // Semantic aliases
        primary: "#F3E9D3",
        "on-primary": "#353022",
        "primary-container": "#D6CDB8",
        "on-primary-container": "#5D5746",
        secondary: "#70DBA4",
        "on-secondary": "#003822",
        "secondary-container": "#33A371",
        "on-secondary-container": "#00311D",
        "surface-container-lowest": "#0B0B0A",
        "surface-container-low": "#161513",
        "surface-container": "#1C1A17",
        "surface-container-high": "#25231F",
        "surface-container-highest": "#353534",
        "on-surface": "#F4EFE6",
        "on-surface-variant": "#CCC6BB",
        outline: "#959086",
        "outline-variant": "#4A463E",
        error: "#FFB4AB",
        "error-container": "#93000A",
        "on-error-container": "#FFDAD6",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        sans: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "1.25rem",
        xl: "1.75rem",
        full: "9999px",
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.875rem',
        'space-lg': '1.25rem',
        'space-xl': '1.75rem',
        'gutter': '1rem',
      }
    },
  },
  plugins: [],
}
