import React, { useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { IconCircleCheck, IconCirclePlus } from '@tabler/icons-react'
import { useRootContext } from '../../contexts/root'
import { useSearch } from '../../hooks/useSearch'
import { useDev } from '../../hooks/useDev'
import Text from '../../components/text'
import Input from '../../components/input'
import Conditional from '../../components/conditional'
import { default as ImageComponent } from '../../components/image'
import Competitor from '../../components/competitor'

export default function Images() {
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
                filters: { 
                    alphabetical: { 
                        fn: (a) => a.sort((a, b) => (a.name.localeCompare(b.name)))
                    }
                },
                limit: null,
                categories: ['competitions', 'competitors'],
                spaces: { competitions: data?.competitions, competitors: data?.competitors },
                keys: { competitions: ['name', 'competitions.name', 'sport.name'], competitors: ['name', 'competitions.name', 'sport.name'] },
                singleArray: true
            })
            if (Object.keys(item.data).length > 0) {
                setItem({...item, data: {...data[item.category.toLowerCase()].find(result => result.id === item.data.id)}})
            }
        }
    }, [data])

    return (
        <div id = 'dev-images-page' className = 'w-full h-full flex flex-col md:flex-row gap-smaller'>
            <Helmet><title>Images | Dev | Betsy</title></Helmet>
            <div id = 'dev-images-search-container' className = 'w-full h-[70%] md:h-full flex flex-col gap-smaller'>
                <Input id = 'dev-images-search-input' preset = 'search' status = {null} value = {input} onChange = {(e) => onInputChange(null, e.target.value, 'text')} placeholder = 'Search...' autoComplete = 'off' autoFocus/>
                <Items results = {results} onItemClick = {onItemClick}/>
            </div>
            <div className = 'flex-1 flex-col gap-smaller'>
                <Upload data = {data} item = {item} setItem = {setItem}/>
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

function Upload({data, item, setItem}) {
    const pictureInput = useRef(null)
    const { uploadPicture } = useDev()
    return (
        <div id = 'dev-upload-container' className = 'w-full md:w-min h-full flex flex-col items-center md:items-start gap-small'>
            <input id = 'dev-upload-input' style = {{ display: 'none' }} type = 'file' onChange = {(e) => onUpload(e)} ref = {pictureInput} accept = '.jpg, .jpeg, .png, .gif, .webp'/>
            <Text id = 'dev-upload-name-text' classes = 'transition-all duration-main w-full !text-xl md:!text-2xl text-center'>
                {item.data.name}
            </Text>
            <ImageComponent id = 'dev-upload-image' external path = {item?.data?.picture ? item?.data?.picture : ''} classes = {'w-min md:w-64 h-full md:h-min aspect-square rounded-full backdrop-blur-main ' + (Object.keys(item.data).length > 0 ? 'opacity-100 cursor-pointer' : 'opacity-0')} onClick = {() => onSubmit()}/>
        </div>
    )

    async function onSubmit() {
        if (Object.keys(item.data).length > 0) {
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
            setItem({
                ...item,
                picture: objectURL
            })
            if (item.category && item.data && objectURL) {
                await uploadPicture(item.category, item.data, objectURL)
            }
        }
    }
}

function Items({ results, onItemClick }) {
    return (
        <div id = 'dev-images-items-container' className = 'transition-all duration-main w-full h-full flex flex-col gap-tiny no-scrollbar overflow-scroll'>
            {results?.length > 0 && results?.map((result, index) => {
                let id = 'dev-images-item-' + result?.item?.name + '-'
                return (
                    <div key = {index} id = {id + 'text-container'} className = 'w-min flex flex-col cursor-pointer' onClick = {() => onItemClick(result?.item)}>
                        <Text id = {id + 'text-subtitle'} preset = 'dev-result-subtitle'>
                            {result?.item?.sport.name}
                        </Text>
                        <div id = {id + 'text-name'} className = 'flex items-center gap-tiny'>
                            <Conditional value = {result?.item?.picture}>
                                <IconCircleCheck id = {id + '-picture-taken'} size = {16} className = 'text-reverse-0 dark:text-base-0 !opacity-100'/>
                            </Conditional>
                            <Conditional value = {!result?.item?.picture}>
                                <IconCirclePlus id = {id + '-picture-taken'} size = {16} className = 'text-reverse-0 dark:text-base-0 !opacity-main'/>
                            </Conditional>
                            <Conditional value = {result?.category === 'competitors'}>
                                <Competitor image competitor = {result?.item} textClasses = '!text-xl'/>
                            </Conditional>
                            <Conditional value = {result?.category === 'competitions'}>
                                <Text id = {id + '-title'} preset = 'dev-result'>
                                    {result?.item?.name}
                                </Text>
                                <ImageComponent external path = {result?.item?.country?.picture} id = {id + 'image'} mode = 'cover' classes = ' h-4 w-6 rounded-sm'/>
                            </Conditional>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}