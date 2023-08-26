import React, { memo, useEffect, useMemo, useRef, useState  } from 'react'
import { Helmet } from 'react-helmet'
import { ArrowClockwise, CloudArrowUpFill, FileEarmarkZipFill, PeopleFill, TrashFill, TrophyFill, XCircleFill } from 'react-bootstrap-icons'
import Cropper from 'react-easy-crop'
import _ from 'lodash'
import { useDataContext } from '../contexts/data'
import { useUserContext } from '../contexts/user'
import { useStore } from '../hooks/useStore'
import { useDev } from '../hooks/useDev'
import { useLoading } from '../hooks/useLoading'
import { useStatuses } from '../hooks/useStatuses'
import { useInput } from '../hooks/useInput'
import { useCropper } from '../hooks/useCropper'
import Page from '../components/page'
import Map from '../components/map'
import Conditional from '../components/conditional'
import Text from '../components/text'
import Panel from '../components/panel'
import { default as ImageComponent } from '../components/image'
import SearchWithResults from '../components/searchWithResults'
// import Input from '../components/input'
import JSZip from 'jszip'
import cropImage from '../lib/util/cropImage'

const MAX_STORE_SIZE = 44
const PICTURE_SIZE = [400, 400]

const Edit = memo(function Edit() {
    const { currentUser } = useUserContext()
    const { data } = useDataContext()
    const isDev = useMemo(() => currentUser && currentUser.is_dev, [currentUser])

    if (isDev) {
        let DOMId = 'edit'
        return (
            <Page canScroll DOMId = {DOMId}>
                <div id = {DOMId} className = 'w-full min-h-full h-fit flex flex-col md:flex-row gap-base md:gap-large'>
                    <Helmet><title>Developer • Betsy</title></Helmet>
                    <Upload data = {data} parentId = {DOMId}/>
                </div>
            </Page>
        )
    }
})

const Upload = memo(function Upload({ data, parentId }) {
    const { updateItem } = useDev()
    const [ store, addToStore, removeFromStore, , emptyStore ] = useStore('dev_selections', 'array', null, { duplicates: false })
    const storeRef = useRef()
    storeRef.current = store
    let items = useMemo(() => store.map(item => {
        return {
            ...data[item.category].find(item2 => item2.id === item.id),
            category: item.category
        }
    }), [store, data])
    let [isLoading, execute] = useLoading()
    const folderInput = useRef(null)
    const searchConfig = useMemo(() => { return {
        id: 'edit',
        filters: {
            competitors: {
                title: 'Competitors',
                icon: (props) => <PeopleFill {...props}/>,
                fn: (a) => a.filter(r => r.category === 'competitors'),
                turnsOff: ['competitions']
            },
            competitions: {
                title: 'Competitions',
                icon: (props) => <TrophyFill {...props}/>,
                fn: (a) => a.filter(r => r.category === 'competitions'),
                turnsOff: ['competitors']
            }
        },
        space: data && { competitions: data.competitions, competitors: data.competitors },
        shape: 'array',
        categories: ['competitions', 'competitors'],
        keys: { competitions: [{name: 'name', weight: 2}, 'competitions.name', 'sport.name'], competitors: [{name: 'name', weight: 2}, 'competitions.name', 'sport.name'] }
    }}, [data])

    let DOMId = parentId + '-upload'
    return (
        <Panel title = 'Upload' icon = {CloudArrowUpFill} classes = 'min-h-full' parentId = {DOMId}>
            <div id = {DOMId + '-actions'} className = 'flex justify-end items-center gap-sm'>
                <input id = {DOMId + '-folder-input'} style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUploadFolder(e)} ref = {folderInput} accept = '.zip'/>
                <SearchWithResults searchConfig = {searchConfig} classes = 'grow' closeOnClick = {true} onResultClick = {onResultClick} container = {DOMId + '-items'} parentId = {DOMId}/>
                <ArrowClockwise id = {DOMId + '-sync-icon'} className = {'transition-[width] duration-main h-5 text-primary-main animate-twSpin animate-repeat-[infinite] ' + (isLoading ? 'w-5' : 'w-0')}/>
                <FileEarmarkZipFill id = {DOMId + '-folder-icon'} className = 'transition-colors duration-main w-5 h-5 text-primary-main hover:text-primary-highlight cursor-pointer' onClick = {() => onFolderClick()}/>
                <TrashFill id = {DOMId + '-delete-icon'} className = '!transition-colors duration-main w-5 h-5 text-primary-main hover:text-primary-highlight cursor-pointer' onClick = {() => onRemoveAll()}/>
                <Text id = {DOMId + '-count'} preset = 'body' classes = 'text-text-highlight/muted'>
                    {store.length + '/' + MAX_STORE_SIZE}
                </Text>
            </div>
            <div id = {DOMId + '-items'} className = 'relative w-full grow h-min grid grid-cols-5 md:grid-cols-6 lg:grid-cols-12 auto-rows-min gap-base z-0'>
                <Map items = {items} callback={(item, index) => { 
                    let itemId = DOMId + '-item' + index; return (
                    <Item key = {index} item = {item} onItemRemove = {onItemRemove} parentId = {itemId}/>
                )}}/>
            </div>
        </Panel>
    )

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

    async function onFolderClick() {
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
                            values.push(await cropImage(PICTURE_SIZE, URL.createObjectURL(await zip.files[file.filename].async('blob'))))
                        }
                    }
                    await updateItem(objects, 'picture', values, false)
                })
            })
        }
    }

    function onItemRemove(item) {
        item = { id: item.id, category: item.category }
        removeFromStore(item)
    }

    function onRemoveAll() {
        emptyStore()
    }
}, (b, a) => _.isEqual(b.data, a.data))

