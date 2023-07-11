import React, { memo, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import _ from 'lodash'
import Text from './text'
import Map from './map'
import calculateOdds from '../lib/util/calculateOdds'


const Odds = memo(function Odds({ event, parentId }) {
    let DOMId = parentId + '-odds'
    if (event.odds) {
        return (
            <div id = {DOMId} className = 'w-full h-full grid grid-cols-4 gap-small'>
                <Map array = {event.odds} callback = {(odds, oddsIndex) => {
                    let values = odds.outcomes[0].values
                    if (values) {
                        return (
                            <Map key = {oddsIndex} array = {values} callback = {(outcome, outcomeIndex) => {
                                let outcomeId = DOMId + 'outcome-' + outcomeIndex + '-'
                                return (
                                    <div key = {outcomeIndex} id = {outcomeId + 'container'} className = 'relative w-full h-full flex flex-col justify-center p-small rounded-main border-thin border-divider-main md:shadow-sm'>
                                        <Name category = {odds.key} name = {odds.name} outcome = {outcome} parentId = {outcomeId}/>
                                        <Odd key = {outcomeIndex} value = {outcome.odds} preset = 'odds-value' parentId = {outcomeId}/>
                                        {/* <div id = {DOMId + 'options'} className = {'absolute top-full right-0 w-min flex flex-col mt-small overflow-hidden h-min bg-base-main py-tiny px-smaller rounded-small border-thin border-divider-main md:shadow' + (!isExpanded ? ' hidden' : '')}>
                                            <Map array = {options} callback = {(option, index) => {
                                                let optionId = DOMId + option.value + '-'; return (
                                                    <>
                                                        <div key = {index} id = {optionId + 'container'} className = 'group/option w-full h-min flex flex-row items-center gap-small cursor-pointer' onClick = {() => onInputChange(option.value)}>
                                                            <Text id = {optionId + 'title'} preset = 'settings-setting-option-title'>
                                                                {option.title}
                                                            </Text>
                                                            <Conditional value = {option.value === input}>
                                                                <CheckRounded className = {'!w-4 !h-4 text-primary-main'}/>
                                                            </Conditional>
                                                        </div>
                                                    </>
                                            )}}/>
                                        </div> */}
                                    </div>
                                )
                            }}/>
                    )}
                }}/>
            </div>
        )
    }
}, (b, a) => _.isEqual(b.event, a.event) && _.isEqual(b.competitor, a.competitor))

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

const Odd = memo(function Odd({value, preset, parentId }) {
    const [cookies,,] = useCookies(['odds_format'])
    let DOMId = parentId + '-value'
    return (
        <Text id = {DOMId} preset = {preset}>
            {calculateOdds(cookies['odds_format'], value ? value : 100)}
        </Text>
    )
})

export default Odds