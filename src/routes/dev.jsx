import React, { memo, useMemo, useRef, useState  } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import _ from 'lodash'
import { AddRounded, BackupRounded, CancelRounded, ClearRounded, DeleteRounded, EmojiEventsRounded, ExpandMoreRounded, FolderRounded, GroupRounded, RemoveRounded, SyncRounded } from '@mui/icons-material'
import { useDataContext } from '../contexts/data'
import { useUserContext } from '../contexts/user'
import Page from '../components/page'
import SearchWithResults from '../components/searchWithResults'
import { useDev } from '../hooks/useDev'
import { useLoading } from '../hooks/useLoading'
import Map from '../components/map'
import Conditional from '../components/conditional'
import Text from '../components/text'
import {default as ImageComponent} from '../components/image'
import toDate from '../lib/util/toDate'
import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/searchBar'
import JSZip from 'jszip'
import { useStore } from '../hooks/useStore'

const Dev = memo(function Dev() {
    const { currentUser } = useUserContext()
    const { data } = useDataContext()
    const isDev = useMemo(() => currentUser && currentUser.is_dev, [currentUser])

    if (isDev) {
        let DOMId = 'dev'
        return (
            <Page DOMId = {DOMId}>
                <div id = {DOMId} className = 'w-full h-full flex flex-col md:flex-row gap-main'>
                    <Helmet><title>Developer | Betsy</title></Helmet>
                    <Data data = {data} parentId = {DOMId}/>
                    <Upload data = {data} parentId = {DOMId}/>
                </div>
            </Page>
        )
    }
})

