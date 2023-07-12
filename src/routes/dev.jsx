import React, { memo, useMemo, useRef, useState  } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { AddRounded, BackupRounded, CloseRounded, DeleteRounded, ExpandMoreRounded, FolderRounded, RemoveRounded } from '@mui/icons-material'
import { useDataContext } from '../contexts/data'
import { useUserContext } from '../contexts/user'
import Page from '../components/page'
import Search from '../components/search'
import { useDev } from '../hooks/useDev'
import { useLoading } from '../hooks/useLoading'
import Map from '../components/map'
import Conditional from '../components/conditional'
import Text from '../components/text'
import List from '../components/list'
import {default as ImageComponent} from '../components/image'
import toDate from '../lib/util/toDate'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/searchBar'
import JSZip from 'jszip'
import { useStore } from '../hooks/useStore'

const Dev = memo(function Dev() {
    const { store, addToStore, removeFromStore, emptyStore } = useStore('dev_selections', 'array', null, { duplicates: false })
    const { currentUser } = useUserContext()
    const { data } = useDataContext()
    const isDev = useMemo(() => currentUser && currentUser.is_dev, [currentUser])

    const searchConfig = useMemo(() => { return {
        id: 'dev',
        space: data ? { competitions: data.competitions, competitors: data.competitors } : null,
        categories: ['competitions', 'competitors'],
        keys: { competitions: ['name', 'competitions.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'] }
    }}, [data])

    if (isDev) {
        let DOMId = 'dev'
        return (
            <Page DOMId = {DOMId}>
                <div id = {DOMId} className = 'relative w-full h-full flex flex-col gap-main'>
                    <Helmet><title>Developer | Betsy</title></Helmet>
                    <Search searchConfig = {searchConfig} onResultClick = {onResultClick} inputPreset = 'dev-images' parentId = {DOMId}/>
                    <div id = {DOMId + '-body'} className = 'w-full h-full md:min-h-0 flex flex-col md:flex-row gap-main z-0'>
                        <Data logs = {data.logs} parentId = {DOMId}/>
                        <Upload data = {data} store = {store} onRemove = {onRemove} onRemoveAll = {onRemoveAll} parentId = {DOMId}/>
                    </div>
                </div>
            </Page>
        )
    }

    function onRemoveAll() {
        emptyStore()
    }

    function onRemove(item) {
        item = { id: item.id, category: item.category }
        removeFromStore(item)
    }

    function onResultClick(category, result) {
        result = {id: result.id, category: category}
        if (category === 'competitions') {
            let competitors = data.competitions.find(c => c.id === result.id)?.competitors?.map(competitor => {return {id: competitor.id, category: 'competitors'}})
            if (competitors.length > 0) {
                addToStore([result, ...competitors]) 
            }
        }
        else {
            addToStore(result)
        }
    }
})

