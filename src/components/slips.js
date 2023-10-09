import React, { memo, useMemo, useState } from 'react'
import { CaretRightFill, Check, Plus, X } from 'react-bootstrap-icons'
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
import Button from './button'
import Error from './error'
import toDate from '../lib/util/toDate'
import { compressSlip, expandSlip, getMostRecentVersionOfPick } from '../lib/util/manipulateBets'
import { Link } from 'react-router-dom'
import Image from './image'

const Slips = memo(function Slips({ compressedSlips, isEditable = false, parentId }) {
    let DOMId = parentId + '-slips'
    const { data } = useDataContext()

    return (
        <div id = {DOMId + '-slips'} className = 'w-full h-full flex flex-col gap-lg'>
            <Conditional value = {compressedSlips?.length > 0}>
                <Map items = {compressedSlips} callback = {(compressedSlip, index) => {
                    let compressedSlipId = DOMId + '-slip' + index; return (
                    <Slip key = {index} compressedSlip = {compressedSlip} events = {data.events} isEditable = {isEditable} parentId = {compressedSlipId}/>
                )}}/>
            </Conditional>
            <Conditional value = {compressedSlips?.length < 1}>
                <Text id = {DOMId + '-slips-not-found'} preset = 'body' classes = 'text-text-highlight/killed'>
                    No slips found.
                </Text>
            </Conditional>
        </div>
    )
}, (b, a) => b.isEditable === a.isEditable && _.isEqual(b.compressedSlips, a.compressedSlips))

