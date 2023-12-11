/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}"
  ],
  theme: {
    extend: {
      transitionProperty: {
        'height': 'height',
        'width': 'width'
      }
    },
  },
  plugins: [],
}

