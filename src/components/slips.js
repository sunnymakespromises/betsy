import React, { memo, useMemo, useState } from 'react'
import { CaretRightFill, CheckLg, Plus } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useStore } from '../hooks/useStore'
import { useCurrency } from '../hooks/useCurrency'
import { useOdds } from '../hooks/useOdds'
import { useStatuses } from '../hooks/useStatuses'
import { useInput } from '../hooks/useInput'
import { useDatabase } from '../hooks/useDatabase'
import Map from './map'
import Text from './text'
import Conditional from './conditional'
import Pick from './pick'
import Input from './input'
import SelectSlips from './selectSlips'
import Error from './error'
import toDate from '../lib/util/toDate'
import { compressSlip, expandSlip, getMostRecentVersionOfPick } from '../lib/util/manipulateBets'

const Slips = memo(function Slips({ compressedSlips, isEditable = false, isTailable = false, showPotentialEarnings = true, parentId }) {
    const { data } = useDataContext()

    let DOMId = parentId + '-slips'
    return (
        <div id = {DOMId + '-slips'} className = 'w-full h-full flex flex-col gap-lg'>
            <Conditional value = {compressedSlips?.length > 0}>
                <Map items = {compressedSlips} callback = {(compressedSlip, index) => {
                    let compressedSlipId = DOMId + '-slip' + index; return (
                    <Slip key = {index} compressedSlip = {compressedSlip} events = {data.events} isEditable = {isEditable} isTailable = {isTailable} showPotentialEarnings = {showPotentialEarnings} parentId = {compressedSlipId}/>
                )}}/>
            </Conditional>
            <Conditional value = {compressedSlips?.length < 1}>
                <Text id = {DOMId + '-slips-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                    No slips found.
                </Text>
            </Conditional>
        </div>
    )
}, (b, a) => b.isTailable === a.isTailable && b.isEditable === a.isEditable && b.showPotentialEarnings === a.showPotentialEarnings && _.isEqual(b.compressedSlips, a.compressedSlips))

const Slip = memo(function Slip({ compressedSlip, events, isEditable, isTailable, showPotentialEarnings, parentId }) {
    const { statuses: status, setStatus } = useStatuses()
    const { input: wager, onInputChange: onWagerChange, inputIsEmpty: wagerIsEmpty, clearInput: clearWager } = useInput()
    let expandedSlip = useMemo(() => expandSlip(events, compressedSlip), [compressedSlip])
    console.log(events, compressedSlip, expandedSlip)
    const { getOddsFromPicks } = useOdds()
    const { getAmount, getSymbol } = useCurrency()
    let currencySymbol = useMemo(() => getSymbol(), [])
    let totalOdds = useMemo(() => getOddsFromPicks(expandedSlip.picks), [compressedSlip])
    let potentialEarningsDisplay = useMemo(() => getAmount(isEditable ? null : 'dollars', null, isEditable ? (Number(wager) ? totalOdds.decimal * Number(wager) : 0) : (Number(expandedSlip.wager) ? totalOdds.decimal * Number(expandedSlip.wager) : 0), false).string, [totalOdds, expandedSlip, wager])
    let wagerDisplay = useMemo(() => getAmount(isEditable ? null : 'dollars', null, isEditable ? (Number(wager) ? Number(wager) : 0) : (Number(expandedSlip.wager) ? Number(expandedSlip.wager) : 0), false).string, [expandedSlip, wager])
    let potentialEarningsInDollars = useMemo(() => getAmount(null, 'dollars', Number(wager) ? totalOdds.decimal *  Number(wager) : 0, false).value, [totalOdds, wager])
    let wagerInDollars = useMemo(() => getAmount(null, 'dollars', Number(wager) ? Number(wager) : 0, false).value, [totalOdds, wager])
    let [, , removeCompressedSlipFromStore, editCompressedSlip, ] = useStore('user_slips', 'array')
    let [isSelecting, setIsSelecting] = useState(false)

    let grid = expandedSlip.picks.length >= 3 ? 'grid-cols-3' : expandedSlip.picks.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
    let DOMId = parentId
    if (expandedSlip.picks.length > 0) {
        return (
            <>
                <div id = {DOMId} className = {'group/slip relative transition-colors duration-main w-full flex flex-col items-center gap-sm'}>
                    <div id = {DOMId + '-bar'} className = 'w-full flex justify-between items-center'>
                        <div id = {DOMId + '-bar-right'} className = 'flex items-center gap-sm'>
                            <Conditional value = {isTailable && expandedSlip.did_hit === null}>
                                <div id = {DOMId + '-add'} className = 'transition-colors duration-main flex items-center py-2xs px-sm bg-primary-main hover:bg-primary-highlight rounded-base cursor-pointer' onClick = {() => setIsSelecting(true)}>
                                    <Plus id = {DOMId + '-add-icon'} className = 'text-xl text-text-primary'/>
                                    <Text id = {DOMId + '-add-text'} preset = 'body' classes = 'text-text-primary'>
                                        Tail
                                    </Text>
                                </div>
                            </Conditional>
                            <Text id = {DOMId + '-date'} preset = 'body' classes = {'text-text-main/10'}>
                                {toDate(expandedSlip.timestamp)}
                            </Text>
                        </div>
                        <Text id = {DOMId + '-total-odds'} preset = 'title' classes = {'!font-bold ' + (expandedSlip.did_hit !== null ? (expandedSlip.did_hit === true ? 'text-positive-main' : expandedSlip.did_hit === false ? 'text-negative-main' : 'text-text-main/killed') : 'text-primary-main')}>
                            {totalOdds.string}
                        </Text>
                    </div>
                    <div id = {DOMId + '-picks'} className = {'w-full grid ' + grid + ' gap-base'}>
                        <Map items = {expandedSlip.picks} callback = {(expandedPick, index) => {
                            let expandedPickId = DOMId + '-pick' + index; return (
                            <Pick key = {index} expandedPick = {expandedPick} events = {events} isEditable = {isEditable} isDetailed onRemove = {removeCompressedPick} parentId = {expandedPickId}/>
                        )}}/>
                    </div>
                    <div id = {DOMId + '-bet'} className = 'w-full h-min'>
                        <Conditional value = {showPotentialEarnings}>
                            <div id = {DOMId + '-bet-checkout'} className = {'transition-all duration-main flex items-center'}>
                                <Conditional value = {isEditable}>
                                    <Text id = {DOMId + '-currency-symbol'} preset = 'title' classes = {'!font-bold text-text-main/killed'}>
                                        {currencySymbol}
                                    </Text>
                                    <Input id = {DOMId + '-wager-input'} preset = 'slip_wager' fitContent value = {wager} status = {status} onChange = {(e) => onChange(e)} placeholder = {'0.00'} autoComplete = 'off'/>
                                    <Text id = {DOMId + '-currency-symbol'} preset = 'title' classes = {'!font-bold text-text-main/killed'}>
                                        &nbsp;
                                    </Text>
                                </Conditional>
                                <Conditional value = {!isEditable}>
                                    <Text id = {DOMId + '-bet-potential-earnings'} preset = 'title' classes = {'!font-bold text-text-main/killed'}>
                                        {wagerDisplay}&nbsp;
                                    </Text>
                                </Conditional>
                                <CaretRightFill className = 'font-bold text-base text-text-main/killed'/>
                                <Text id = {DOMId + '-bet-potential-earnings'} preset = 'title' classes = {'!font-bold ' + (expandedSlip.did_hit !== null ? (expandedSlip.did_hit === true ? 'text-positive-main' : expandedSlip.did_hit === false ? 'text-negative-main' : expandedSlip.did_hit === 'voided' ? 'text-text-main/killed' : 'text-primary-main') : ' text-primary-main')}>
                                    &nbsp;{potentialEarningsDisplay}&nbsp;
                                </Text>
                                <Conditional value = {isEditable}>
                                    <Save expandedSlip = {expandedSlip} wager = {wagerInDollars} odds = {totalOdds.american} potentialEarnings = {potentialEarningsInDollars} status = {status} setStatus = {setStatus} wagerIsEmpty = {wagerIsEmpty} removeCompressedSlip = {removeCompressedSlip} parentId = {DOMId + '-bet'}/>
                                </Conditional>
                                {status.status === false && <Error message = {status.message} classes = 'text-right' parentId = {DOMId + '-bet'}/>}
                            </div>
                        </Conditional>
                    </div>
                </div>
                <Conditional value = {isSelecting}>
                    <SelectSlips expandedPicksToAdd = {expandedSlip.picks.map(expandedPick => getMostRecentVersionOfPick(expandedPick))} events = {events} setIsSelecting = {setIsSelecting} parentId = {DOMId}/>
                </Conditional>
            </>
        )
    }
    return null
    
    function onChange(event) {
        let numberOfDecimals = 0
        let value = event.target.value.replace(/[^\d.]/g, '').replace(/\./g, function (match) {
            numberOfDecimals++
            return (numberOfDecimals === 2) ? '' : match
        })
        if (value.split('.').length === 2) {
            let [whole, fraction] = value.split('.')
            if (fraction.length > 2) {
                value = whole + '.' + fraction.substring(0, 2)
            }
        }
        onWagerChange('wager', value, 'text')
    }

    function removeCompressedSlip() {
        if (isEditable) {
            clearWager()
            removeCompressedSlipFromStore(compressedSlip)
        }
    }

    function removeCompressedPick(compressedPick) {
        if (isEditable) {
            let newCompressedSlip = JSON.parse(JSON.stringify(compressedSlip))
            newCompressedSlip.picks = newCompressedSlip.picks.filter(compressedPick2 => compressedPick !== compressedPick2)
            if (newCompressedSlip.picks.length > 0) {
                editCompressedSlip(compressedSlip, newCompressedSlip)
            }
            else {
                removeCompressedSlipFromStore(compressedSlip)
            }
        }
    }
}, (b, a) => b.isTailable === a.isTailable && b.showPotentialEarnings === a.showPotentialEarnings && b.isEditable === a.isEditable && _.isEqual(b.compressedSlip, a.compressedSlip) && _.isEqual(b.events, a.events))

const Save = memo(function Save({ expandedSlip, wager, odds, potentialEarnings, status, setStatus, wagerIsEmpty, removeCompressedSlip, parentId }) {
    const { placeBet } = useDatabase()

    let DOMId = parentId + '-save'
    return !wagerIsEmpty && (
        <div id = {DOMId} className = {'group/save transition-all duration-main h-min overflow-hidden cursor-pointer ' + (wagerIsEmpty ? 'max-w-0' : 'max-w-full') + ' !animate-duration-300' +  + (status.status === false ? ' animate-headShake ' : '')} onClick = {() => onAction()}>
            <CheckLg id = {DOMId + '-icon'} className = {'transition-colors duration-main text-2xl text-primary-main group-hover/save:text-primary-highlight'}/>
        </div>
    )

    async function onAction() {
        if (!wagerIsEmpty) {
            const { status, message } = await placeBet(expandedSlip, wager, odds, potentialEarnings)
            setStatus(status, message, 2000)
            if (status) {
                removeCompressedSlip(compressSlip(expandedSlip))
            }
        }
    }
}, (b, a) => b.wagerIsEmpty === a.wagerIsEmpty && b.status === a.status && _.isEqual(b.wager, a.wager) && _.isEqual(b.expandedSlip, a.expandedSlip) && _.isEqual(b.odds, a.odds) && _.isEqual(b.potentialEarnings, a.potentialEarnings))

export default Slips