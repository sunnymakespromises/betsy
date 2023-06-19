/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const { withAnimations } = require('animated-tailwindcss')

module.exports = {
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        animatedSettings: {
            animatedSpeed: 150,
        },
        extend: {
            fontFamily: {
                main: ['SF Pro Display', ...defaultTheme.fontFamily.sans], // 'FOT-UDMarugo_Large Pr6N'
            },
            padding: {
                main: '2rem',
                smaller: '1.5rem',
                small: '1rem',
                tiny: '0.5rem'
            },
            margin: {
                main: '2rem',
                smaller: '1.5rem',
                small: '1rem',
                tiny: '0.5rem'
            },
            gap: {
                main: '1.5rem',
                smaller: '1rem',
                small: '0.5rem',
                tiny: '0.25rem'
            },
            colors: {
                transparent: 'transparent',
                base: {
                    0: '#1A1A1A'
                },
                reverse: {
                    0: '#F2F2F2',
                    100: '#E6E6E6'
                },
                accent: {
                    0: '#597DEF',
                    100: '#57F27B'
                }
            },
            borderRadius: {
                main: '1rem',
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
                darker: '0.8'
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
                'more-visible': '60%',
                main: '30%',
                faint: '10%'
            },
            transitionDuration: {
                main: '150ms',
                fast: '100ms',
                slow: '300ms'
            },
            scale: {
                main: '1.1',
                smaller: '1.05',
                small: '1.03'
            }
        },
    },
    plugins: [
        require('tailwindcss-animatecss'),
    ],
}
