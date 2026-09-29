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
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: {
          lowest: "rgb(var(--surface-lowest) / <alpha-value>)",
          low: "rgb(var(--surface-low) / <alpha-value>)",
          DEFAULT: "rgb(var(--surface-default) / <alpha-value>)",
          high: "rgb(var(--surface-high) / <alpha-value>)",
          highest: "rgb(var(--surface-highest) / <alpha-value>)",
        },
        cream: {
          DEFAULT: "rgb(var(--cream-default) / <alpha-value>)",
          light: "rgb(var(--cream-light) / <alpha-value>)",
          dim: "rgb(var(--cream-dim) / <alpha-value>)",
          container: "rgb(var(--cream-container) / <alpha-value>)",
        },
        mint: {
          DEFAULT: "rgb(var(--mint-default) / <alpha-value>)",
          dark: "rgb(var(--mint-dark) / <alpha-value>)",
          light: "rgb(var(--mint-light) / <alpha-value>)",
          container: "rgb(var(--mint-container) / <alpha-value>)",
        },
        contradiction: {
          DEFAULT: "rgb(var(--contradiction-default) / <alpha-value>)",
          bright: "rgb(var(--contradiction-bright) / <alpha-value>)",
          container: "rgb(var(--contradiction-container) / <alpha-value>)",
          dark: "rgb(var(--contradiction-dark) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted-default) / <alpha-value>)",
          dark: "rgb(var(--muted-dark) / <alpha-value>)",
          light: "rgb(var(--muted-light) / <alpha-value>)",
        },
        // Semantic aliases
        primary: "rgb(var(--primary) / <alpha-value>)",
        "on-primary": "rgb(var(--on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--on-primary-container) / <alpha-value>)",
        secondary: "rgb(var(--secondary) / <alpha-value>)",
        "on-secondary": "rgb(var(--on-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--secondary-container) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--on-secondary-container) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--surface-lowest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--surface-low) / <alpha-value>)",
        "surface-container": "rgb(var(--surface-default) / <alpha-value>)",
        "surface-container-high": "rgb(var(--surface-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--surface-highest) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant) / <alpha-value>)",
        outline: "rgb(var(--outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--outline-variant) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        "error-container": "rgb(var(--error-container) / <alpha-value>)",
        "on-error-container": "rgb(var(--on-error-container) / <alpha-value>)",
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