const Item = memo(function Item({ item, onItemRemove, parentId }) {
    // const itemInfo = [
    //     {
    //         title: 'Name',
    //         icon: (props) => <PersonFill {...props}/>,
    //         key: 'name',
    //     }
    // ]
    const { statuses, setStatuses } = useStatuses(['name', 'picture'])
    const { input, inputIsEmpty, onInputChange, clearAllInput } = useInput(['name', 'picture'])
    const [pictureParams, onCrop] = useCropper(input.picture)

    let DOMId = parentId
    return (
        <div id = {DOMId} className = 'group/item relative transition-all duration-main w-full h-min flex flex-col gap-sm'>
            <Picture item = {item} params = {pictureParams} picture = {item.picture} input = {input.picture} onInputChange = {onInputChange} status = {statuses.picture} parentId = {DOMId}/>
            {/* <div id = {DOMId + '-info'} className = 'flex flex-col gap-xs'>
                <Map items = {itemInfo} callback = {(info, index) => {
                    let infoId = DOMId + '-info' + index; return (
                    <Info key = {index} category = {info.key} value = {item[info.key]} input = {input[info.key]} onInputChange = {onInputChange} status = {statuses[info.key]} isThisInputEmpty = {isThisInputEmpty} parentId = {infoId}/>
                )}}/>
            </div> */}
            <XCircleFill id = {DOMId + '-close-icon'} className = 'transition-colors duration-main absolute top-0 right-0 w-5 h-5 bg-white rounded-full text-primary-main hover:text-primary-highlight cursor-pointer z-10' onClick = {() => onItemRemove(item)}/>
            <Save item = {item} input = {input} onCrop = {onCrop} statuses = {statuses} setStatuses = {setStatuses} inputIsEmpty = {inputIsEmpty} clearAllInput = {clearAllInput} parentId = {DOMId}/>
        </div>
    )
}, (b, a) => _.isEqual(b.item, a.item))

// const Info = memo(function Info({ category, value, classes, input, onInputChange, status, isThisInputEmpty, parentId }) {
//     const thisInputIsEmpty = useMemo(() => isThisInputEmpty(category), [input])

//     let DOMId = parentId + '-' + category
//     return (
//         <div id = {DOMId} className = {'w-full flex flex-col' + (status.message ? ' gap-xs' : '') + (classes ? ' ' + classes : '')}>
//             <Input id = {DOMId + '-input'} preset = 'profile' classes = {'w-full ' + (thisInputIsEmpty ? 'bg-base-main/muted hover:bg-base-main focus:bg-base-main text-text-main/killed placeholder:text-text-main/killed' : 'bg-primary-main text-text-primary')} status = {status.status} value = {input} onChange = {(e) => onChange(e)} placeholder = {value} autoComplete = 'off'/>
//             <Error message = {status.message} parentId = {DOMId}/>
//         </div>
//     )

//     function onChange(event) {
//         onInputChange(category, event.target.value, 'text')
//     }
// }, (b, a) => b.category === a.category && b.value === a.value && b.classes === a.classes && b.input === a.input && b.isThisInputEmpty === a.isThisInputEmpty && _.isEqual(b.status, a.status))

