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
                dark: {
                    0: '#363036',
                    100: '#413A41'
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
                lighter: '1.25',
                darker: '1.03'
            },
            boxShadow: {
                main: [
                    '0 10px 15px -3px rgb(0 0 0 / 0.1)', '0 4px 6px -4px rgb(0 0 0 / 0.1)'
                ],
                small: [
                    '0 5px 7px -1px rgb(0 0 0 / 0.05)', '0 2px 3px -2px rgb(0 0 0 / 0.05)'
                ]
            },
            opacity: {
                main: '60%',
                faint: '40%'
            },
            transitionDuration: {
                main: '500ms',
                fast: '150ms',
                slow: '750ms'
            }
        },
    },
    plugins: [],
}
