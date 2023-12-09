/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}"
  ],
  theme: {
    extend: {
      transitionProperty: {
        "width": "width"
      },
      backgroundColor: ['active']
    },
  },
  plugins: [],
}