const Upload = memo(function Upload({ data, store, onRemove, onRemoveAll, parentId }) {
    let selected = useMemo(() => store.map(item => {
        return {
            ...data[item.category].find(item2 => item2.id === item.id),
            category: item.category
        }
    }), [store, data])
    let [isLoading, execute] = useLoading()
    let [targetItem, setTargetItem] = useState()
    const { uploadPicture } = useDev()
    const fileInput = useRef(null)
    const folderInput = useRef(null)
    const Item = memo(function Item({ item, parentId }) {
        let DOMId = parentId
        return (
            <div id = {DOMId} className = 'relative h-min flex flex-row items-center gap-small'>
                <CloseRounded id = {DOMId + '-close-icon'} className = '!h-4 !w-4 text-primary-main cursor-pointer' onClick = {() => onRemove(item)}/>
                <div id = {DOMId + '-info'} className = 'flex flex-row items-center gap-tiny'>
                    <Conditional value = {item.picture}>
                        <ImageComponent id = {DOMId + '-image'} external path = {item.picture} classes = 'w-4 h-4'/>
                    </Conditional>
                    <Text id = {DOMId + '-name'} preset = 'dev-images-item' onClick = {() => onClickFile(item)}>
                        {item.name}
                    </Text>
                </div>
            </div>
        )
    }, (b, a) => _.isEqual(b.item, a.item))

    let DOMId = parentId + '-upload'
    return (
        <div id = {DOMId} className = 'w-full h-full flex flex-col overflow-hidden rounded-main border-thin border-divider-main md:shadow'>
            <input id = {DOMId + '-file-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFile(e)} ref = {fileInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <input id = {DOMId + '-folder-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFolder(e)} ref = {folderInput} accept = '.zip'/>
            <div id = {DOMId + '-bar'} className = 'w-full flex flex-row justify-between items-center p-main z-10'>
                <Text id = {DOMId + '-title'} preset = 'dev-title'>
                    Upload
                </Text>
                <div id = {DOMId + '-actions'} className = 'flex flex-row gap-small'>
                    <Conditional value = {isLoading}>
                        <BackupRounded id = {DOMId + '-sync-icon'} className = '!h-full !aspect-square text-text-main animate-twPulse animate-repeat-[infinite]'/>
                    </Conditional>
                    <FolderRounded id = {DOMId + '-folder-icon'} className = '!h-full !aspect-square text-primary-main cursor-pointer' onClick = {() => onClickFolder()}/>
                    <DeleteRounded id = {DOMId + '-delete-icon'} className = '!h-full !aspect-square text-primary-main cursor-pointer' onClick = {() => onRemoveAll()}/>
                </div>
            </div>
            <div className = 'border-t-thin border-divider-main'/>
            <List items = {selected} element = {Item} classes = 'p-main gap-small' parentId = {DOMId}/>
        </div>
    )

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
            await execute(async () => {
                await JSZip.loadAsync(e.target.files[0]).then(async (zip) => {
                    let files = Object.keys(zip.files).filter(filename => (zip.files[filename].dir) === false)
                    files = files.map(filename => {
                        let name = zip.files[filename].name.split('/').pop().replace('.png', '')
                        let item = selected.find(item => item.category === 'competitions' ? normalize(item.key) === normalize(name) : item.category === 'competitors' ? normalize(item.name) === normalize(name) : false)
                        return {
                            filename: filename,
                            item: item
                        }
                        function normalize(string) {
                            return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                        }
                    })
                    let objects = [] 
                    let values = []
                    for (const file of files) {
                        if (file.item) {
                            objects.push(file.item)
                            values.push(URL.createObjectURL(await zip.files[file.filename].async('blob')))
                        }
                    }
                    await uploadPicture(objects, values, false)
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
                await uploadPicture(targetItem, value, true)
            }
        }
    }
}, (b, a) => _.isEqual(b.store, a.store) && _.isEqual(b.data, a.data))

const Data = memo(function Data({ logs, parentId }) {
    let DOMId = parentId + '-data'
    return (
        <div id = {DOMId} className = 'w-full md:h-full flex flex-col md:flex-row gap-main'>
            <Stats logs = {logs} parentId = {DOMId}/>
            <Logs logs = {logs} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => _.isEqual(b.data, a.data))

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
    let DOMId = parentId + '-stats' 
    return (
        <div id = {DOMId} className = 'w-full md:w-min h-min flex flex-row flex-wrap md:flex-col gap-smaller md:gap-small rounded-main p-main border-thin border-divider-main md:shadow'>
            <Map array = {stats} callback = {(stat, index) => {
                let statId = DOMId + '-stat' + index; return (
                <React.Fragment key = {index}>
                    <Stat title = {stat.title} value = {stat.value()} parentId = {statId}/>
                    <Conditional value = {index !== stats.length - 1}>
                        <div className = 'border-t-thin border-l-thin border-divider-main'/>
                    </Conditional>
                </React.Fragment>
            )}}/>
        </div>
    )

}, (b, a) => _.isEqual(b.logs, a.logs))

const Stat = memo(function Stat({ title, value, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'w-min flex flex-col'>
            <Text id = {DOMId + '-title'} preset = 'dev-stat-title'>
                {title}
            </Text>
            <Text id = {DOMId + '-amount'} preset = 'dev-stat-value'>
                {value}
            </Text>
        </div>
    )
})

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

    let DOMId = parentId + '-logs'
    if (results) {
        return (
            <div id = {DOMId} className = 'relative w-full h-full flex flex-col rounded-main border-thin border-divider-main md:shadow'>
                <div id = {DOMId + '-bar'} className = 'md:sticky md:top-0 w-full flex flex-row justify-between items-center p-main z-10'>
                    <Text id = {DOMId + '-title'} preset = 'dev-title'>
                        Logs
                    </Text>
                    <SearchBar inputPreset = 'dev-logs' input = {input} onInputChange = {onInputChange} canExpand = {false} filters = {filters} setFilter = {setFilter} autoFocus = {false} parentId = {DOMId}/>
                </div>
                <div className = 'border-t-thin border-divider-main'/>
                <div id = {DOMId + '-items'} className = 'w-full h-full flex flex-col p-main overflow-hidden md:overflow-y-auto md:no-scrollbar'>
                    <Map array = {results && Object.keys(results)} callback = {(log, index) => {
                        let logId = DOMId + '-log' + index; 
                        if (results[log]?.length > 0) {return (
                        <Log key = {index} changes = {results[log]} title = {log} parentId = {logId}/>
                    )}}}/>
                </div>
            </div>
        )
    }
}, (b, a) => _.isEqual(b.logs, a.logs))

const Log = memo(function Log({ changes, title, parentId }) {
    let [isExpanded, setisExpanded] = useState(false)
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'w-full h-min flex flex-col'}>
            <div id = {DOMId + '-bar'} className = {'w-full flex flex-row items-center gap-micro cursor-pointer'} onClick = {() => onClick()}>
                <Text id = {DOMId + '-title'} preset = 'dev-logs-title'>
                    {title}
                </Text>
                <ExpandMoreRounded id = {DOMId + '-expand-icon'} className = {'!transition-all duration-main !h-full aspect-square text-primary-main ' + (isExpanded ? 'rotate-180' : '')}/>
            </div>
            <div id = {DOMId + '-changes'} className = {'w-full h-min flex-col overflow-hidden gap-y-micro ' + (isExpanded ? 'flex' : 'hidden')}>
                <Map array = {changes} callback = {(change, index) => {
                    let changeId = parentId + '-change' + index; return (
                    <Change key = {index} change = {change} parentId = {changeId}/>
                )}}/>
            </div>
        </div>
    )

    function onClick() {
        setisExpanded(!isExpanded)
    }
}, (b, a) => b.title === a.title && _.isEqual(b.changes, a.changes))

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
    let DOMId = parentId
    if (sentence.length > 0) {
        return (
            <div id = {DOMId} className = 'h-min w-full flex flex-row flex-wrap items-baseline gap-x-tiny'>
                {sentence}
            </div>
        )
    }
}, (b, a) => _.isEqual(b.change, a.change))

export default Dev