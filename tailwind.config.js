/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand blue
        primary: {
          50: '#1E293B',
          100: '#1E3A8A',
          200: '#1D4ED8',
          300: '#2563EB',
          400: '#3B82F6',
          500: '#60A5FA',
          600: '#3B82F6', // main brand color for dark mode
          700: '#60A5FA',
          800: '#93C5FD',
          900: '#EFF6FF',
        },
        // Status colors
        success: {
          50: '#064E3B',
          100: '#065F46',
          600: '#10B981',
          700: '#34D399',
        },
        warning: {
          50: '#78350F',
          100: '#92400E',
          600: '#F59E0B',
          700: '#FBBF24',
        },
        danger: {
          50: '#7F1D1D',
          100: '#991B1B',
          600: '#EF4444',
          700: '#F87171',
        },
        info: {
          50: '#1E3A8A',
          100: '#1D4ED8',
          600: '#3B82F6',
          700: '#60A5FA',
        },
        // Neutral surface + text scale for dark mode
        surface: {
          bg: '#0B0F17',      // deep dark background
          card: '#131C2E',    // dark card surface
          border: '#243044',  // subtle dark border
          subtle: '#1E293B',
        },
        ink: {
          900: '#F8FAFC', // primary text
          700: '#CBD5E1', // secondary text
          500: '#94A3B8', // muted text / labels
          400: '#64748B', // placeholder
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      borderRadius: {
        card: '0.75rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        popover: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        modal: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
      },
      keyframes: {
        'fade-in': { from: { opacity: 0 }, to: { opacity: 1 } },
        'scale-in': { from: { opacity: 0, transform: 'scale(0.96)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.15s ease-out',
        'scale-in': 'scale-in 0.15s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
}

