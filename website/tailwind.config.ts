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
        // SenScript blue gradient colors
        'sen-blue': {
          50: '#eff6ff',
          100: '#dbeafe', 
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Glass morphism colors
        glass: {
          'dark': 'rgba(0, 0, 0, 0.6)',
          'light': 'rgba(255, 255, 255, 0.85)',
          'button-dark': 'rgba(255, 255, 255, 0.1)',
          'button-light': 'rgba(255, 255, 255, 0.95)',
        },
        // CheatCard colors  
        cheat: {
          orange: '#ff9966',
          'orange-light': '#ffcc66',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      fontSize: {
        'sen-base': '1.2em', // Web-app base size
        'sen-lg': '1.4em',
        'sen-xl': '1.8em', 
        'sen-2xl': '2.4em',
      },
      borderRadius: {
        'sen-sm': '15px',  // Glass button radius
        'sen-md': '20px',  // Card radius
        'sen-lg': '36px',  // Container radius  
      },
      backdropBlur: {
        'sen': '40px',
        'sen-button': '20px',
      },
      backdropSaturate: {
        'sen': '180%',
      },
      boxShadow: {
        'glass': '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
        'glass-hover': '0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)',
        'glass-light': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'cheat': '0 12px 40px rgba(255, 153, 102, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'scale-hover': 'scaleHover 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient': 'gradientShift 3s ease infinite',
        'slide-in-up': 'slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-in-down': 'slideInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        scaleHover: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        slideInUp: {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        slideInDown: {
          from: {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'sen': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      perspective: {
        '1000': '1000px',
      },
      rotate: {
        'y-180': 'rotateY(180deg)',
      },
      backgroundSize: {
        '200': '200% 200%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
  darkMode: 'class',
}

export default config