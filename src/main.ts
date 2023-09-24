import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDoc,
  addDoc,
  doc,
  updateDoc,
  increment,
  setDoc,
} from 'firebase/firestore'

import {
  fetchRandomImages,
  fetchPopularImages,
  fetchLatestImage,
} from '../helpers/fetching'

interface Data {
  error?: { message: string }
  code?: any
  msg?: string
  media_type?: 'image' | 'video'
  url?: string
  title?: string
  date?: string
  copyright?: string
  explanation?: string
}

class Cards {
  private photos: Data[] = []
  private cardState: string = 'photos'
  private fetchDataFunction: () => Promise<Data[] | Data>

  constructor(
    public onImageClick: (imageData: Data) => void,
    fetchDataFunction: () => Promise<Data[] | Data>
  ) {
    this.fetchDataFunction = fetchDataFunction
    this.fetchData()
  }

  private async storeDataInFirebase(data: Data) {
    if (data.date) {
      try {
        const docRef = doc(db, 'nasaData', data.date)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          // If document doesn't exist, create it with clicks set to 0
          await setDoc(docRef, {
            ...data,
            clicks: 0,
          })
        }
        // If the document already exists, we don't need to do anything here since the clicks will be updated via the incrementClickCount method
      } catch (error) {
        console.error('Error checking or adding document:', error)
      }
    }
  }

  private async incrementClickCount(data: Data) {
    if (data.date) {
      try {
        const docRef = doc(db, 'nasaData', data.date)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          // If document exists, update the clicks
          await updateDoc(docRef, {
            clicks: increment(1),
          })
        } else {
          // If document doesn't exist, create it with clicks set to 1
          await setDoc(docRef, {
            ...data,
            clicks: 1,
          })
        }
      } catch (error) {
        console.error('Error updating click count:', error)
      }
    }
  }

  private fetchData() {
    fetch(
      'https://api.nasa.gov/planetary/apod?api_key=E1RwjszVbe0bxmJHHZ5mUr8uDuTpKUYPiHkTVosB&count=2 '
    )
      .then((response) => response.json())
      .then((data) => {
        this.photos = data
        this.photos.forEach((photo) => {
          this.storeDataInFirebase(photo)
        })
        this.render()
      })
      .catch((error) => console.error('Error fetching photos:', error))
  }

  public render() {
    const cardWrapper = document.createElement('div')
    cardWrapper.className = 'cardWrapper'
    cardWrapper.setAttribute('data-state', this.cardState)

    const uiLayer = document.createElement('div')
    uiLayer.className = 'ui-layer'

    this.photos.forEach((photoData) => {
      const uiPhoto = document.createElement('div')
      uiPhoto.className = 'ui-photo'
      uiPhoto.setAttribute('data-photo', photoData.url!)
      uiPhoto.addEventListener('click', () => {
        this.onImageClick(photoData)
        this.incrementClickCount(photoData)
      })

      const img = document.createElement('img')
      img.src = photoData.url!
      img.alt = photoData.title!

      uiPhoto.appendChild(img)
      uiLayer.appendChild(uiPhoto)
    })

    cardWrapper.appendChild(uiLayer)

    const container = document.querySelector('#leftContainer')
    container?.appendChild(cardWrapper)
  }

  public clear() {
    const cardWrappers = document.querySelectorAll('.cardWrapper')
    cardWrappers.forEach((wrapper) => wrapper.remove())
  }
}

function handleImageClick(imageData: Data): void {
  document.getElementById('dailyImage')!.setAttribute('src', imageData.url!)
  document.getElementById('imageTitle')!.textContent = imageData.title!
  document.getElementById('imageDate')!.textContent = imageData.date!
  document.getElementById('imageDescription')!.textContent =
    imageData.explanation!
}

new Cards(handleImageClick, fetchRandomImages)
fetchDailyImage(new Date().toISOString().split('T')[0])

function fetchDailyImage(dateToFetch: string) {
  const url = `https://api.nasa.gov/planetary/apod?date=${dateToFetch}&api_key=E1RwjszVbe0bxmJHHZ5mUr8uDuTpKUYPiHkTVosB`

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      document.getElementById('dailyImage')!.setAttribute('src', data.url!)
      document.getElementById('imageTitle')!.textContent = data.title!
      document.getElementById('imageDate')!.textContent = data.date!
      document.getElementById('imageDescription')!.textContent =
        data.explanation!
    })
    .catch((error) => console.error('Error fetching daily image:', error))
}

document.getElementById('searchButton')!.addEventListener('click', () => {
  const selectedDate = (
    document.getElementById('searchDate') as HTMLInputElement
  ).value
  fetchDailyImage(selectedDate)
})

fetchDailyImage(new Date().toISOString().split('T')[0])

//Tab switch functionality
// Tab switch functionality
const tabSwitch = document.querySelectorAll('.tabItems')
tabSwitch.forEach((tab) => {
  tab.addEventListener('click', async (e) => {
    // Clear previous images
    const cardsInstance = new Cards(handleImageClick, fetchRandomImages)
    cardsInstance.clear()

    const tabName = (e.target as HTMLElement).textContent
    switch (tabName) {
      case 'Random':
        new Cards(handleImageClick, fetchRandomImages)
        break
      case 'Popular':
        new Cards(handleImageClick, fetchPopularImages)
        break
      case 'Latest':
        new Cards(handleImageClick, fetchLatestImage)
        break
    }
  })
})

const firebaseConfig = {
  apiKey: 'AIzaSyAoARK8yJAehauyYbcx3nMkI6u9jSuUhms',
  authDomain: 'astronomy-pictures-fe269.firebaseapp.com',
  projectId: 'astronomy-pictures-fe269',
  storageBucket: 'astronomy-pictures-fe269.appspot.com',
  messagingSenderId: '852557719622',
  appId: '1:852557719622:web:3c96fcbc99ffd5019e0247',
  measurementId: 'G-2YWDEK86BX',
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
