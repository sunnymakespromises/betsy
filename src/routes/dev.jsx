import React, { memo, useMemo, useRef, useState  } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { ExpandMoreRounded, SortByAlphaRounded } from '@mui/icons-material'
import { useDataContext } from '../contexts/data'
import { useUserContext } from '../contexts/user'
import { useCancelDetector } from '../hooks/useCancelDetector'
import Page from '../components/page'
import Search from '../components/search'
import { useDev } from '../hooks/useDev'
import Map from '../components/map'
import Conditional from '../components/conditional'
import Text from '../components/text'
import List from '../components/list'
import {default as ImageComponent} from '../components/image'
import toDate from '../lib/util/toDate'

const Dev = memo(function Dev() {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchParamsRef = useRef()
    searchParamsRef.current = searchParams
    const { currentUser } = useUserContext()
    const { data } = useDataContext()
    const isDev = useMemo(() => currentUser && currentUser.is_dev, [currentUser])
    const selected = useMemo(() =>  { 
        let newSelected = []
        if (data && searchParams.get('selected')) {
            for (const item of searchParams.get('selected').split(',')) {
                let category = item.split('+')[0]
                let id = item.split('+')[1]
                newSelected.push({...data[category]?.find(c => c.id === id), category: category, group: category})
            }
        }
        return newSelected
    }, [searchParams, data])
    const searchConfig = {
        filters: { 
            alphabetical: { 
                title: 'Sort Alphabetically', 
                icon: (props) => <SortByAlphaRounded {...props}/>,
                fn: (a) => a.sort((a, b) => (a.item.name.localeCompare(b.item.name)))
            }
        },
        categories: ['competitions', 'competitors'],
        spaces: null,
        keys: { competitions: ['name', 'competitions.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'] }
    }

    if (isDev) {
        let DOMId = 'dev-'
        return (
            <Page>
                <div id = {DOMId + 'page'} className = 'w-full h-full'>
                    <Helmet><title>Developer | Betsy</title></Helmet>
                    <Search searchConfig = {searchConfig} data = {data ? { competitions: data.competitions, competitors: data.competitors } : null} onResultClick = {onResultClick} parentId = {DOMId}>
                        <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col md:flex-row-reverse gap-small mt-small overflow-auto no-scrollbar md:overflow-hidden'>
                            <Conditional value = {selected?.length > 0}>
                                <div id = {DOMId + 'group-1-container'} className = 'w-full md:w-96 h-min md:h-full flex flex-col gap-smaller md:overflow-hidden'>
                                    <Selected selected = {selected} searchParams = {searchParamsRef.current} setSearchParams = {setSearchParams} parentId = {DOMId}/>
                                </div>
                            </Conditional>
                            <div id = {DOMId + 'logs-container'} className = 'grow h-min md:h-full flex flex-col md:flex-row gap-small md:gap-smaller'>
                                <Stats logs = {data?.logs} parentId = {DOMId + 'logs-'}/>
                                <Logs logs = {data?.logs} parentId = {DOMId + 'logs-'}/>
                            </div>
                        </div>
                    </Search>
                </div>
            </Page>
        )
    }

    function onResultClick(category, result) {
        let newSelected = searchParamsRef.current?.get('selected')?.length > 0 ? searchParamsRef.current.get('selected').includes(category + '+' + result.id) ? searchParamsRef.current.get('selected') : searchParamsRef.current.get('selected') + ',' + category + '+' + result.id : category + '+' + result.id
        if (category === 'competitions') {
            for (const competitor of data?.competitions?.find(c => c.id === result.id)?.competitors) {
                if (!newSelected.includes('competitors+' + competitor.id)) {
                    newSelected += ',competitors+' + competitor.id
                }
            }
        }
        let newSearchParams = {...Object.fromEntries([...searchParams, ['selected', newSelected]])}
        setSearchParams(newSearchParams, { replace: true })
    }
})

