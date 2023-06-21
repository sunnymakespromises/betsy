import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { IconPhotoCheck } from '@tabler/icons-react'
import { useRootContext } from '../../contexts/root'
import { useSearch } from '../../hooks/useSearch'
import { useApi } from '../../hooks/useApi'
import Text from '../../components/text'
import Input from '../../components/input'
import Conditional from '../../components/conditional'
import { default as ImageComponent } from '../../components/image'

export default function Competitors() {
    const { data } = useRootContext()
    const { input, setParams, onInputChange, results } = useSearch()
    const [item, setItem] = useState({
        category: '',
        data: {},
        picture: ''
    })

    useEffect(() => {
        if (data) {
            setParams({
                filters: [{ name: 'Alphabetical', fn: (a) => a.sort((a, b) => (a.name.localeCompare(b.name)))}],
                limit: null,
                space: data.competitions.concat(data.competitors),
                keys: ['name', 'competitions.name', 'sport.name']
            })
        }
    }, [data])

    return (
        <div id = 'dev-competitors-page' className = 'w-full h-full flex flex-col md:flex-row gap-smaller'>
            <Helmet><title>Competitors | Dev | Betsy</title></Helmet>
            <div id = 'dev-competitors-search-container' className = 'w-full md:w-min h-[70%] md:h-full flex flex-col gap-smaller'>
                <Input id = 'dev-competitors-search-input' preset = 'search' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = 'Search...' autoComplete = 'off' autoFocus/>
                <Items data = {results} onItemClick = {onItemClick}/>
            </div>
            <div className = 'flex-1 flex-col gap-smaller'>
                <Upload item = {item} setItem = {setItem}/>
            </div>
        </div>
    )

    function onItemClick(item) {
        let category = item.country ? 'Competitions' : 'Competitors'
        setItem({
            category: category,
            data: item
        })
    }
}

function Upload({item, setItem}) {
    const pictureInput = useRef(null)
    const { refreshData } = useRootContext()
    const { uploadPicture } = useApi()
    return (
        <div id = 'dev-upload-container' className = 'w-full md:w-min h-full flex flex-col gap-small'>
            <input id = 'dev-data-items-upload-input' style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Text id = 'dev-data-upload-name-text' classes = 'transition-all duration-main !text-xl md:!text-2xl text-center'>
                {item.data.name}
            </Text>
            <ImageComponent id = 'dev-data-upload-image' external path = {item?.data?.picture ? item?.data?.picture : ''} classes = 'w-min md:w-64 h-full md:h-min aspect-square rounded-full backdrop-blur-main cursor-pointer' onClick = {() => onSubmit()}/>
        </div>
    )

    async function onSubmit() {
        pictureInput.current.click()
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
                const { status, message } = await uploadPicture(item.category, item.data, objectURL)
                if (status) {
                    refreshData()
                }
                else {
                    console.log(message)
                }
            }
        }
    }
}

function Items({ data, onItemClick }) {
    return (
        <div id = 'dev-competitors-items-container' className = 'transition-all duration-main w-full h-full flex flex-col gap-tiny overflow-scroll'>
            {data?.length > 0 && data?.map((item, index) => {
                let id = 'dev-competitors-item-' + item.name + '-'
                return (
                    <div key = {index} id = {id + 'text-container'} className = 'w-full flex flex-col cursor-pointer' onClick = {() => onItemClick(item)}>
                        <Text id = {id + 'text-subtitle'} preset = 'dev-result-subtitle'>
                            {item?.sport.name}
                        </Text>
                        <div id = {id + 'text-name'} className = 'flex gap-tiny'>
                            <Conditional value = {item?.picture}>
                                <IconPhotoCheck id = {id + '-picture-taken'} size = {16} className = 'text-reverse-0 dark:text-base-0 !opacity-more-visible'/>
                            </Conditional>
                            <Text id = {id + '-title'} preset = 'dev-result'>
                                {item?.name}
                            </Text>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}