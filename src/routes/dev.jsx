import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { IconPhotoCheck } from '@tabler/icons-react'
import { useRootContext } from '../contexts/root'
import { DevProvider as Provider, useDevContext } from '../contexts/dev'
import { useSearch } from '../hooks/useSearch'
import { useApi } from '../hooks/useApi'
import Button from '../components/button'
import Text from '../components/text'
import Page from '../components/page'
import Input from '../components/input'
import Conditional from '../components/conditional'
import { default as ImageComponent } from '../components/image'
import { useLoading } from '../hooks/useLoading'

export default function Dev() {
    const { data, refreshData } = useRootContext()
    const { executeEdgeFunctions, uploadPicture } = useApi()
    const [isLoading, execute] = useLoading()
    const { input, setParams, onInputChange, results } = useSearch()
    const pictureInput = useRef(null)
    const [item, setItem] = useState({
        category: '',
        data: {},
        picture: ''
    })
    const context = { item, onSubmit, onItemClick, isLoading }

    useEffect(() => {
        if (data) {
            setParams({
                filters: {},
                limit: 30,
                space: data.competitions.concat(data.competitors).sort((a, b) => (a.name.localeCompare(b.name))),
                keys: ['name', 'competitions.name', 'sport.name'],
                emptyOnInitial: false,
                fullSpaceOnInitial: true
            })
        }
    }, [data])

    return (
        <Provider value = {context}>
            <Page>
                <div id = 'dev-page' className = 'w-full h-full flex flex-col gap-main'>
                    <Helmet><title>Dev | Betsy</title></Helmet>
                    <Input id = 'dev-data-items-search' preset = 'search' classes = 'h-min !text-2xl md:!text-3xl' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = 'Search...' autoComplete = 'off' autoFocus/>
                    <div id = 'dev-data-items-search-container' className = 'w-full h-full flex flex-row gap-small overflow-hidden'>
                        <input id = 'dev-data-items-search-input' style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
                        <Upload data = {results} category = 'Competitions'/>
                        <Preview/>
                    </div>
                    <Button id = 'dev-run-button' onClick = {() => onRun()} classes = 'group h-min w-min rounded-small md:rounded-main'>
                        <Conditional value = {isLoading}>
                            <ImageComponent id = 'dev-run-button-loading' path = 'images/loading.gif' classes = 'h-6 aspect-square m-1 opacity-main'/>
                        </Conditional>
                        <Conditional value = {!isLoading}>
                            <Text preset = 'button' id = 'dev-run-text' classes = 'transition-all duration-main !opacity-main group-hover:!opacity-100'>
                                Run
                            </Text>
                        </Conditional>
                    </Button>
                </div>
            </Page>
        </Provider>
    )

    async function onRun() {
        await execute(async () => {
            const { status, message } = await executeEdgeFunctions('test')
            if (status) {
                refreshData()
            }
            else {
                console.log(message)
            }
        })
    }

    async function onSubmit() {
        pictureInput.current.click()
    }

    function onItemClick(item) {
        let category = item.country ? 'Competitions' : 'Competitors'
        setItem({
            category: category,
            data: item
        })
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
            canvas.width = 254
            canvas.height = 254
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height)
            let objectURL = URL.createObjectURL(await new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    resolve(blob)
                }, 'image/png')
            }))
            setItem({
                ...item,
                picture: objectURL
            })
            if (item.category && item.data && objectURL) {
                await execute(async () => {
                    const { status, message } = await uploadPicture(item.category, item.data, objectURL)
                    if (status) {
                        refreshData()
                    }
                    else {
                        console.log(message)
                    }
                })
            }
        }
    }
}

function Preview() {
    const { item, onSubmit, isLoading } = useDevContext()
    return (
        <div id = 'dev-data-preview-container' className = 'w-48 md:w-64 flex flex-col items-center gap-small'>
            <Text id = 'dev-data-preview-name-text' classes = 'transition-all duration-main !text-xl md:!text-2xl text-center'>
                {item.data.name}
            </Text>
            <ImageComponent id = 'dev-data-preview-image' external path = {item?.data?.picture ? item?.data?.picture : ''} classes = 'w-full aspect-square rounded-full backdrop-blur-main'/>
            <Button onClick = {() => onSubmit()} id = 'dev-data-preview-action-button' classes = 'group h-min w-min rounded-small md:rounded-main'>
                <Conditional value = {isLoading}>
                    <ImageComponent id = 'dev-data-preview-loading' path = 'images/loading.gif' classes = 'h-6 aspect-square m-1 opacity-main'/>
                </Conditional>
                <Conditional value = {!isLoading}>
                    <Text preset = 'button' id = 'dev-data-preview-action-text' classes = 'transition-all duration-main !opacity-main group-hover:!opacity-100'>
                        Upload
                    </Text>
                </Conditional>
            </Button>
        </div>
    )
}

function Upload({ data }) {
    const { onItemClick } = useDevContext()
    return (
        <div id = 'dev-data-items-container' className = 'w-56 md:w-72 flex flex-col no-scrollbar overflow-auto scroll-smooth'>
            {data?.length > 0 && data?.map((item, index) => {
                return (
                    <div key = {index} id = {'dev-data-item-' + item.name + 'text-container'} className = 'w-full flex items-center gap-tiny' onClick = {() => onItemClick(item)}>
                        <Conditional value = {item?.picture}>
                            <IconPhotoCheck id = {'dev-data-item-' + item.name + '-picture-taken'} size = {16} className = 'text-reverse-0 dark:text-base-0 !opacity-more-visible'/>
                        </Conditional>
                        <Text id = {'dev-data-item-' + item?.name + '-title'} classes = 'transition-all duration-main whitespace-nowrap overflow-hidden text-ellipsis w-min !text-base md:!text-xl cursor-pointer'>
                            {item?.name}
                        </Text>
                        <Conditional value = {item?.country}>
                            <ImageComponent external path = {item?.country?.picture} mode = 'cover' classes = {'dev-data-item-' + item?.name + '-result-image h-4 w-6 rounded-sm'}/>
                        </Conditional>
                    </div>
                )
            })}
        </div>
    )
}