const Upload = memo(function Upload({ data, parentId }) {
    const MAX_STORE_SIZE = 44
    const [ store, addToStore, removeFromStore, emptyStore ] = useStore('dev_selections', 'array', null, { duplicates: false })
    const storeRef = useRef()
    storeRef.current = store
    let items = useMemo(() => store.map(item => {
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
    const searchConfig = useMemo(() => { return {
        id: 'dev',
        filters: {
            competitors: {
                title: 'Competitors',
                icon: (props) => <GroupRounded {...props}/>,
                fn: (a) => a.filter(r => r.category === 'competitors'),
                turnsOff: ['competitions']
            },
            competitions: {
                title: 'Competitions',
                icon: (props) => <EmojiEventsRounded {...props}/>,
                fn: (a) => a.filter(r => r.category === 'competitions'),
                turnsOff: ['competitors']
            }
        },
        space: data && { competitions: data.competitions, competitors: data.competitors },
        shape: 'array',
        categories: ['competitions', 'competitors'],
        keys: { competitions: [{name: 'name', weight: 2}, 'competitions.name', 'sport.name'], competitors: [{name: 'name', weight: 2}, 'competitions.name', 'sport.name'] }
    }}, [data])

    const Item = memo(function Item({ item, parentId }) {
        let DOMId = parentId
        return (
            <div id = {DOMId} className = 'group/item relative transition-all duration-main w-full aspect-square flex flex-col justify-center items-center gap-small bg-base-main rounded-main border-thin border-divider-main cursor-pointer hover:scale-[1.04]' onClick = {() => onClickFile(item)}>
                <CancelRounded id = {DOMId + '-close-icon'} className = 'absolute top-0 right-0 mt-small mr-small !transition-colors duration-main !h-4 !w-4 text-primary-main hover:text-primary-highlight bg-base-main rounded-full cursor-pointer' onClick = {(e) => onRemove(e, item)}/>
                <div id = {DOMId + '-image'} className = 'w-[50%] aspect-square flex justify-center items-center'>
                    <Conditional value = {item.picture}>
                        <ImageComponent id = {DOMId + '-image'} external path = {item.picture} classes = 'w-full h-full'/>
                    </Conditional>
                    <Conditional value = {!item.picture}>
                        <Text id = {DOMId + '-text'} preset = 'dev-upload-item-title'>
                            {item.name}
                        </Text>
                    </Conditional>
                </div>
            </div>
        )
    }, (b, a) => _.isEqual(b.item, a.item))

    let DOMId = parentId + '-upload'
    return (
        <div id = {DOMId} className = 'w-full h-full flex flex-col overflow-auto no-scrollbar rounded-main border-thin border-divider-main shadow-sm md:shadow'>
            <input id = {DOMId + '-file-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFile(e)} ref = {fileInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <input id = {DOMId + '-folder-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFolder(e)} ref = {folderInput} accept = '.zip'/>
            <div id = {DOMId + '-bar'} className = 'sticky top-0 w-full flex flex-row items-center gap-main p-main backdrop-blur-main border-b-thin border-divider-main z-10'>
                <div id = {DOMId + '-bar-not-search-LOL'} className = 'flex flex-row gap-small items-baseline'>
                    <Text id = {DOMId + '-title'} preset = 'main-title'>
                        Upload
                    </Text>
                    <Text id = {DOMId + '-count'} preset = 'dev-upload-count'>
                        {items.length + '/' + MAX_STORE_SIZE}
                    </Text>
                </div>
                <div id = {DOMId + '-actions'} className = 'w-full flex flex-row justify-end items-center gap-small'>
                    <Conditional value = {isLoading}>
                        <BackupRounded id = {DOMId + '-sync-icon'} className = '!h-full !aspect-square text-text-main/muted animate-twPulse animate-repeat-[infinite]'/>
                    </Conditional>
                    <FolderRounded id = {DOMId + '-folder-icon'} className = '!transition-colors duration-main !h-full !aspect-square text-text-main/muted hover:text-primary-main cursor-pointer' onClick = {() => onClickFolder()}/>
                    <DeleteRounded id = {DOMId + '-delete-icon'} className = '!transition-colors duration-main !h-full !aspect-square text-text-main/muted hover:text-primary-main cursor-pointer' onClick = {() => onRemoveAll()}/>
                    <SearchWithResults searchConfig = {searchConfig} onResultClick = {onResultClick} inputPreset = 'dev' classes = 'w-1/2' closeOnClick = {false} showFavorites = {false} autoFocus = {false} container = {DOMId} parentId = {DOMId}/>
                </div>
            </div>
            <div id = {DOMId + '-items'} className = 'grid grid-cols-6 gap-main p-main'>
                <Map array = {items} callback={(item, index) => { 
                    let itemId = DOMId + '-item' + index; return (
                    <Item key = {index} item = {item} parentId = {itemId}/>
                )}}/>
            </div>
        </div>
    )

    async function onClickFile(item) {
        if (item) {
            setTargetItem(item)
            fileInput.current.click()
        }
    }

    async function onClickFolder() {
        if (items?.length > 0) {
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
                        let item = items.find(item => item.category === 'competitions' ? normalize(item.key) === normalize(name) : item.category === 'competitors' ? normalize(item.name) === normalize(name) : false)
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

    function onRemoveAll() {
        emptyStore()
    }

    function onRemove(e, item) {
        e.stopPropagation()
        e.nativeEvent.stopPropagation()
        item = { id: item.id, category: item.category }
        removeFromStore(item)
    }

    function onResultClick(category, result) {
        let count = storeRef.current.length
        result = {id: result.id, category: category}
        if (category === 'competitions') {
            let competitors = data.competitions.find(c => c.id === result.id)?.competitors?.map(competitor => {return {id: competitor.id, category: 'competitors'}})
            if (competitors.length > 0) {
                if (count + [result, ...competitors].length <= MAX_STORE_SIZE) {
                    addToStore([result, ...competitors]) 
                }
            }
            else {
                if (count + 1 <= MAX_STORE_SIZE) {
                    addToStore(result) 
                }
            }
        }
        else {
            if (count + 1 <= MAX_STORE_SIZE) {
                addToStore(result)
            }
        }
    }
}, (b, a) => _.isEqual(b.data, a.data))

const Data = memo(function Data({ data, parentId }) {
    console.log('data', data)
    let DOMId = parentId + '-data'
    return (
        <div id = {DOMId} className = 'w-full md:h-full flex flex-col md:flex-row gap-main'>
            <Stats data = {data} parentId = {DOMId}/>
            <Logs logs = {data.logs} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => _.isEqual(b.data, a.data))

const Stats = memo(function Stats({ data, parentId }) {
    console.log('stats', data)
    const stats = [
        {
            title: 'Requests Left',
            value: () => {
                if (data.logs) {
                    let logsWithRequests = (data.logs.sort((a, b) => a.timestamp < b.timestamp).filter(log => log.totals.requests_remaining))
                    if (logsWithRequests?.length > 0) {
                        return logsWithRequests[0]?.totals.requests_remaining
                    }
                    return 0
                }
                return null
            }
        },
        {
            title: 'Requests/Day',
            value: () => {
                if (data.logs) {
                    let logsWithRequests = (data.logs.sort((a, b) => a.timestamp < b.timestamp).filter(log => log.totals.requests_remaining))
                    if (logsWithRequests?.length > 0) {
                        return ((logsWithRequests[logsWithRequests.length - 1].totals.requests_remaining - logsWithRequests[0].totals.requests_remaining) / 7).toFixed(2)
                    }
                    return 0
                }
                return null
            }
        },
        {
            title: 'Total Users',
            value: () => {
                return data.users ? data.users?.length : 0
            }
        },
    ]
    let DOMId = parentId + '-stats' 
    return (
        <div id = {DOMId} className = 'w-full md:w-min h-min flex flex-row flex-wrap md:flex-col gap-smaller md:gap-small rounded-main p-main border-thin border-divider-main shadow-sm md:shadow'>
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

}, (b, a) => _.isEqual(b.data, a.data))

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
        if (logs) {
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
        }
        return {}
    }, [logs])
    const searchConfig = useMemo(() => { return {
        id: 'dev_logs',
        filters: {
            removal: {
                title: 'Removed',
                icon: (props) => <RemoveRounded {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Removed')),
                turnsOff: ['addition', 'change', 'voided']
            },
            addition: {
                title: 'Added',
                icon: (props) => <AddRounded {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Added')),
                turnsOff: ['removal', 'change', 'voided']
            },
            change: {
                title: 'Changed',
                icon: (props) => <SyncRounded {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Changed')),
                turnsOff: ['addition', 'removal', 'voided']
            },
            voided: {
                title: 'Voided',
                icon: (props) => <ClearRounded {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Voided')),
                turnsOff: ['addition', 'removal', 'change']
            },
        },
        categories: Object.keys(changes),
        keys: Object.fromEntries(Object.entries(changes).map(([k,]) => [k, ['messages', 'objects.name']])),
        space: changes,
        showAllOnInitial: true
    }}, [logs])
    const { input, results, filters, hasActiveFilter, setFilter, onInputChange } = useSearch(searchConfig)

    let DOMId = parentId + '-logs'
    return (
        <div id = {DOMId} className = 'relative w-full h-full flex flex-col overflow-auto no-scrollbar rounded-main border-thin border-divider-main shadow-sm md:shadow'>
            <div id = {DOMId + '-bar'} className = 'sticky top-0 w-full flex flex-row justify-between items-center backdrop-blur-main p-main border-b-thin border-divider-main z-10'>
                <Text id = {DOMId + '-title'} preset = 'main-title'>
                    Logs
                </Text>
                <SearchBar inputPreset = 'dev' classes = 'w-1/2' input = {input} onInputChange = {onInputChange} canExpand = {false} filters = {filters} hasActiveFilter = {hasActiveFilter} setFilter = {setFilter} autoFocus = {false} parentId = {DOMId}/>
            </div>
            <div id = {DOMId + '-items'} className = 'flex flex-col gap-tiny p-main'>
                <Map array = {results && Object.keys(results).filter(log => results[log].length > 0)} callback = {(log, index) => {
                    let logId = DOMId + '-log' + index; return (
                    <React.Fragment key = {index}>
                        <Log key = {index} changes = {results[log]} title = {log} parentId = {logId}/>
                        <Conditional value = {index !== Object.keys(results).filter(log => results[log].length > 0).length - 1}>
                            <div className = 'border-t-thin border-divider-main'/>
                        </Conditional>
                    </React.Fragment>
                )}}/>
            </div>
        </div>
    )
}, (b, a) => _.isEqual(b.logs, a.logs))

const Log = memo(function Log({ changes, title, parentId }) {
    let [isExpanded, setisExpanded] = useState(false)
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'w-full h-min flex flex-col'}>
            <div id = {DOMId + '-bar'} className = {'group/bar w-full flex flex-row items-center gap-micro cursor-pointer'} onClick = {() => onClick()}>
                <Text id = {DOMId + '-title'} preset = 'dev-logs-title'>
                    {title}
                </Text>
                <ExpandMoreRounded id = {DOMId + '-expand-icon'} className = {'!transition-colors duration-main !h-full aspect-square text-primary-main group-hover/bar:text-primary-highlight ' + (isExpanded ? 'rotate-180' : '')}/>
            </div>
            <div id = {DOMId + '-changes'} className = {'w-full h-min flex-col overflow-hidden gap-y-micro py-small ' + (isExpanded ? 'flex' : 'hidden')}>
                <Map array = {changes} callback = {(change, index) => {
                    let changeId = parentId + '-change' + index; return (
                    <Change key = {index} index = {index} change = {change} parentId = {changeId}/>
                )}}/>
            </div>
        </div>
    )

    function onClick() {
        setisExpanded(!isExpanded)
    }
}, (b, a) => b.title === a.title && _.isEqual(b.changes, a.changes))

const Change = memo(function Change({ index, change, parentId }) {
    const symbols = {
        Added: (props) => <AddRounded {...props}/>,
        Removed: (props) => <RemoveRounded {...props}/>,
        Changed: (props) => <SyncRounded {...props}/>,
        Voided: (props) => <ClearRounded {...props}/>
    }
    let sentence = useMemo(() => {
        let newSentence = []
        if (change) {
            for (let i = 0; i < change.messages.length; i++) {
                let message = change.messages[i]
                if (symbols[change.messages[i]]) {
                    let Symbol = symbols[message]
                    newSentence.push(<Symbol key = {'message' + i} className = '!h-4 !w-4 text-text-main/killed'/>)
                }
                else{
                    newSentence.push(<Text key = {'message' + i} preset = 'dev-logs-change-message'>{message}</Text>)
                }
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
            <div id = {DOMId} className = {'h-min w-full flex flex-row flex-wrap items-center gap-x-tiny py-tiny' + ((index%2 === 0) ? ' bg-base-highlight' : '')}>
                {sentence}
            </div>
        )
    }
}, (b, a) => b.index === a.index && _.isEqual(b.change, a.change))

export default Dev