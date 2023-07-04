/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const { withAnimations } = require('animated-tailwindcss')

module.exports =  withAnimations({
    darkMode: 'class',
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            animationDuration: {
                fast: '0.15s'
            },
            fontFamily: {
                main: ['SF Pro', ...defaultTheme.fontFamily.sans],
            },
            fontSize: {
                tiny: ['0.625rem', {
                    lineHeight: '0.875rem'
                }],
                micro: ['0.5rem', {
                    lineHeight: '0.75rem'
                }]
            },
            padding: {
                main: '1.5rem',
                smaller: '1rem',
                small: '0.75rem',
                tiny: '0.5rem',
                micro: '0.25rem'
            },
            margin: {
                main: '2rem',
                smaller: '1.5rem',
                small: '1rem',
                tiny: '0.5rem',
                micro: '0.25rem'
            },
            gap: {
                main: '2rem',
                smaller: '1rem',
                small: '0.75rem',
                tiny: '0.5rem',
                micro: '0.25rem'
            },
            borderRadius: {
                main: '1rem',
                small: '0.5rem'
            },
            borderWidth: {
                main: '2px',
                thick: '4px',
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
                'inner-right': [
                    'inset -0.5rem 0 0.5rem -0.5rem'
                ],
                inner: [
                    'inset 0 10px 15px -3px rgb(0 0 0 / 0.1)', 'inset 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                ],
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
            scale: {
                main: '1.1',
                smaller: '1.05',
                small: '1.03'
            },
            textDecorationThickness: {
                thick: '2px',
            }
        },
    },
    plugins: [
        require("tailwind-gradient-mask-image"),
        require('tailwindcss-themer')({
            defaultTheme: {
                extend: {
                    opacity: {
                        muted: '60%',
                        killed: '20%'
                    },
                    colors: {
                        base: {
                            main: '#f3f1f6',
                            highlight: '#ffffff'
                        },
                        shadow: '#5b5b5c',
                        divider: {
                            main: '#e9e7ec',
                            highlight: '#e1e1e1',
                            primary: '#0066eb'
                        },
                        reverse: {
                            main: '#221d27',
                            highlight: '#38343a'
                        },
                        text: {
                            main: '#49494a',
                            highlight: '#221d27',
                            primary: '#f3f1f6'
                        },
                        primary: {
                            main: '#027cff',
                            highlight: '#5E93FD'
                        },
                        accent: {
                            main: '#fa2e49',
                            highlight: '#FF5162'
                        },
                        positive: '',
                        negative: ''
                    }
                }
            },
            themes: [
                {
                    name: 'dark',
                    extend: {
                        opacity: {
                            muted: '40%',
                            killed: '20%'
                        },
                        colors: {
                            base: {
                                // main: '#221d27',
                                // highlight: '#38343a'
                                main: '#000000',
                                highlight: '#1c1c1e'
                            },
                            shadow: '#000000',
                            divider: {
                                main: '#1d1822',
                                highlight: '#0c0711',
                                primary: '#e61a35'
                            },
                            reverse: {
                                main: '#f3f1f6',
                                highlight: '#ffffff'
                            },
                            text: {
                                main: '#ebeaeb',
                                highlight: '#FFFFFF',
                                primary: '#ebeaeb'
                            },
                            primary: {
                                main: '#fa2e49',
                                highlight: '#FF5162'
                            },
                            accent: {
                                main: '#027cff',
                                highlight: '#5E93FD'
                            },
                            positive: '',
                            negative: ''
                        }
                    }
                }
            ]
        })
    ],
})
