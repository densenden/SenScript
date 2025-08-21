import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          orange: '#f97316',
          'orange-hover': '#ea580c',
        },
        glass: {
          white: 'rgba(255, 255, 255, 0.85)',
          dark: 'rgba(31, 41, 55, 0.85)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      perspective: {
        '1000': '1000px',
      },
      rotate: {
        'y-180': 'rotateY(180deg)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
  darkMode: 'class',
}

export default config