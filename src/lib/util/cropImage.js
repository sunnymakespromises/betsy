async function cropImage(size, picture) {
    const image = await createImage(picture)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = size[0]
    canvas.height = size[1]
    let x, y, width, height
    const aspectRatio = image.width / image.height // >1 = landscape, <1 = portrait
    x = aspectRatio >= 1 ? (image.width - image.height) / 2 : 0
    y = aspectRatio >= 1 ? 0 : (image.height - image.width) / 2
    width = aspectRatio >= 1 ? image.height : image.width
    height = aspectRatio >= 1 ? image.height : image.width
    ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height)
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

export default cropImage