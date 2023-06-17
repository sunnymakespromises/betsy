import { useState } from 'react'

function useCropper(picture) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [croppedArea, setCroppedArea] = useState()
    const [zoom, setZoom] = useState(1)
    const [croppedImage, setCroppedImage] = useState()

    const params = {
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
    }

    function getObjectFit() {
        const img = document.createElement('img')
        img.src = picture
        return (img.width / img.height >= 1) ? 'vertical-cover' : 'horizontal-cover'
    }
    

    async function onCrop() {
        const image = await createImage(picture)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        canvas.width = 254
        canvas.height = 254

        ctx.drawImage(
            image,
            croppedArea.x,
            croppedArea.y,
            croppedArea.width,
            croppedArea.height,
            0,
            0,
            canvas.width,
            canvas.height
        )

        setCroppedImage(await new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/jpeg')
        }))
    }

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', error => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    return [params, onCrop, croppedImage]
}

export { useCropper }