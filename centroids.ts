import * as imagescript from 'https://deno.land/x/imagescript@1.2.15/mod.ts'
import kmeans from './kmeans.js'

const inputImagesFilenames = []
for await (const dirEntry of Deno.readDir('img')) {
  if (!dirEntry.isFile || !dirEntry.name.endsWith('.png')) continue
  inputImagesFilenames.push(dirEntry.name)
}

inputImagesFilenames.forEach(async (fileName) => {
  const imageFile = await Deno.readFile('img/' + fileName)
  const image = await imagescript.decode(imageFile)
  if (image instanceof imagescript.GIF) return

  const rgbBitMap: Array<number[]> = []
  for (const pixel of image.iterateWithColors()) {
    if (!pixel || !pixel[2]) continue
    rgbBitMap.push(imagescript.Image.colorToRGB(pixel[2]))
  }

  const km = kmeans(rgbBitMap, 5)
  const newCentorids = km.centroids.map((centroid) => {
    return centroid.map((pos) => +pos.toFixed(0))
  })
  Deno.writeTextFile(`centroids/${fileName.replace('.png', '.json')}`, JSON.stringify(newCentorids))
})
