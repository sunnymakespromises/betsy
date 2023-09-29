import React, { memo, useMemo, useState  } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ArrowClockwise, Dash, Plus, X } from 'react-bootstrap-icons'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useUserContext } from '../contexts/user'
import { useSearch } from '../hooks/useSearch'
import Page from '../components/page'
import Map from '../components/map'
import SearchBar from '../components/searchBar'
import Text from '../components/text'
import toDate from '../lib/util/toDate'
import Panel from '../components/panel'

const Database = memo(function Database() {
    const { currentUser } = useUserContext()
    const { data } = useDataContext()
    const isDev = useMemo(() => currentUser && currentUser.is_dev, [currentUser])

    if (isDev) {
        let DOMId = 'database'
        return (
            <Page canScroll DOMId = {DOMId}>
                <Helmet><title>Developer • Betsy</title></Helmet>
                <div id = {DOMId} className = 'w-full h-full flex flex-col md:flex-row gap-base md:gap-lg'>
                    <Stats data = {data} parentId = {DOMId}/>
                    <Logs logs = {data.logs} parentId = {DOMId}/>
                </div>
            </Page>
        )
    }
})

const Stats = memo(function Stats({ data, parentId }) {
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
            title: 'Requests / Day',
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
        <div id = {DOMId} className = 'w-full md:w-min h-min flex flex-wrap md:flex-col md:flex-nowrap gap-sm md:gap-base rounded-base'>
            <Map items = {stats} callback = {(stat, index) => {
                let statId = DOMId + '-stat' + index; return (
                <Stat key = {index} title = {stat.title} value = {stat.value()} parentId = {statId}/>
            )}}/>
        </div>
    )

}, (b, a) => _.isEqual(b.data, a.data))

const Stat = memo(function Stat({ title, value, parentId }) {
    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'transition-colors duration-main w-min md:w-full flex flex-col items-center gap-sm p-base bg-base-highlight rounded-base'>
            <Text id = {DOMId + '-title'} preset = 'body' classes = 'text-text-highlight whitespace-nowrap'>
                {title}
            </Text>
            <Text id = {DOMId + '-amount'} preset = 'body' classes = 'text-text-highlight !font-bold !text-3xl !text-primary-main'>
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
                icon: (props) => <Dash {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Removed')),
                turnsOff: ['addition', 'change', 'voided']
            },
            addition: {
                title: 'Added',
                icon: (props) => <Plus {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Added')),
                turnsOff: ['removal', 'change', 'voided']
            },
            change: {
                title: 'Changed',
                icon: (props) => <ArrowClockwise {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Changed')),
                turnsOff: ['addition', 'removal', 'voided']
            },
            voided: {
                title: 'Voided',
                icon: (props) => <X {...props}/>,
                fn: (a, category) => a.filter(r => r.messages.includes('Voided')),
                turnsOff: ['addition', 'removal', 'change']
            },
        },
        categories: Object.keys(changes),
        keys: Object.fromEntries(Object.entries(changes).map(([k,]) => [k, ['messages', 'objects.name']])),
        space: changes,
        showAllOnInitial: true
    }}, [logs])
    const search = useSearch(searchConfig)

    let DOMId = parentId + '-logs'
    return (
        <Panel parentId = {DOMId}>
            <SearchBar {...search} parentId = {DOMId}/>
            <div id = {DOMId + '-items'} className = 'flex flex-col gap-base'>
                <Map items = {search.results && Object.keys(search.results).filter(log => search.results[log].length > 0)} callback = {(log, index) => {
                    let logId = DOMId + '-log' + index; return (
                    <Log key = {index} changes = {search.results[log]} title = {log} parentId = {logId}/>
                )}}/>
            </div>
        </Panel>
    )
}, (b, a) => _.isEqual(b.logs, a.logs))

const Log = memo(function Log({ changes, title, parentId }) {
    let [isExpanded, setisExpanded] = useState(false)
    let DOMId = parentId
    return (
        <div id = {DOMId} className = {'transition-colors duration-main w-full flex flex-col rounded-base ' + (isExpanded ? 'bg-primary-main' : 'bg-base-main/muted hover:bg-primary-main')}>
            <div id = {DOMId + '-bar'} className = {'group/bar w-full cursor-pointer p-base'} onClick = {() => onClick()}>
                <Text id = {DOMId + '-bar-title'} preset = 'body' classes = {'transition-all ' + (isExpanded ? 'text-text-primary' : 'text-text-main/killed group-hover/bar:text-text-primary')}>
                    {title}
                </Text>
            </div>
            <div id = {DOMId + '-changes'} className = {'w-full flex flex-col gap-sm overflow-hidden px-base ' + (isExpanded ? 'h-min pb-base' : 'h-0 pb-0')}>
                <Map items = {changes} callback = {(change, index) => {
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
                let message = change.messages[i]
                newSentence.push(
                    <Text key = {'message' + i} preset = 'body' classes = 'text-text-primary/muted'>
                        {i !== 0 ? '\xA0' : ''}{message}{i === 0 || i < change.objects.length ? '\xA0' : ''} {/* \xA0 is &nbsp; */}
                    </Text>
                )
                if (change.objects[i] && change.categories[i]) {
                    newSentence.push(
                        <Link key = {'object' + i} to = {'/info?category=' + change.categories[i] + '&id=' + change.objects[i].id}>
                            <Text preset = 'body' classes = 'text-text-primary'>
                                {change.objects[i].name}
                            </Text>
                        </Link>
                    )
                }
            }
        }
        return newSentence
    }, [change])
    let DOMId = parentId
    if (sentence.length > 0) {
        return (
            <div id = {DOMId} className = 'w-full flex flex-wrap items-center'>
                {sentence}
            </div>
        )
    }
}, (b, a) => _.isEqual(b.change, a.change))

export default Database