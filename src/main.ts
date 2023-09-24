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
  private fetchDataFunction: () => Promise<Data[] | Data>

  constructor(
    public onImageClick: (imageData: Data) => void,
    fetchDataFunction: () => Promise<Data[] | Data>
  ) {
    this.fetchDataFunction = fetchDataFunction
    this.fetchData()
  }

  clear() {
    const imageWrapper = document.getElementById('imageWrapper')
    if (imageWrapper) {
      imageWrapper.innerHTML = ''
    }
  }

  updateFetchDataFunction(newFetchDataFunction: () => Promise<Data[] | Data>) {
    this.fetchDataFunction = newFetchDataFunction
  }

  async fetchData() {
    try {
      const data = await this.fetchDataFunction()
      if (Array.isArray(data)) {
        this.photos = data
      } else {
        this.photos = [data]
      }
      this.photos.forEach(this.storeDataInFirebase)
      this.render()
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  render() {
    const imageWrapper = document.getElementById('imageWrapper')
    if (imageWrapper) {
      this.photos.forEach((photo) => {
        const imgElement = document.createElement('img')
        imgElement.src = photo.url!
        imageWrapper.appendChild(imgElement)
      })
    }
  }

  private async storeDataInFirebase(data: Data) {
    if (data.date) {
      try {
        const docRef = doc(db, 'nasaData', data.date)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            ...data,
            clicks: 0,
          })
        }
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
          await updateDoc(docRef, {
            clicks: increment(1),
          })
        } else {
          await setDoc(docRef, {
            ...data,
            clicks: 1,
          })
        }
      } catch (error) {
        console.error('Error incrementing click count:', error)
      }
    }
  }
}

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

const cardsInstance = new Cards(handleImageClick, fetchRandomImages)

const tabSwitch = document.querySelectorAll('.tabItems')
tabSwitch.forEach((tab) => {
  tab.addEventListener('click', async (e) => {
    cardsInstance.clear()
    const tabName = (e.target as HTMLElement).textContent
    switch (tabName) {
      case 'Random':
        cardsInstance.updateFetchDataFunction(fetchRandomImages)
        break
      case 'Popular':
        cardsInstance.updateFetchDataFunction(fetchPopularImages)
        break
      case 'Latest':
        cardsInstance.updateFetchDataFunction(fetchLatestImage)
        break
    }
    await cardsInstance.fetchData()
  })
})

document.getElementById('searchButton')!.addEventListener('click', () => {
  const selectedDate = (
    document.getElementById('searchDate') as HTMLInputElement
  ).value
  fetchDailyImage(selectedDate)
})

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

fetchDailyImage(new Date().toISOString().split('T')[0])
function handleImageClick(imageData: Data): void {
  throw new Error('Function not implemented.')
}

initializeApp(firebaseConfig)
