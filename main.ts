import { Data } from './data'
import { DateTime } from 'luxon'

import {
  fetchRandomImages,
  fetchPopularImages,
  fetchLatestImage,
  fetchDailyImage,
  incrementClickCount,
  fetchLastImages,
} from './fetchingFunctions'

const randomTab = document.getElementById('random')
const popularTab = document.getElementById('popular')
const latestTab = document.getElementById('latest')

//Observer for lazy loading
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        img.src = img.getAttribute('data-src') || ''
        observer.unobserve(img)
      }
    })
  },
  { threshold: 0.01 }
)

// Observe images with 'data-src' attribute
document
  .querySelectorAll('img[data-src]')
  .forEach((img) => observer.observe(img as Element))

// Observe images with 'data-src' attribute
document
  .querySelectorAll('img[data-src]')
  .forEach((img) => observer.observe(img as Element))

document
  .querySelectorAll('img[data-src]')
  .forEach((img) => observer.observe(img as Element))

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
  const images = await fetchLastImages() // changed from fetchLatestImage to fetchLastImages
  displayImages(images)
})

function displayImages(images: Data[]) {
  for (let i = 0; i < 9; i++) {
    const photo = document.getElementById(`photo${i + 1}`) as HTMLImageElement
    if (images[i]) {
      photo.setAttribute('data-src', images[i].url ?? '')
      photo.alt = images[i].title ?? ''
      observer.observe(photo) // Ensure the observer is observing the image

      photo.onload = function () {
        ;(this as HTMLImageElement).classList.add('loaded') // Add 'loaded' class to the image when it's loaded
      }
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

  if (today !== null) {
    fetchDailyImage(today)
  }
})

console.log('commit went through')
