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
            padding: {
                main: '0.5rem'
            },
            colors: {
                transparent: 'transparent',
                base: {
                    0: '#FFFFFF',
                    100: '#E7E9EF'
                },
                reverse: {
                    0: '#151313',
                    100: '#0B0A0A'
                },
            },
            borderRadius: {
                main: '2rem',
                small: '1rem'
            },
            borderWidth: {
                main: '16px',
                thin: '1px'
            },
            boxShadow: {
                main: [
                    '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 4px 6px -4px rgb(0 0 0 / 0.1)'
                ]
            }
        },
    },
    plugins: [],
}
