import { Data } from '../Interface/data'
import { DateTime } from 'luxon'

import {
  fetchRandomImages,
  fetchPopularImages,
  fetchLatestImage,
  fetchDailyImage,
  incrementClickCount,
} from '../helpers/fetchingFunctions'

const randomTab = document.getElementById('random')
const popularTab = document.getElementById('popular')
const latestTab = document.getElementById('latest')

// Set up event listeners on the list items
randomTab?.addEventListener('click', async () => {
  const images = await fetchRandomImages()
  displayImages(images)
})

popularTab?.addEventListener('click', async () => {
  // Fetch the latest image from the server
  const images = await fetchPopularImages()
  displayImages(images)
})

latestTab?.addEventListener('click', async () => {
  const image = await fetchLatestImage()
  displayImages([image])
})

function displayImages(images: Data[]) {
  for (let i = 0; i < 12; i++) {
    const photo = document.getElementById(`photo${i + 1}`) as HTMLImageElement
    if (images[i]) {
      photo.src = images[i].url ?? ''
      photo.alt = images[i].title ?? ''
    }
  }
}

function attachClickEventToPhotos(images: Data[]) {
  for (let i = 0; i < images.length; i++) {
    const photoDiv = document.querySelector(`.ui-photos:nth-child(${i + 1})`)
    if (photoDiv) {
      photoDiv.addEventListener('click', () => {
        updateLeftWrapper(images[i])
        incrementClickCount(images[i])
      })
    }
  }
}

function updateLeftWrapper(image: Data) {
  const dailyImage = document.getElementById('dailyImage') as HTMLImageElement
  const imageTitle = document.getElementById('imageTitle') as HTMLElement
  const imageDate = document.getElementById('imageDate') as HTMLElement
  const imageDescription = document.getElementById(
    'imageDescription'
  ) as HTMLElement

  dailyImage.src = image.url ?? ''
  imageTitle.textContent = image.title ?? ''
  imageDate.textContent = image.date ?? ''
  imageDescription.textContent = image.explanation ?? ''
}

// After fetching and displaying images, attach click event to each .ui-photos div.
async function onTabClick(fetchImages: () => Promise<Data[]>) {
  const images = await fetchImages()
  displayImages(images)
  attachClickEventToPhotos(images)
}

randomTab?.addEventListener('click', () => onTabClick(fetchRandomImages))
popularTab?.addEventListener('click', () => onTabClick(fetchPopularImages))
latestTab?.addEventListener('click', async () => {
  const image = await fetchLatestImage()
  displayImages([image])
  attachClickEventToPhotos([image])
})

document.getElementById('searchButton')!.addEventListener('click', () => {
  const selectedDate = (
    document.getElementById('searchDate') as HTMLInputElement
  ).value
  fetchDailyImage(selectedDate)
})

fetchDailyImage(new Date().toISOString().split('T')[0])

window.addEventListener('load', async () => {
  const images = await fetchRandomImages()
  displayImages(images)
  attachClickEventToPhotos(images)

  const todayInET = DateTime.local().setZone('America/New_York')
  const today = todayInET.toISODate()

  fetchDailyImage(today)
})
