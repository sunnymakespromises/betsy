import React, { memo, useMemo, useRef, useState  } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { AddRounded, CloseRounded, DeleteRounded, ExpandMoreRounded, FolderRounded, RemoveRounded } from '@mui/icons-material'
import { useDataContext } from '../contexts/data'
import { useUserContext } from '../contexts/user'
import Page from '../components/page'
import Search from '../components/search'
import { useDev } from '../hooks/useDev'
import Map from '../components/map'
import Conditional from '../components/conditional'
import Text from '../components/text'
import List from '../components/list'
import {default as ImageComponent} from '../components/image'
import toDate from '../lib/util/toDate'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/searchBar'
import JSZip from 'jszip'

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
                newSelected.push({...data[category].find(c => c.id === id), category: category})
            }
        }
        return newSelected
    }, [searchParams, data])
    const searchConfig = useMemo(() => { return {
        id: 'dev',
        space: data ? { competitions: data.competitions, competitors: data.competitors } : null,
        categories: ['competitions', 'competitors'],
        keys: { competitions: ['name', 'competitions.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'] }
    }}, [data])

    if (isDev) {
        let DOMId = 'dev-'
        return (
            <Page>
                <div id = {DOMId + 'page'} className = 'relative w-full h-full flex flex-col gap-main'>
                    <Helmet><title>Developer | Betsy</title></Helmet>
                    <Search searchConfig = {searchConfig} onResultClick = {onResultClick} inputPreset = 'dev-images' parentId = {DOMId}/>
                    <div id = {DOMId + 'container'} className = 'w-full h-full md:min-h-0 flex flex-col md:flex-row gap-main z-0'>
                        <div id = {DOMId + 'logs-container'} className = 'w-full md:h-full flex flex-col md:flex-row gap-main'>
                            <Stats logs = {data.logs} parentId = {DOMId + 'logs-'}/>
                            <Logs logs = {data.logs} parentId = {DOMId + 'logs-'}/>
                        </div>
                        <div id = {DOMId + 'group-1-container'} className = 'relative w-full h-full flex flex-col gap-smaller'>
                            <Selected selected = {selected} searchParams = {searchParamsRef.current} setSearchParams = {setSearchParams} parentId = {DOMId}/>
                        </div>
                    </div>
                </div>
            </Page>
        )
    }

    function onResultClick(category, result) {
        let newSelected = searchParamsRef.current?.get('selected')?.length > 0 ? searchParamsRef.current.get('selected').includes(category + '+' + result.id) ? searchParamsRef.current.get('selected') : searchParamsRef.current.get('selected') + ',' + category + '+' + result.id : category + '+' + result.id
        if (category === 'competitions') {
            for (const competitor of data.competitions.find(c => c.id === result.id)?.competitors) {
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
    let [targetItem, setTargetItem] = useState()
    const { uploadPicture } = useDev()
    const fileInput = useRef(null)
    const folderInput = useRef(null)
    const Item = memo(function Item({ item, parentId }) {
        return (
            <div id = {parentId + 'container'} className = 'relative h-min flex flex-row items-center gap-small'>
                <CloseRounded className = '!h-4 !w-4 text-primary-main cursor-pointer' onClick = {() => onRemove(item)}/>
                <div id = {parentId + 'name-container'} className = 'flex flex-row items-center gap-tiny'>
                    <Conditional value = {item.picture}>
                        <ImageComponent id = {parentId + 'image'} external path = {item.picture} classes = 'w-4 h-4'/>
                    </Conditional>
                    <Text id = {parentId + 'name'} preset = 'dev-images-item' onClick = {() => onClickFile(item)}>
                        {item.name}
                    </Text>
                </div>
            </div>
        )
    }, (b, a) => _.isEqual(b.item, a.item))

    let DOMId = parentId + 'selected-'
    return (
        <div id = {DOMId + 'container'} className = 'w-full h-full flex flex-col overflow-hidden rounded-main border-thin border-divider-main md:shadow'>
            <input id = {DOMId + 'file-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFile(e)} ref = {fileInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <input id = {DOMId + 'folder-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFolder(e)} ref = {folderInput} accept = '.zip'/>
            <div id = {DOMId + 'title-container'} className = 'w-full flex flex-row justify-between items-center p-main z-10'>
                <Text id = {DOMId + 'title'} preset = 'dev-title'>
                    Upload
                </Text>
                <div id = {DOMId + 'actions-container'} className = 'flex flex-row gap-small'>
                    <FolderRounded className = '!h-full !aspect-square text-primary-main cursor-pointer' onClick = {() => onClickFolder()}/>
                    <DeleteRounded className = '!h-full !aspect-square text-primary-main cursor-pointer' onClick = {() => removeAll()}/>
                </div>
            </div>
            <div className = 'divider border-t-thin border-divider-main'/>
            <List items = {selected} element = {Item} classes = 'p-main gap-small' parentId = {DOMId}/>
        </div>
    )

    function removeAll() {
        let newSearchParams = {...Object.fromEntries([...searchParams].filter(p => p[0] !== 'selected'))}
        setSearchParams(newSearchParams, { replace: true })
    }

    function onRemove(item) {
        let newSelected = searchParams.get('selected')?.split(',')?.filter(p => p.split('+')[1] !== item.id)?.join(',')
        let newSearchParams = {...Object.fromEntries(newSelected ? [...searchParams, ['selected', newSelected]] : [...searchParams].filter(p => p[0] !== 'selected'))}
        setSearchParams(newSearchParams, { replace: true })
    }

    async function onClickFile(item) {
        if (item) {
            setTargetItem(item)
            fileInput.current.click()
        }
    }

    async function onClickFolder() {
        if (selected?.length > 0) {
            folderInput.current.click()
        }
    }

    async function onUploadFolder(e) {
        if (e.target.files[0]) {
            await JSZip.loadAsync(e.target.files[0]).then((zip) => {
                let files = Object.keys(zip.files).filter(filename => (zip.files[filename].dir) === false)
                files = files.map(filename => {
                    let name = zip.files[filename].name.split('/').pop().replace('.png', '')
                    let item = selected.find(item => item.category === 'competitions' ? item.key === name : item.category === 'competitors' ? item.name === name : false)
                    return {
                        filename: filename,
                        item: item
                    }
                })
                files.forEach(async file => {
                    if (file.item) {
                        let value = URL.createObjectURL(await zip.files[file.filename].async('blob'))
                        await uploadPicture(file.item, value)
                    }
                })
            })
        }
    }

    async function onUploadFile(e) {
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
            canvas.width = 400
            canvas.height = 400
            let x, y, width, height
            const aspectRatio = image.width / image.height // >1 = landscape, <1 = portrait
            x = aspectRatio >= 1 ? (image.width - image.height) / 2 : 0
            y = aspectRatio >= 1 ? 0 : (image.height - image.width) / 2
            width = aspectRatio >= 1 ? image.height : image.width
            height = aspectRatio >= 1 ? image.height : image.width
            ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height)
            let value = URL.createObjectURL(await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob)
                }, 'image/png')
            }))
            if (targetItem && value) {
                await uploadPicture(targetItem, value)
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
        <div id = {DOMId + 'container'} className = 'w-full md:w-min h-min flex flex-row flex-wrap md:flex-col gap-smaller md:gap-small rounded-main p-main border-thin border-divider-main md:shadow'>
            <Map array = {stats} callback = {(stat, index) => {
                let statId = DOMId + 'stat-' + index + '-'; return (
                <React.Fragment key = {index}>
                    <Stat title = {stat.title} value = {stat.value()} parentId = {statId}/>
                    <Conditional value = {index !== stats.length - 1}>
                        <div className = 'divider border-t-thin border-l-thin border-divider-main'/>
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
    const changes = useMemo(() => {
        let newChanges = []
        for (const log of logs) {
            let changes = log.totals.changes
            if (changes) {
                for (const change of changes) {
                    newChanges.push({ id: log.id, title: toDate(log.timestamp), messages: change.messages, objects: change.objects, categories: change.categories})
                }
            }
        }
        return _.groupBy(newChanges, 'title')
    }, [logs])
    const searchConfig = useMemo(() => { return {
        id: 'dev_logs',
        filters: {
            removal: {
                title: 'Removal',
                icon: (props) => <RemoveRounded {...props}/>,
                fn: (a) => a.filter(r => r.messages.includes('Removed')),
                turnsOff: ['addition']
            },
            addition: {
                title: 'Addition',
                icon: (props) => <AddRounded {...props}/>,
                fn: (a) => a.filter(r => r.messages.includes('Added')),
                turnsOff: ['removal']
            }
        },
        categories: Object.keys(changes),
        keys: Object.fromEntries(Object.entries(changes).map(([k,]) => [k, ['messages', 'objects.name']])),
        space: changes,
        showAllOnInitial: true
    }}, [logs])
    const { input, results, filters, setFilter, onInputChange } = useSearch(searchConfig)

    let DOMId = parentId + 'changes-'
    if (results) {
        return (
            <div id = {DOMId + 'container'} className = 'relative w-full h-full flex flex-col rounded-main border-thin border-divider-main md:shadow'>
                <div id = {DOMId + 'title-container'} className = 'md:sticky md:top-0 w-full flex flex-row justify-between items-center p-main z-10'>
                    <Text id = {DOMId + 'title'} preset = 'dev-title'>
                        Logs
                    </Text>
                    <SearchBar inputPreset = 'dev-logs' input = {input} onInputChange = {onInputChange} canExpand = {false} filters = {filters} setFilter = {setFilter} autoFocus = {false} parentId = {DOMId}/>
                </div>
                <div className = 'divider border-t-thin border-divider-main'/>
                <div id = {DOMId + 'logs'} className = 'w-full h-full flex flex-col p-main overflow-hidden md:overflow-y-auto md:no-scrollbar'>
                    <Map array = {results && Object.keys(results)} callback = {(log, index) => {
                        let logId = DOMId + 'log-' + index + '-'; return (
                        <Conditional key = {index} value = {results[log] && results[log].length > 0}>
                            <Log changes = {results[log]} title = {log} parentId = {logId}/>
                        </Conditional>
                    )}}/>
                </div>
            </div>
        )
    }
}, (b, a) => _.isEqual(b.logs, a.logs))

const Log = memo(function Log({ changes, title, parentId }) {
    let [isExpanded, setisExpanded] = useState(false)
    return (
        <div id = {parentId + 'container'} className = {'w-full h-min flex flex-col'}>
            <div id = {parentId + 'title-container'} className = {'w-full flex flex-row items-center gap-micro cursor-pointer'} onClick = {() => onClick()}>
                <Text id = {parentId + 'title'} preset = 'dev-logs-title'>
                    {title}
                </Text>
                <ExpandMoreRounded className = {'!transition-all duration-main !h-full aspect-square text-primary-main ' + (isExpanded ? 'rotate-180' : '')}/>
            </div>
            <div id = {parentId + 'changes'} className = {'w-full h-min flex-col overflow-hidden gap-y-micro ' + (isExpanded ? 'flex' : 'hidden')}>
                <Map array = {changes} callback = {(change, index) => {
                    let changeId = parentId + 'change-' + index + '-'; return (
                    <Change key = {index} change = {change} parentId = {changeId}/>
                )}}/>
            </div>
        </div>
    )

    function onClick() {
        setisExpanded(!isExpanded)
    }
}, (b, a) => _.isEqual(b.changes, a.changes) && b.title === a.title)

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
    if (sentence.length > 0) {
        return (
            <div id = {DOMId + 'container'} className = 'h-min w-full flex flex-row flex-wrap items-baseline gap-x-tiny'>
                {sentence}
            </div>
        )
    }
}, (b, a) => _.isEqual(b.change, a.change))

export default Dev