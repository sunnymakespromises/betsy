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
            money: 'select-none font-main font-light text-lg md:text-xl text-text-main'
        },
        home: {
            panel: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
        },
        events: {
            name: 'whitespace-nowrap overflow-hidden text-ellipsis select-none font-main font-medium text-base md:text-base text-primary-main',
            subtitle: 'select-none font-main font-regular text-tiny md:text-tiny text-text-highlight',
        },
        login: {
            title: 'select-none font-main font-black text-6xl md:text-7xl text-text-main text-center',
            subtitle: 'whitespace-nowrap select-none font-main font-bold text-base md:text-base text-text-main',
            body: 'select-none font-main font-light text-sm md:text-base text-text-main',
            option: 'select-none font-main font-regular text-sm md:text-base text-text-main'
        },
        info: {
            panel: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
            item: {
                title: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
                subtitle: 'whitespace-nowrap select-none font-main font-regular text-xs md:text-xs text-text-main'
            },
            notFound: 'select-none font-main font-medium text-base md:text-base text-text-main/killed',
            error: 'select-none font-main font-medium text-sm md:text-sm text-text-primary'
        },
        settings: {
            title: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
            donate: {
                body: 'select-none font-main font-regular text-tiny md:text-tiny text-text-main text-center',
                link: 'select-none font-main font-regular text-tiny md:text-tiny text-primary-main'
            },
            setting: {
                title: 'select-none whitespace-nowrap font-main font-medium text-base md:text-base text-text-main',
                option: {
                    title: 'select-none font-main font-medium text-sm md:text-sm text-text-main'
                }
            },
            footer: {
                body: 'select-none whitespace-nowrap font-main font-light text-tiny md:text-tiny text-text-main text-center',
                link: 'select-none whitespace-nowrap font-main font-medium text-tiny md:text-tiny text-primary-main'
            },
            logout: 'whitespace-nowrap select-none font-main font-medium text-base md:text-base text-text-main',
        },
        profile: {
            display_name: 'whitespace-nowrap select-none font-main font-medium text-base md:text-base text-text-main text-center',
            subtitle: 'whitespace-nowrap select-none font-main font-medium text-tiny md:text-tiny text-text-main',
            stat: {
                title: 'whitespace-nowrap select-none font-main font-medium text-xs md:text-xs text-text-main',
                value: 'whitespace-nowrap select-none font-main font-medium text-xs md:text-xs text-text-main'
            },
            error: 'select-none font-main font-medium text-tiny md:text-tiny text-text-main'
        },
        search: {
            results: {
                category: 'whitespace-nowrap select-none font-main font-medium text-base md:text-base text-primary-main',
            },
            result: {
                title: 'overflow-hidden text-ellipsis whitespace-nowrap select-none font-main font-regular text-sm md:text-sm text-text-main'
            }
        },
        dev: {
            stat: {
                title: 'whitespace-nowrap select-none font-main font-medium text-tiny md:text-tiny text-text-main',
                value: 'select-none font-main font-bold text-xl md:text-xl text-text-main'
            },
            title: 'whitespace-nowrap select-none font-main font-bold text-xl md:text-xl text-text-main',
            logs: {
                title: 'whitespace-nowrap select-none font-main font-medium text-xs md:text-sm text-primary-main',
                change: {
                    object: 'overflow-hidden text-ellipsis whitespace-nowrap select-none font-main font-regular text-xs md:text-xs text-primary-main',
                    message: 'whitespace-nowrap select-none font-main font-regular text-xs md:text-xs text-text-main'
                }
            },
            images: {
                item: 'select-none font-main font-medium text-sm md:text-sm text-primary-main cursor-pointer'
            },
        },
        odds: {
            name: 'select-none font-main font-medium text-tiny md:text-tiny text-text-main text-center',
            value: 'select-none font-main font-bold text-sm md:text-lg text-text-main text-center',
            notFound: 'select-none font-main font-medium text-tiny md:text-sm text-text-main/10 text-center',
            option: {
                title: 'select-none font-main font-medium text-micro md:text-tiny text-text-main text-center'
            }
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
}, (b, a) => b.preset === a.preset && b.classes === a.classes && b.children === a.children && _.isEqual(b.extras, a.extras) && _.isEqual(b.styles, a.styles))


export default Text