const Picture = memo(function Picture({ item, params, picture, input, onInputChange, status, parentId }) {
    const pictureInput = useRef(null)
    const [isCropping, setIsCropping] = useState(false)

    useEffect(() => {
        if (!status.status) {
            setIsCropping(false)
        }
    }, [status])

    let DOMId = parentId + '-picture'
    return (
        <div id = {DOMId} className = 'transition-colors duration-main w-full aspect-square flex justify-center items-center bg-white rounded-full border-base border-primary-main hover:border-primary-highlight overflow-hidden z-10 cursor-pointer'>
            <input id = {DOMId + '-input'} className = 'hidden' type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <ImageComponent external id = {DOMId + '-image'} path = {isCropping ? '' : input ? input : picture} classes = {'relative w-inscribed aspect-square flex justify-center items-center'} mode = 'cover' onClick = {() => onPictureClick()}>
                <Conditional value = {isCropping}>
                    <Cropper {...params}/>
                    <Error message = {status.message} parentId = {DOMId}/>
                </Conditional>
                <Conditional value = {!isCropping && !item.picture}>
                    <Text id = {DOMId + '-text'} preset = 'subtitle' classes = 'text-black/muted p-base text-center'>
                        {item.name}
                    </Text>
                </Conditional>
            </ImageComponent>
        </div>
    )

    function onUpload(event) {
        if (event.target.files[0]) {
            setIsCropping(true)
            onInputChange('picture', event.target.files[0], 'image')
        }
        event.currentTarget.value = null
    }

    function onPictureClick() {
        if (!isCropping) {
            pictureInput.current.click()
        }
    }
}, (b, a) => b.picture === a.picture && b.input === a.input && _.isEqual(b.item, a.item) && _.isEqual(b.status, a.status) && _.isEqual(JSON.stringify(b.params), JSON.stringify(a.params)))

const Save = memo(function Save({ item, input, onCrop, statuses, setStatuses, inputIsEmpty, clearAllInput, parentId }) {
    const { updateItem } = useDev()
    const changes = useMemo(() => {
        let newChanges = {}
        input && Object.keys(input).forEach(i => {
            if (input[i] !== '' && input[i] !== item[i]) {
                newChanges[i] = true
            }
        })
        return newChanges
    }, [input, item])
    const atLeastOneChangeFailed = useMemo(() => statuses && Object.keys(statuses).some(status => statuses[status].status === false), [statuses])
    const allChangesWereSuccessful = useMemo(() => statuses && (Object.keys(statuses).every(status => statuses[status].status !== false) && Object.keys(statuses).some(status => statuses[status].status === true)), [statuses])

    useEffect(() => {
        if (allChangesWereSuccessful) {
            clearAllInput()
        }
    }, [statuses])

    let DOMId = parentId + '-save'
    return (
        <div id = {DOMId} className = {'transition-all duration-main w-full bg-primary-main hover:bg-primary-highlight rounded-base overflow-hidden cursor-pointer ' + (!inputIsEmpty ? 'max-h-full p-xs' : 'max-h-0 p-0') + ' !animate-duration-300' + (atLeastOneChangeFailed ? ' animate-headShake' : '')} onClick = {() => onAction()}>
            <Text id = {DOMId + '-text'} preset = 'subtitle' classes = {'text-text-primary text-center'}>
                Save
            </Text>
        </div>
    )

    async function onAction() {
        if (!inputIsEmpty) {
            let promises = []
            for (const i of Object.keys(changes)) {
                promises.push(updateItem(item, i, i === 'picture' ? URL.createObjectURL(await onCrop(PICTURE_SIZE)) : input[i], true))
            }
            await Promise.all(promises).then((values) => {
                let newStatuses = {...statuses}
                for (const i of Object.keys(changes)) {
                    let { status, message } = values[Object.keys(changes).indexOf(i)]
                    newStatuses[i] = { status: status, message: message }
                }
                let allChangesWereSuccessful = newStatuses && (Object.keys(newStatuses).every(status => newStatuses[status].status !== false) && Object.keys(newStatuses).some(status => newStatuses[status].status === true))
                setStatuses(newStatuses, allChangesWereSuccessful ? 700 : 6000)
            })
        }
    }
}, (b, a) => b.inputIsEmpty === a.inputIsEmpty && _.isEqual(b.item, a.item) && _.isEqual(b.input, a.input) && _.isEqual(b.statuses, a.statuses))

const Error = memo(function Error({ message, parentId }) {
    let DOMId = parentId + '-error'
    return (
        <div id = {DOMId} className = {'w-full overflow-hidden transition-all duration-main ' + (message ? 'max-h-full' : 'max-h-0')}>
            <Text id = {DOMId + '-text'} preset = 'subtitle' classes = 'text-text-highlight/muted'>
                {message}
            </Text>
        </div>
    )
})

export default Edit