/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50:  '#EEEDFB',
          100: '#D4D3F6',
          200: '#A9A6ED',
          300: '#7E7AE4',
          400: '#534DDB',
          500: '#4F46E5',
          600: '#3E38B4',
          700: '#2E2A84',
          800: '#1E1C54',
          900: '#0F0E2A',
        },
        secondary: {
          DEFAULT: '#06B6D4',
          50:  '#ECFEFF',
          100: '#CFFAFE',
          500: '#06B6D4',
          600: '#0891B2',
        },
        premium: {
          DEFAULT: '#7C3AED',
          50:  '#F5F3FF',
          100: '#EDE9FE',
          500: '#7C3AED',
          600: '#6D28D9',
        },
        accent: {
          DEFAULT: '#06B6D4',
          500: '#06B6D4',
        },
        background: {
          DEFAULT: '#F8FAFC',
          dark:    '#0F172A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark:    '#1E293B',
        },
        text: {
          primary:   '#0F172A',
          secondary: '#64748B',
          disabled:  '#94A3B8',
          inverse:   '#FFFFFF',
        },
        error:   '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
      fontFamily: {
        sans:   ['Inter', 'System'],
        medium: ['Inter-Medium', 'System'],
        bold:   ['Inter-Bold', 'System'],
      },
      borderRadius: {
        sm:  '6px',
        md:  '10px',
        lg:  '16px',
        xl:  '24px',
        '2xl': '32px',
      },
    },
  },
  plugins: [],
};
