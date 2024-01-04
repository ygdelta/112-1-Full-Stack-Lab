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
      },
      fontFamily: {
        custom: ['Noto Sans KR', 'sans-serif']
      },
      height: {
        'card': '402px'
      }
    },
  },
  plugins: [],
}

