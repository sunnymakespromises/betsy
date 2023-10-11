import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDownShort, ArrowUpShort, Check, X } from 'react-bootstrap-icons'
import Map from './map'
import Conditional from './conditional'
import Text from './text'
import toDate from '../lib/util/toDate'
import _ from 'lodash'

const Results = memo(function Results({ events, parentId }) {
    let DOMId = parentId + '-history'
    return (
        <div id = {DOMId} className = 'w-full flex flex-col items-center gap-base'>
            <Map items = {events} callback = {(matchup, index) => {
                let matchupId = DOMId + '-matchup' + index; return (
                <div key = {index} id = {matchupId} className = 'w-full flex flex-col items-center gap-xs'>
                    <Text id = {matchupId + '-date'} preset = 'subtitle' classes = 'text-text-highlight/killed'>
                        {toDate(matchup.start_time)}
                    </Text>
                    {Object.keys(matchup.results).length > 0 ? 
                    <>
                        {matchup.results.scores?.length > 0 &&
                        <div id = {matchupId + '-scores'} className = 'w-full flex items-center'>
                            <Map items = {matchup.competitors} callback = {(competitor, index) => {
                                let otherScore = matchup.results.scores.find(score => score.competitor?.id !== competitor.id)
                                let score = matchup.results.scores.find(score => score.competitor?.id === competitor.id)
                                let scoreId = matchupId + '-scores-score' + index; return (
                                <React.Fragment key = {index}>
                                    <Conditional value = {index === 0}>
                                        <div id = {scoreId + '-competitor0'} className = 'w-full flex justify-end'>
                                            <Link id = {scoreId + '-competitor0-link'} to = {'/info?category=competitors&id=' + score.competitor.id} className = 'flex w-min'>
                                                <Text id = {scoreId + '-competitor0-name'} preset = 'title' classes = {'whitespace-nowrap text-primary-main text-left'}>
                                                    {score.competitor.name}&nbsp;&nbsp;
                                                </Text>
                                            </Link>
                                        </div>
                                    </Conditional>
                                    <Text id = {scoreId} preset = 'title' classes = {'!font-bold whitespace-nowrap ' + (score.score >= otherScore.score ? 'text-text-highlight' : 'text-text-highlight/muted')}>
                                        {score.score}
                                    </Text>
                                    <Conditional value = {index !== 0}>
                                        <div id = {scoreId + '-competitor1'} className = 'w-full flex'>
                                            <Link id = {scoreId + '-competitor1-link'} to = {'/info?category=competitors&id=' + score.competitor.id} className = 'flex w-min'>
                                                <Text id = {scoreId + '-competitor1-name'} preset = 'title' classes = {'whitespace-nowrap text-primary-main'}>
                                                    &nbsp;&nbsp;{score.competitor.name}
                                                </Text>
                                            </Link>
                                        </div>
                                    </Conditional>
                                    <Conditional value = {index === 0}>
                                        <Text id = {scoreId + '-separator'} preset = 'title' classes = {'!font-bold whitespace-nowrap text-text-highlight/killed'}>
                                            &nbsp;-&nbsp;
                                        </Text>
                                    </Conditional>
                                </React.Fragment>
                            )}}/>
                        </div>}
                        {matchup.results.bets?.length > 0 &&
                        <div id = {matchupId + '-bets'} className = 'w-full flex flex-col gap-xs'>
                            <Map items = {matchup.results.bets} callback = {(bet, index) => {
                                let competitorDidHit = bet.key === 'totals' ? matchup.results.scores.reduce((a, b) => a.score + b.score) > bet.values[0].point : matchup.competitors.map(competitor => bet.values.find(value => value.competitor?.id === competitor.id).did_hit)
                                let betId = matchupId + '-bet' + index; return (
                                <div key = {index} id = {betId} className = 'w-full flex items-center justify-center'>
                                    {bet.key !== 'totals' && <>
                                    <Conditional value = {competitorDidHit[0]}>
                                        <Check id = {betId + '-check'} className = 'text-xl text-positive-main'/>
                                    </Conditional>
                                    <Conditional value = {!competitorDidHit[0]}>
                                        <X id = {betId + '-check'} className = 'text-xl text-negative-main'/>
                                    </Conditional></>}
    
                                    <Text id = {betId + '-bet-name'} preset = 'body' classes = 'text-text-highlight whitespace-nowrap'>
                                        {bet.name}{bet.key === 'totals' || bet.key === 'spreads' ? ' ' + bet.values[0].point : ''}
                                    </Text>

                                    {bet.key === 'totals' && <>
                                    <Conditional value = {competitorDidHit}>
                                        <ArrowUpShort id = {betId + '-over'} className = 'text-xl text-text-highlight'/>
                                    </Conditional>
                                    <Conditional value = {!competitorDidHit}>
                                        <ArrowDownShort id = {betId + '-under'} className = 'text-xl text-text-highlight'/>
                                    </Conditional></>}
    
                                    {bet.key !== 'totals' && <>
                                    <Conditional value = {competitorDidHit[1]}>
                                        <Check id = {betId + '-check'} className = 'text-xl text-positive-main'/>
                                    </Conditional>
                                    <Conditional value = {!competitorDidHit[1]}>
                                        <X id = {betId + '-check'} className = 'text-xl text-negative-main'/>
                                    </Conditional></>}
                                </div>
                            )}}/>
                        </div>}
                    </>
                    :
                    <Text id = {matchupId + '-not-found'} preset = 'body' classes = {'text-text-highlight/killed'}>
                        No results found.
                    </Text>}
                </div>
            )}}/>
        </div>
    )
}, (b, a) => _.isEqual(b.events, a.events))

export default Results