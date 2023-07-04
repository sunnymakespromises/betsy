import { useMemo, useRef, useState } from 'react'

function useCropper(picture) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [croppedArea, setCroppedArea] = useState()
    const [zoom, setZoom] = useState(1)
    const pictureRef = useRef()
    pictureRef.current = picture
    const croppedAreaRef = useRef()
    croppedAreaRef.current = croppedArea

    const params = useMemo(() => { return {
        image: picture,
        crop: crop,
        onCropChange: setCrop,
        zoom: zoom,
        onZoomChange: setZoom,
        onCropComplete: (_, area) => setCroppedArea(area),
        aspect: 1,
        showGrid: false,
        cropShape: 'round',
        objectFit: getObjectFit()
    }}, [picture, crop, zoom])

    function getObjectFit() {
        const img = document.createElement('img')
        img.src = picture
        return (img.width / img.height >= 1) ? 'vertical-cover' : 'horizontal-cover'
    }
    

    async function onCrop() {
        const image = await createImage(pictureRef.current)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = 254
        canvas.height = 254

        ctx.drawImage(
            image,
            croppedAreaRef.current.x,
            croppedAreaRef.current.y,
            croppedAreaRef.current.width,
            croppedAreaRef.current.height,
            0,
            0,
            canvas.width,
            canvas.height
        )

        return await new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })
    }

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', error => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    return [params, onCrop]
}

export { useCropper }