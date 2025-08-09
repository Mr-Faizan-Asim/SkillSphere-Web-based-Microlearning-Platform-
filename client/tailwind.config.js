// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a365d',
          light: '#2c5282',
        },
        secondary: {
          DEFAULT: '#ed8936',
          light: '#f6ad55',
        },
        accent: '#4299e1',
        success: '#48bb78',
        warning: '#ecc94b',
        danger: '#f56565',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 15px 40px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}