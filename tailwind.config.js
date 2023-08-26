/** @type {import('tailwindcss').Config} */
const { createThemes } = require('tw-colors')
const defaultTheme = require('tailwindcss/defaultTheme')
const { withAnimations } = require('animated-tailwindcss')

module.exports =  withAnimations({
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            width: {
                inscribed: ((Math.sqrt(2) / 2) * 100) + '%',
                corner: (((((Math.sqrt(2) - 1) / 2) * Math.sqrt(2)) / 2) * 100) + '%'
            },
            inset: {
                inscribed:  (((1 - (Math.sqrt(2) / 2)) / 2) * 100) + '%'
            },
            transitionDuration: {
                fast: '75ms',
                main: '150ms',
                slow: '700ms',
            },
            fontFamily: {
                main: ['SF Pro', ...defaultTheme.fontFamily.sans],
            },
            fontSize: {
                '2xs': ['0.2rem', {
                    lineHeight: '0.2rem'
                }],
                xs: ['0.25rem', {
                    lineHeight: '0.25rem'
                }],
                sm: ['0.6rem', {
                    lineHeight: '0.6rem'
                }],
                base: ['0.75rem', {
                    lineHeight: '0.75rem'
                }],
                lg: ['0.875rem', {
                    lineHeight: '0.875rem'
                }],
                xl: ['1rem', {
                    lineHeight: '1rem'
                }],
                '2xl': ['1.25rem', {
                    lineHeight: '1.25rem'
                }],
                '3xl': ['1.5rem', {
                    lineHeight: '1.5rem'
                }],
                '4xl': ['2rem', {
                    lineHeight: '2rem'
                }],
                '5xl': ['4rem', {
                    lineHeight: '4rem'
                }],
                '6xl': ['6rem', {
                    lineHeight: '6rem'
                }],
                '7xl': ['8rem', {
                    lineHeight: '8rem'
                }],
                '8xl': ['10rem', {
                    lineHeight: '10rem'
                }],
                '9xl': ['12rem', {
                    lineHeight: '12rem'
                }]
            },
            padding: {
                '2xs': '0.2rem',
                xs: '0.3rem',
                sm: '0.5rem',
                base: '0.75rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem',
            },
            margin: {
                '2xs': '0.2rem',
                xs: '0.3rem',
                sm: '0.5rem',
                base: '0.75rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem',
            },
            gap: {
                '2xs': '0.2rem',
                xs: '0.3rem',
                sm: '0.5rem',
                base: '0.75rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem',
            },
            borderRadius: {
                '2xs': '0.2rem',
                xs: '0.3rem',
                sm: '0.5rem',
                base: '0.75rem',
                lg: '1.5rem',
                xl: '2rem',
                '2xl': '3rem',
            },
            borderWidth: {
                sm: '1px',
                base: '2px',
                lg: '4px'
            },
            backdropBlur: {
                sm: '4px',
                base: '8px',
                lg: '16px'
            },
            blur: {
                xs: '2px',
                sm: '4px',
                base: '8px',
                lg: '16px',
                xl: '32px',
                '2xl': '48px',
                '3xl': '64px',
                '4xl': '128px',
                '5xl': '256px'
            },
            opacity: {
                muted: 0.6,
                killed: 0.2
            }
        },
    },
    plugins: [
        require("tailwind-gradient-mask-image"),
        createThemes({
            light: {
                base: {
                    main: '#EFEFF0',
                    highlight: '#FFFFFF',
                },
                divider: {
                    main: '#E4E4E7',
                    highlight: '#E4E4E7',
                    primary: '#448AFF',
                    accent: '#FF4081'
                },
                text: {
                    main: '#221D27',
                    highlight: '#38343A',
                    primary: '#F3F1F6',
                    accent: '#F3F1F6'
                },
                primary: {
                    main: '#FF4081',
                    highlight: '#FF80AB'
                },
                accent: {
                    main: '#448AFF',
                    highlight: '#82B1FF'
                }
            },
            dark: {
                base: {
                    main: '#09090B',
                    highlight: '#27272A'
                },
                divider: {
                    main: '#27272A',
                    highlight: '#1C1C1E',
                    primary: '#FF4081',
                    accent: '#448AFF'
                },
                text: {
                    main: '#FFFFFF',
                    highlight: '#FFFFFF',
                    primary: '#EBEAEB',
                    accent: '#EBEAEB'
                },
                primary: {
                    main: '#448AFF',
                    highlight: '#82B1FF'
                },
                accent: {
                    main: '#FF4081',
                    highlight: '#FF80AB'
                }
            }
        })
    ],
})
