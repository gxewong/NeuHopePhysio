/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#255957', // primary — nav, headings, buttons
          forest: '#1B4341', // dark backgrounds, footer
          yellow: '#F4C542', // CTA accents & highlights (use sparingly)
          sage: '#E6F0EF', // soft section backgrounds
          grey: '#F4F7F7', // alternating sections
          ink: '#233534', // body text
        },
      },
      fontFamily: {
        heading: ['Manrope', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '1.125rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(27,67,65,0.04), 0 8px 24px -12px rgba(27,67,65,0.14)',
        lift: '0 2px 4px rgba(27,67,65,0.05), 0 20px 40px -16px rgba(27,67,65,0.24)',
      },
      maxWidth: {
        site: '76rem',
      },
    },
  },
  plugins: [],
};
