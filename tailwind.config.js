/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        '2xl': '1440px',
        '3xl': '1920px',
        '4k': '2560px',
      },
    },
  },
  plugins: [],
}
