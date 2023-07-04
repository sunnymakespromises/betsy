import _ from 'lodash'
import { memo, useMemo } from 'react'

/**
 * A <p> tag with the given preset and content.
 * @param {string} preset the preset to be applied to the text.
 * @param {object} styles the styles to be passed to the text.
 * @param {string} classes the classes to be passed to the text.
 * @param {element} children the elements to be rendered inside of the <p> tag as children. you don't have to actually pass it like children = x, just put <Text><x/></Text>.
 * @returns a <p> tag.
 */
const Text = memo(function Text({ preset = 'main-body', styles, classes, children, ...extras }) {
    let options = {
        main: {
            body: 'select-none font-main font-light text-lg md:text-xl text-reverse-0',
            title: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
            button: 'whitespace-nowrap select-none font-main font-regular text-lg md:text-2xl text-reverse-100 group-hover:text-base-0',
        },
        home: {
            events: {
                name: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl',
                competition: 'select-none font-main font-regular text-base md:text-base text-text-main',
                sport: 'select-none font-main font-regular text-base md:text-base text-text-main/muted',
                date: 'select-none font-main font-regular text-base md:text-base text-text-main/muted'
            }
        },
        login: {
            title: 'select-none font-main font-black text-6xl md:text-7xl text-text-main text-center',
            subtitle: 'whitespace-nowrap select-none font-main font-bold text-base md:text-base text-text-main',
            body: 'select-none font-main font-light text-sm md:text-base text-text-main',
            option: 'select-none font-main font-regular text-sm md:text-base text-text-main'
        },
        info: {
            error: 'select-none font-main font-regular text-2xl md:text-2xl text-text-onPrimary'
        },
        settings: {
            title: 'whitespace-nowrap select-none font-main font-bold text-3xl md:text-3xl text-text-main',
            donate: {
                body: 'select-none font-main font-regular text-xs md:text-xs text-text-main/muted text-center',
                link: 'select-none font-main font-regular text-xs md:text-xs text-primary-main hover:text-primary-highlight'
            },
            setting: {
                title: 'select-none whitespace-nowrap font-main font-medium text-xl md:text-xl text-text-main',
                option: {
                    title: 'select-none font-main font-regular text-base md:text-lg text-text-main'
                }
            },
            footer: {
                body: 'select-none whitespace-nowrap font-main font-light text-xs md:text-xs text-text-main/muted text-center',
                link: 'select-none whitespace-nowrap font-main font-medium text-xs md:text-xs text-primary-main hover:text-primary-highlight'
            },
        },
        profile: {
            display_name: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
            username: 'whitespace-nowrap select-none font-main font-medium text-sm md:text-base text-text-main',
            bio: 'whitespace-nowrap select-none font-main font-light text-sm md:text-base text-text-main',
            error: 'whitespace-nowrap select-none font-main font-light text-xs md:text-xs text-text-main'
        },
        logout: 'whitespace-nowrap select-none font-main font-medium text-lg md:text-lg text-text-main',
        search: {
            results: {
                category: 'whitespace-nowrap select-none font-main font-regular text-xl md:text-lg text-text-main',
            },
            result: {
                title: 'overflow-hidden text-ellipsis whitespace-nowrap select-none font-main font-regular text-lg md:text-base text-text-main/muted',
                subtitle: 'transition-all duration-main whitespace-nowrap select-none font-main font-light text-sm md:text-sm',
            }
        },
        dev: {
            stat: {
                title: 'whitespace-nowrap select-none font-main font-medium text-xl md:text-xl text-text-main',
                value: 'select-none font-main font-bold text-4xl md:text-4xl text-primary-main'
            },
            title: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-3xl text-text-main',
            logs: {
                title: 'whitespace-nowrap select-none font-main font-regular text-base md:text-xl text-text-main',
                change: {
                    object: 'overflow-hidden text-ellipsis whitespace-nowrap select-none font-main font-regular text-sm md:text-lg text-primary-main',
                    message: 'whitespace-nowrap select-none font-main font-light text-sm md:text-lg text-text-main'
                }
            },
            images: {
                item: {
                    name: 'select-none font-main font-light text-base md:text-xl text-text-main',
                    subtitle: 'select-none font-main font-light text-tiny md:text-xs text-text-main',
                }
            },
        },
        money: {
            amount: 'select-none font-main font-light text-lg md:text-xl text-text-main'
        },
        competitor: 'whitespace-nowrap select-none font-main font-light md:font-regular text-lg md:text-xl text-reverse-0'
    }

    let option = useMemo(() => {
        let presetPath = preset.split('-')
        let option = options[presetPath[0]]
        for (const path of presetPath.slice(1)) {
            option = option[path]
        }
        return option ? option : ''
    }, [preset])

    return (
        <p className = {option + (classes ? ' ' + classes : '')} style = {styles} {...extras}>{children}</p>
    )
}, (b, a) => b.preset === a.preset && _.isEqual(b.styles, a.styles) && b.classes === a.classes && b.children === a.children && b.extras === a.extras)

export default Text