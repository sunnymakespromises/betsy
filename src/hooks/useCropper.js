import { useMemo, useRef, useState } from 'react'
import cropImage from '../lib/util/cropImage'

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
    
    async function onCrop(size) {
        return cropImage(size, pictureRef.current)
    }

    return [params, onCrop]
}

export { useCropper }