const Selected = memo(function Selected({ selected, searchParams, setSearchParams, parentId }) {
    let [uploadedItem, setUploadedItem] = useState()
    const { uploadPicture } = useDev()
    const pictureInput = useRef(null)
    const Item = memo(function Item({ item, parentId }) {
        return (
            <div id = {parentId + 'container'} className = 'flex flex-row items-center gap-tiny cursor-pointer'>
                <Conditional value = {item.picture}>
                    <ImageComponent id = {parentId + 'image'} external path = {item.picture} classes = 'w-8 h-8'/>
                </Conditional>
                <div id = {parentId + 'text-container'} className = 'flex flex-col'>
                    <div id = {parentId + 'subtitle-container'} className = 'flex flex-row'>
                        <Conditional value = {item.competition}>
                            <Text id = {parentId + 'competition'} preset = 'dev-images-item-subtitle'>
                                {item?.competition?.name}&nbsp;
                            </Text>
                        </Conditional>
                        <Text id = {parentId + 'sport'} preset = 'dev-images-item-subtitle'>
                            {item.sport.name}
                        </Text>
                    </div>
                    <Text id = {parentId + 'name'} preset = 'dev-images-item-name' classes = '-mt-micro'>
                        {item.name}
                    </Text>
                </div>
            </div>
        )
    }, (b, a) => _.isEqual(b.item, a.item))

    let DOMId = parentId + 'selected-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-min flex flex-col z-0 overflow-hidden'>
            <input id = {DOMId + 'input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <List items = {selected} element = {Item} onClick = {onClick} onRemove = {onRemove} parentId = {DOMId}/>
        </div>
    )

    function onRemove(item) {
        let newSelected = searchParams.get('selected').split(',').filter(p => p.split('+')[1] !== item.id).join(',')
        let newSearchParams = {...Object.fromEntries(newSelected?.length > 0 ? [...searchParams, ['selected', newSelected]] : [...searchParams].filter(p => p[0] !== 'selected'))}
        setSearchParams(newSearchParams, { replace: true })
    }

    async function onClick(item) {
        if (item) {
            setUploadedItem(item)
            pictureInput.current.click()
        }
    }

    async function onUpload(e) {
        const createImage = (url) => new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', error => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

        if (e.target.files[0]) {
            const image = await createImage(URL.createObjectURL(e.target.files[0]))
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = 720
            canvas.height = 720
            let x, y, width, height
            const aspectRatio = image.width / image.height // >1 = landscape, <1 = portrait
            x = aspectRatio >= 1 ? (image.width - image.height) / 2 : 0
            y = aspectRatio >= 1 ? 0 : (image.height - image.width) / 2
            width = aspectRatio >= 1 ? image.height : image.width
            height = aspectRatio >= 1 ? image.height : image.width
            ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height)
            let objectURL = URL.createObjectURL(await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob)
                }, 'image/png')
            }))
            if (uploadedItem && uploadedItem.category && objectURL) {
                await uploadPicture(uploadedItem.category, uploadedItem, objectURL)
            }
        }
    }
}, (b, a) => _.isEqual(b.selected, a.selected) && _.isEqual(b.searchParams, a.searchParams))

const Stats = memo(function Stats({ logs, parentId }) {
    const stats = [
        {
            title: 'Requests Left',
            value: () => {
                return logs ? logs.sort((a, b) => a.timestamp < b.timestamp).filter(log => log.totals.requests_remaining)[0].totals.requests_remaining : null
            }
        },
        {
            title: 'Requests/Day',
            value: () => {
                if (logs) {
                    let logsWithRequests = (logs.sort((a, b) => a.timestamp < b.timestamp).filter(log => log.totals.requests_remaining))
                    return ((logsWithRequests[logsWithRequests.length - 1].totals.requests_remaining - logsWithRequests[0].totals.requests_remaining) / 7).toFixed(2)
                }
                return null
            }
        },
    ]
    let DOMId = parentId + 'stats-' 
    return (
        <div id = {DOMId + 'container'} className = 'w-full md:w-min h-min flex flex-row flex-wrap md:flex-col gap-smaller md:gap-small bg-base-highlight rounded-main p-small'>
            <Map array = {stats} callback = {(stat, index) => {
                let statId = DOMId + 'stat-' + index + '-'; return (
                <React.Fragment key = {index}>
                    <Stat title = {stat.title} value = {stat.value()} parentId = {statId}/>
                    <Conditional value = {index !== stats.length - 1}>
                        <div className = 'divider border-t-thin border-l-thin border-divider-highlight'/>
                    </Conditional>
                </React.Fragment>
            )}}/>
        </div>
    )

}, (b, a) => _.isEqual(b.logs, a.logs))

