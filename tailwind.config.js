/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D6A4F',
          50: '#EAF4EE',
          100: '#D5EAE0',
          200: '#AACFBD',
          300: '#7FB49A',
          400: '#559977',
          500: '#2D6A4F',
          600: '#245540',
          700: '#1B4030',
          800: '#122A20',
          900: '#091510',
        },
        accent: {
          DEFAULT: '#F4A261',
          50: '#FEF3EA',
        },
        surface: {
          DEFAULT: '#FAFAF8',
          2: '#F2F2EE',
          3: '#E8E8E4',
        },
        dark: {
          surface: '#1A1A18',
          'surface-2': '#242422',
          'surface-3': '#2E2E2C',
          border: '#3A3A38',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 16px rgba(0,0,0,0.06)',
        lg: '0 8px 32px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
}
