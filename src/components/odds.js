import React, { memo, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import _ from 'lodash'
import Text from './text'
import Map from './map'
import calculateOdds from '../lib/util/calculateOdds'
import List from './list'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Conditional from './conditional'


const Odds = memo(function Odds({ event, parentId }) {
    let DOMId = parentId + '-odds'
    if (event.odds) {
        return (
            <div id = {DOMId} className = 'w-full h-full grid grid-cols-4 gap-small'>
                <Map array = {event.odds} callback = {(odds, oddsIndex) => {
                    let values = odds.outcomes[0].values
                    if (values) { return (
                        <Map key = {oddsIndex} array = {values} callback = {(outcome, outcomeIndex) => {
                            let outcomeId = DOMId + '-outcome' + outcomeIndex; return (
                            <Odd key = {outcomeIndex} category = {odds.key} name = {odds.name} outcome = {outcome} parentId = {outcomeId}/>
                        )}}/>
                    )}
                }}/>
            </div>
        )
    }
}, (b, a) => _.isEqual(b.event, a.event) && _.isEqual(b.competitor, a.competitor))

const Odd = memo(function Odd({ category, name, outcome, parentId }) {
    let options = [
        {
            title: 'See Changes',
            fn: () => console.log(outcome)
        },
        {
            title: 'Add To Slip',
            fn: () => console.log(outcome)
        },
        {
            title: 'Cancel',
            fn: () => setIsExpanded(false)
        }
    ]
    const Option = memo(function Option({ item: option, parentId }) {
        let DOMId = parentId
        return (
            <div id = {DOMId} className = 'group/option w-full h-full flex flex-row items-center gap-small hover:bg-base-highlight px-main cursor-pointer' onClick = {() => option.fn()}>
                <Text id = {DOMId + '-title'} preset = 'odds-option-title'>
                    {option.title}
                </Text>
            </div>
        )
    })
    let [isExpanded, setIsExpanded] = useState(false)
    const cancelRef = useCancelDetector(() => isExpanded ? setIsExpanded(false) : null)

    let DOMId = parentId
    return (
        <div ref = {cancelRef} id = {DOMId} className = {'relative w-full h-full p-small overflow-hidden rounded-main border-thin border-divider-main md:shadow-sm ' + (isExpanded ? 'z-10' : 'z-0 hover:bg-base-highlight cursor-pointer')}>
            <div id = {DOMId + '-info'} className = 'h-full flex flex-col justify-center' onClick = {() => onClick()}>
                <Name category = {category} name = {name} outcome = {outcome} parentId = {DOMId}/>
                <Value value = {outcome.odds} preset = 'odds-value' parentId = {DOMId}/>
            </div>
            <Conditional value = {isExpanded}>
                <div id = {DOMId + '-options'} className = 'absolute top-0 left-0 w-full h-full flex flex-col bg-base-main'>
                    <List items = {options} element = {Option} classes = '!h-full' dividers parentId = {DOMId}/>
                </div>
            </Conditional>
        </div>
    )
    function onClick() {
        setIsExpanded(!isExpanded)
    }
}, (b, a) => b.category === a.category && b.name === a.name && _.isEqual(b.outcome, a.outcome))

const Name = memo(function Name({ category, name, outcome, parentId }) {
    let string = useMemo(() => {
        let string = ''
        if (category.includes('totals')) {
            string = outcome.name + ' ' + outcome.point
        }
        else if (category.includes('spreads')) {
            if (outcome.competitor) {
                string = outcome.competitor.name + ' ' + (outcome.point > 0 ? '+' : '') + outcome.point
            }
        }
        else {
            if (outcome.competitor) {
                string = outcome.competitor.name + ' ' + name
            }
            else {
                string = outcome.name
            }
        }
        return string
    }, [category, name, outcome])

    let DOMId = parentId + '-name'
    return (
        <Text id = {DOMId} preset = 'odds-name'>
            {string}
        </Text>
    )
}, (b, a) => b.category === a.category && b.name === a.name && _.isEqual(b.outcome, a.outcome))

const Value = memo(function Value({value, preset, parentId }) {
    const [cookies,,] = useCookies(['odds_format'])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = {preset}>
            {calculateOdds(cookies['odds_format'], value ? value : 100)}
        </Text>
    )
})

export default Odds