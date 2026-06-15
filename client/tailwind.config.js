/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pink: {
          50:  '#FDF2F5',
          100: '#FAE0E8',
          200: '#F5C0D1',
          300: '#EDA0B9',
          400: '#E8A2B5',
          500: '#D4788F',
          600: '#C05B75',
          700: '#A3435C',
          800: '#7A2F42',
          900: '#511E2C',
        },
        gold: {
          100: '#F9F0DF',
          200: '#F0DDB5',
          300: '#E5C885',
          400: '#C9A96E',
          500: '#B8934A',
          600: '#9A7835',
          700: '#7A5E26',
        },
        charcoal: {
          50:  '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#ABABAB',
          400: '#7A7A7A',
          500: '#4A4A4A',
          600: '#3A3A3A',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#0D0D0D',
        },
      },
      fontFamily: {
        serif:  ['Playfair Display', 'Georgia', 'serif'],
        sans:   ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #FDF2F5 0%, #F9F0DF 100%)',
        'gold-gradient':   'linear-gradient(135deg, #C9A96E 0%, #E5C885 50%, #C9A96E 100%)',
        'pink-gradient':   'linear-gradient(135deg, #E8A2B5 0%, #D4788F 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.6s ease-out',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'luxury': '0 4px 24px rgba(200, 150, 100, 0.15)',
        'luxury-lg': '0 8px 40px rgba(200, 150, 100, 0.2)',
        'pink': '0 4px 24px rgba(232, 162, 181, 0.3)',
      },
    },
  },
  plugins: [],
};