const Stat = memo(function Stat({ title, value, parentId }) {
    return (
        <div id = {parentId + 'container'} className = 'w-min flex flex-col'>
            <Text id = {parentId + 'title'} preset = 'dev-stat-title'>
                {title}
            </Text>
            <Text id = {parentId + 'amount'} preset = 'dev-stat-value'>
                {value}
            </Text>
        </div>
    )
}, (b, a) => b.title === a.title && b.value === a.value)

const Logs = memo(function Logs({ logs, parentId }) {
    let changes = useMemo(() => {
        let newChanges = []
        if (logs) {
            for (const log of logs) {
                let logChanges = []
                let changes = Object.keys(log).filter(category => log[category].changes).map(category => log[category].changes)
                for (const change of changes) {
                    logChanges = [...logChanges, ...change]
                }
                newChanges.push({
                    title: toDate(log.timestamp),
                    changes: logChanges
                })
            }
        }
        return newChanges
    }, [logs])

    let DOMId = parentId + 'changes-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col gap-tiny md:overflow-hidden bg-base-highlight rounded-main p-small'>
            <Text id = {DOMId + 'title'} preset = 'dev-title'>
                Logs
            </Text>
            <div id = {DOMId + 'logs-container'} className = 'w-full h-full flex flex-col md:overflow-hidden'>
                <div id = {DOMId + 'logs'} className = 'w-full h-min md:overflow-auto no-scrollbar'>
                    <Map array = {changes} callback = {(log, index) => {
                        let logId = DOMId + 'log-' + index + '-'; return (
                            <React.Fragment key = {index}>
                            <div className = 'divider border-t-thin border-divider-highlight'/>
                            <Log key = {index} log = {log} hasDivider = {index !== changes.length - 1} parentId = {logId}/>
                            <Conditional value = {index === changes.length - 1}>
                                <div className = 'divider border-b-thin border-divider-highlight'/>
                            </Conditional>
                        </React.Fragment>
                    )}}/>
                </div>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.logs, a.logs))

const Log = memo(function Log({ log, parentId }) {
    const [isVisible, setIsVisible] = useState()
    const clickRef = useCancelDetector(() => isVisible ? setIsVisible(false) : null)
    return (
        <div ref = {clickRef} id = {parentId + 'container'} className = {'w-full h-min flex flex-col py-tiny md:py-small overflow-hidden'}>
            <div id = {parentId + 'title-container'} className = 'w-full flex flex-row items-center  gap-micro cursor-pointer' onClick = {onClick}>
                <Text id = {parentId + 'title'} preset = 'dev-logs-title'>
                    {log.title}
                </Text>
                <ExpandMoreRounded className = {'!transition-all duration-main !h-full aspect-square text-primary-main ' + (isVisible ? 'rotate-180' : '')}/>
            </div>
            <div id = {parentId + 'changes'} className = {'flex flex-col overflow-hidden ' + (isVisible ? 'h-min md:pt-micro' : 'h-0 md:pt-0')}>
                <Map array = {log.changes} callback = {(change, index) => {
                    let changeId = parentId + 'change-' + index + '-'; return (
                    <Change key = {index} change = {change} parentId = {changeId}/>
                )}}/>
            </div>
        </div>
    )

    function onClick() {
        setIsVisible(!isVisible)
    }
}, (b, a) => _.isEqual(b.log, a.log))

const Change = memo(function Change({ change, parentId }) {
    let sentence = useMemo(() => {
        let newSentence = []
        if (change) {
            for (let i = 0; i < change.messages.length; i++) {
                newSentence.push(<Text key = {'message' + i} preset = 'dev-logs-change-message'>{change.messages[i]}</Text>)
                if (change.objects[i] && change.categories[i]) {
                    newSentence.push(<Link key = {'object' + i} to = {'/info?category=' + change.categories[i] + '&id=' + change.objects[i].id}><Text preset = 'dev-logs-change-object'>{change.objects[i].name}</Text></Link>)
                }
            }
        }
        return newSentence
    }, [change])
    let DOMId = parentId + 'change-'
    if (sentence?.length > 0) {
        return (
            <div id = {DOMId + 'container'} className = 'h-min w-full flex flex-row items-baseline gap-micro'>
                {sentence}
            </div>
        )
    }
}, (b, a) => _.isEqual(b.change, a.change))

export default Dev