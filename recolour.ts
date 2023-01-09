import * as imagescript from 'https://deno.land/x/imagescript@1.2.15/mod.ts'
import { getDistanceSQ } from './kmeans.js'

const inputImagesFilenames = []
for await (const dirEntry of Deno.readDir('img')) {
  if (!dirEntry.isFile || !dirEntry.name.endsWith('.png')) continue
  inputImagesFilenames.push(dirEntry.name)
}

inputImagesFilenames.forEach(async (fileName) => {
  const imageFile = await Deno.readFile('img/' + fileName)
  const image = await imagescript.decode(imageFile)
  if (image instanceof imagescript.GIF) return

  const centroidFile = await Deno.readTextFile('centroids/' + fileName.replace('.png', '.json'))
  const centroids = JSON.parse(centroidFile)

  const reducedImage = new imagescript.Image(image.width, image.height)

  for (const pixel of image.iterateWithColors()) {
    if (!pixel || pixel.length < 3) continue

    const modifiedColour = getClosestCentroid(centroids, imagescript.Image.colorToRGB(pixel[2]))
    reducedImage.setPixelAt(
      pixel[0],
      pixel[1],
      imagescript.Image.rgbToColor(modifiedColour[0], modifiedColour[1], modifiedColour[2])
    )
  }
  Deno.writeFile('modified/' + fileName, await reducedImage.encode(0))
})

function getClosestCentroid(centroids: Array<number[]>, point: number[]) {
  let minDistance = Number.MAX_VALUE
  let closest = [0, 0, 0]
  for (const centroid of centroids) {
    const dist = getDistanceSQ(centroid, point)
    if (dist < minDistance) {
      minDistance = dist
      closest = centroid
    }
  }
  return closest
}
