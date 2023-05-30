/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                main: ['FOT-UDMarugo_Large Pr6N', ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
}
