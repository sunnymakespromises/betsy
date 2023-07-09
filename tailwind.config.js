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
                main: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                live: {
                    main: '#fa2e49',
                    highlight: '#FF5162'
                }
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
                large: '1.5rem',
                main: '0.75rem',
                smaller: '0.5rem',
                small: '0.3rem',
                tiny: '0.2rem',
                micro: '0.1rem'
            },
            margin: {
                large: '1.5rem',
                main: '0.75rem',
                smaller: '0.5rem',
                small: '0.3rem',
                tiny: '0.2rem',
                micro: '0.1rem'
            },
            gap: {
                large: '1.5rem',
                main: '0.75rem',
                smaller: '0.5rem',
                small: '0.3rem',
                tiny: '0.2rem',
                micro: '0.1rem'
            },
            borderRadius: {
                main: '0.75rem',
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
                    backgroundImage: {
                        base: "url('images/light/bg.png')"
                    },
                    opacity: {
                        muted: '60%',
                        killed: '20%'
                    },
                    colors: {
                        base: {
                            main: '#FFFFFF',
                            highlight: '#f4f4f5',
                        },
                        shadow: '#5b5b5c',
                        divider: {
                            main: '#e4e4e7',
                            highlight: '#e1e1e1',
                            primary: '#0066eb'
                        },
                        reverse: {
                            main: '#09090b',
                            highlight: '#38343a'
                        },
                        text: {
                            main: '#221d27',
                            highlight: '#221d27',
                            primary: '#f3f1f6',
                            reverse: '#f3f1f6'
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
                        backgroundImage: {
                            base: "url('images/dark/bg.png')"
                        },
                        opacity: {
                            muted: '40%',
                            killed: '20%'
                        },
                        colors: {
                            base: {
                                main: '#09090b',
                                highlight: '#27272a'
                                // main: '#000000',
                                // highlight: '#1c1c1e'
                            },
                            shadow: '#000000',
                            divider: {
                                main: '#27272a',
                                highlight: '#0c0711',
                                primary: '#e61a35'
                            },
                            reverse: {
                                main: '#FFFFFF',
                                highlight: '#ffffff'
                            },
                            text: {
                                main: '#FFFFFF',
                                highlight: '#FFFFFF',
                                primary: '#ebeaeb',
                                reverse: '#221d27'
                            },
                            primary: {
                                main: '#027cff',
                                highlight: '#5E93FD'
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