const Slip = memo(function Slip({ compressedSlip, events, isEditable, parentId }) {
    let DOMId = parentId
    const { statuses: status, setStatus } = useStatuses()
    const { input: wager, onInputChange: onWagerChange, inputIsEmpty: wagerIsEmpty, clearInput: clearWager } = useInput()
    let expandedSlip = useMemo(() => expandSlip(events, compressedSlip), [compressedSlip])
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

    if (expandedSlip.picks.length > 0) {
        return (
            <>
                <div id = {DOMId} className = {'group/slip relative transition-colors duration-main w-full flex flex-col items-center gap-base'}>
                    <div id = {DOMId + '-bar'} className = 'w-full flex justify-between items-center'>
                        <div id = {DOMId + '-bar-actions'} className = 'flex items-center gap-sm'>
                            {expandedSlip.user && 
                            <Link id = {DOMId + '-user-image'} to = {'/user?id=' + expandedSlip.user.id} className = 'transition-colors duration-main h-8 aspect-square flex justify-center items-center overflow-hidden rounded-full border-base border-primary-main hover:border-primary-highlight'>
                                <Conditional value = {!expandedSlip.user.picture}>
                                    <Text id = {DOMId + '-user-image-text'} preset = 'body' classes = 'text-black/muted'>
                                        {expandedSlip.user.name?.substr(0, 1)}
                                    </Text>
                                </Conditional>
                                <Conditional value = {expandedSlip.user.picture}>
                                    <Image id = {DOMId + '-user-image-image'} external path = {expandedSlip.user.picture} classes = 'w-full aspect-square'/>
                                </Conditional>
                            </Link>}
                            <Conditional value = {isEditable}>
                                <Button id = {DOMId + '-remove'} preset = 'main' onClick = {() => removeCompressedSlip(true)}>
                                    <X id = {DOMId + '-remove-icon'} className = 'text-xl text-text-primary'/>
                                    <Text id = {DOMId + '-remove-text'} preset = 'body' classes = 'text-text-primary'>
                                        Remove
                                    </Text>
                                </Button>
                            </Conditional>
                            <Conditional value = {expandedSlip.did_hit === null || isEditable}>
                                <Button id = {DOMId + '-copy'} preset = 'main' onClick = {() => setIsSelecting(true)}>
                                    <Plus id = {DOMId + '-copy-icon'} className = 'text-xl text-text-primary'/>
                                    <Text id = {DOMId + '-copy-text'} preset = 'body' classes = 'text-text-primary'>
                                        Copy
                                    </Text>
                                </Button>
                            </Conditional>
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
                    <div id = {DOMId + '-wager'} className = 'w-full h-min flex flex-col gap-sm'>
                        <div id = {DOMId + '-wager-checkout'} className = {'transition-all duration-main flex items-center'}>
                            <Conditional value = {isEditable}>
                                <Text id = {DOMId + '-currency-symbol'} preset = 'title' classes = {'!font-bold text-text-highlight/killed'}>
                                    {currencySymbol}
                                </Text>
                                <Input id = {DOMId + '-wager-input'} preset = 'slip_wager' fitContent value = {wager} status = {status} onChange = {(e) => onChange(e)} placeholder = {'0.00'} autoComplete = 'off'/>
                                <Text id = {DOMId + '-currency-symbol'} preset = 'title' classes = {'!font-bold text-text-highlight/killed'}>
                                    &nbsp;
                                </Text>
                            </Conditional>
                            <Conditional value = {!isEditable}>
                                <Text id = {DOMId + '-wager-potential-earnings'} preset = 'title' classes = {'!font-bold text-text-highlight/killed'}>
                                    {wagerDisplay}&nbsp;
                                </Text>
                            </Conditional>
                            <CaretRightFill id = {DOMId + '-wager-transformation-icon'} className = 'font-bold text-base text-text-highlight/killed'/>
                            <Text id = {DOMId + '-wager-potential-earnings'} preset = 'title' classes = {'!font-bold ' + (expandedSlip.did_hit !== null ? (expandedSlip.did_hit === true ? 'text-positive-main' : expandedSlip.did_hit === false ? 'text-negative-main' : expandedSlip.did_hit === 'voided' ? 'text-text-highlight/killed' : 'text-primary-main') : ' text-primary-main')}>
                                &nbsp;{potentialEarningsDisplay}&nbsp;
                            </Text>
                            <Conditional value = {isEditable}>
                                <Save expandedSlip = {expandedSlip} wager = {wagerInDollars} odds = {totalOdds.decimal} potentialEarnings = {potentialEarningsInDollars} status = {status} setStatus = {setStatus} wagerIsEmpty = {wagerIsEmpty} removeCompressedSlip = {removeCompressedSlip} parentId = {DOMId + '-bet'}/>
                            </Conditional>
                            <Text id = {DOMId + '-date'} preset = 'body' classes = {'grow text-right text-text-main/10'}>
                                {toDate(expandedSlip.timestamp)}
                            </Text>
                        </div>
                        {status.status === false && <Error message = {status.message} parentId = {DOMId + '-bet'}/>}
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
        clearWager()
        removeCompressedSlipFromStore(compressedSlip)
    }

    function removeCompressedPick(compressedPick) {
        let newCompressedSlip = JSON.parse(JSON.stringify(compressedSlip))
        newCompressedSlip.picks = newCompressedSlip.picks.filter(compressedPick2 => compressedPick !== compressedPick2)
        if (newCompressedSlip.picks.length > 0) {
            editCompressedSlip(compressedSlip, newCompressedSlip)
        }
        else {
            removeCompressedSlipFromStore(compressedSlip)
        }
    }
}, (b, a) => b.isEditable === a.isEditable && _.isEqual(b.compressedSlip, a.compressedSlip) && _.isEqual(b.events, a.events))

const Save = memo(function Save({ expandedSlip, wager, odds, potentialEarnings, status, setStatus, wagerIsEmpty, removeCompressedSlip, parentId }) {
    let DOMId = parentId + '-save'
    const { placeBet } = useDatabase()

    return !wagerIsEmpty && (
        <Button id = {DOMId} preset = 'main' onClick = {() => onAction()}>
            <Check id = {DOMId + '-save-icon'} className = 'text-xl text-text-primary'/>
            <Text id = {DOMId + '-save-text'} preset = 'body' classes = 'text-text-primary'>
                Save
            </Text>
        </Button>
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