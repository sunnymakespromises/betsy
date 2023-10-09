import React, { memo, useMemo, useState } from 'react'
import _ from 'lodash'
import Conditional from './conditional'
import Text from './text'
import Map from './map'
import toDate from '../lib/util/toDate'
import { ArrowDownShort, ArrowUpShort, Check, CircleFill, X } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'
import { useCancelDetector } from '../hooks/useCancelDetector'

const RecentForm = memo(function RecentForm({ competitor, events, parentId }) {
    let DOMId = parentId + '-form'
    let results = useMemo(() => competitor.events.map(competitorEvent => { 
        return events.find(event => event.id === competitorEvent.id)
    }).filter(event => event !== null && Object.keys(event.results).length > 0).sort((a, b) => b.start_time - a.start_time), [competitor, events])
    
    return (
        <div id = {DOMId} className = {'w-full transition-all duration-main'}>
            <Conditional value = {results.length === 0}>
                <Text id = {DOMId + '-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                    No form found.
                </Text>
            </Conditional>
            <Conditional value = {results.length > 0}>
                <div id = {DOMId + '-wins'} className = 'flex items-center gap-sm'>
                    <Map items = {results.length < 5 ? [...results, ...(new Array(5).fill(null))].slice(0, 5) : results?.slice(0, 5)} callback = {(event, index) => {
                        let resultId = DOMId + '-wins-event' + index; return (
                        <Result key = {index} competitor = {competitor} event = {event} parentId = {resultId} />
                    )}}/>
                </div>
            </Conditional>
        </div>
    )
}, (b, a) => _.isEqual(b.competitor, a.competitor) && _.isEqual(b.events, a.events))

const Result = memo(function Result({ competitor, event, parentId }) {
    let DOMId = parentId
    const [isExpanded, setIsExpanded]= useState()
    const clickRef = useCancelDetector(() => setIsExpanded(false))
    let score = useMemo(() => { 
        if (event === null) {
            return null
        }
        return (
            <div id = {DOMId + '-modal-scores'} className = 'flex items-center'>
                <Map items = {event.results.scores} callback = {(score, index) => {
                    let scoreId = DOMId + '-modal-scores-score' + index; return (
                    <React.Fragment key = {index}>
                        <Text id = {scoreId} preset = 'title' classes = {'!font-bold whitespace-nowrap ' + (score.competitor?.id === competitor.id ? 'text-text-highlight' : 'text-text-highlight/killed')}>
                            {score.score}
                        </Text>
                        <Conditional value = {index !== event.results.scores.length - 1}>
                            <Text id = {scoreId + '-separator'} preset = 'title' classes = {'!font-bold whitespace-nowrap text-text-highlight/killed'}>
                                &nbsp;-&nbsp;
                            </Text>
                        </Conditional>
                    </React.Fragment>
                )}}/>
            </div>
        )
    }, [event])

    let didWin = useMemo(() => { 
        if (event === null) {
            return null
        }
        if (event.results.scores.map(score => score.score).reduce((a, b) => a === b)) {
            return 'draw'
        }
        return event.results?.scores?.reduce((a, b) => (a.score > b.score) ? a : b)?.competitor?.id === competitor.id
    }, [event, competitor])
    let otherCompetitor = useMemo(() => event?.competitors?.find(eventCompetitor => eventCompetitor.id !== competitor.id), [event, competitor])

    return (
        <div id = {DOMId} className = 'relative w-min h-min' ref = {clickRef}>
            <CircleFill id = {DOMId + '-icon'} className = {'transition-all duration-main text-3xl ' + (didWin !== null ? 'cursor-pointer ' + (didWin !== 'draw' ? (didWin ? 'text-positive-main hover:text-positive-highlight' : 'text-negative-main hover:text-negative-highlight') : 'text-base-main') : 'text-base-main/killed')} onClick = {() => event !== null ? setIsExpanded(!isExpanded) : null} />
            {event && (
                <div id = {DOMId + '-modal'} className = {'transition-all duration-main absolute top-full left-1/2 -translate-x-1/2 w-min flex flex-col items-center gap-xs mt-sm bg-base-highlight rounded-base overflow-hidden shadow-md ' + (isExpanded ? 'max-h-min p-base ' : 'max-h-0 p-0 ')}>
                    <Text id = {DOMId + '-modal-date'} preset = 'subtitle' classes = 'whitespace-nowrap text-text-highlight/killed'>
                        {toDate(event.start_time, true)}
                    </Text>
                    {score}
                    <Link id = {DOMId + '-modal-event-link'} to = {'/info?category=events&id=' + event.id}>
                        <Text id = {DOMId + '-modal-competitor1-name'} preset = 'body' classes = '!text-lg text-primary-main text-primary-highlight whitespace-nowrap overflow-hidden text-ellipsis'>
                            vs.&nbsp;{otherCompetitor.name}
                        </Text>
                    </Link>
                    {event.results.bets?.length > 0 &&
                    <div id = {DOMId + '-modal-bets'} className = 'w-full flex flex-col items-start gap-xs'>
                        <Map items = {event.results.bets} callback = {(bet, index) => {
                            let betDidHit = bet.key === 'totals' ? event.results.scores.reduce((a, b) => a.score + b.score) > bet.values[0].point : bet.values.find(value => value.competitor?.id === competitor.id).did_hit
                            let betId = DOMId + '-bet' + index; return (
                            <div key = {index} id = {betId + '-container'} className = 'flex items-center'>
                                {bet.key !== 'totals' && <>
                                <Conditional value = {betDidHit}>
                                    <Check id = {betId + '-check'} className = 'text-lg text-positive-main'/>
                                </Conditional>
                                <Conditional value = {!betDidHit}>
                                    <X id = {betId + '-check'} className = 'text-lg text-negative-main'/>
                                </Conditional></>}

                                {bet.key === 'totals' && <>
                                <Conditional value = {betDidHit}>
                                    <ArrowUpShort id = {betId + '-over'} className = 'text-lg text-text-highlight'/>
                                </Conditional>
                                <Conditional value = {!betDidHit}>
                                    <ArrowDownShort id = {betId + '-under'} className = 'text-lg text-text-highlight'/>
                                </Conditional></>}

                                <Text id = {betId + '-name'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                                    {bet.name}{bet.key === 'totals' || bet.key === 'spreads' ? ' ' + bet.values[0].point : ''}
                                </Text>
                            </div>
                        )}}/>
                    </div>}
                </div>
            )}
        </div>
    )
}, (b, a) => _.isEqual(b.competitor, a.competitor) && _.isEqual(b.event, a.event))

export default RecentForm