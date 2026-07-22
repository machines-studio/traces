export default async function (svgString, {
  width,
  height,
  density = 1,
  background,
  threshold
} = {}) {
  return new Promise(resolve => {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })

    const image = new Image()
    image.onload = async function () {
      const ratio = this.naturalWidth / this.naturalHeight
      const widthGiven = width != null
      const heightGiven = height != null

      width = (width ?? this.naturalWidth) * density
      height = (height ?? this.naturalHeight) * density

      // Preserve the real file's ratio using whichever dimension was not
      // explicitly requested; if both were given, width wins.
      if (width / height !== ratio) {
        if (heightGiven && !widthGiven) width = height * ratio
        else height = width / ratio
      }

      const canvas = new OffscreenCanvas(width, height)
      const context = canvas.getContext('2d')
      if (background) {
        context.fillStyle = background
        context.fillRect(0, 0, canvas.width, canvas.height)
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      if (threshold != null) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const { data } = imageData
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          const value = gray <= threshold ? 0 : 255
          data[i] = data[i + 1] = data[i + 2] = value
        }
        context.putImageData(imageData, 0, 0)
      }

      URL.revokeObjectURL(this.src)
      if (window.OffscreenCanvas) resolve(await canvas.convertToBlob({ type: 'image/png', quality: 1 }))
      else canvas.toBlob(blob => resolve(blob), 'image/png', 1)
    }

    image.src = URL.createObjectURL(svgBlob)
  })
}
