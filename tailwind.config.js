/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                main: ['Inter', ...defaultTheme.fontFamily.sans], // 'FOT-UDMarugo_Large Pr6N'
            },
            padding: {
                main: '0.5rem'
            },
            colors: {
                transparent: 'transparent',
                base: {
                    0: '#FFFFFF',
                    100: '#F6F6F6'
                },
                reverse: {
                    0: '#000000',
                    100: '#0B0A0A'
                },
                light: {
                    0: '#A1A1AA',
                    100: '#52525B'
                },
                divide: {
                    light: 'rgba(255, 255, 255, 0.7)',
                    dark: 'rgba(255, 255, 255, 0.5)'
                }
            },
            borderRadius: {
                main: '2rem',
                small: '1rem'
            },
            borderWidth: {
                main: '1px',
                thick: '16px',
                thin: '1px'
            },
            backdropBlur: {
                main: '48px'
            },
            backdropBrightness: {
                light: '1.25',
                dark: '1.03'
            },
            boxShadow: {
                main: [
                    '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 4px 6px -4px rgb(0 0 0 / 0.1)'
                ]
            },
            transitionDuration: {
                main: '350ms',
            }
        },
    },
    plugins: [],
}
