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
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore'

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

const API_KEY = 'E1RwjszVbe0bxmJHHZ5mUr8uDuTpKUYPiHkTVosB'
const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod'

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

// Fetch random images from NASA API
async function fetchRandomImages(): Promise<Data[]> {
  // Construct API URL
  const url = `${NASA_API_BASE}?count=2&api_key=${API_KEY}`

  // Fetch data from API
  const response = await fetch(url)

  // Parse response as JSON
  const data: Data[] = await response.json()

  // Return fetched data
  return data
}

// Fetch popular images from Firestore
async function fetchPopularImages(): Promise<Data[]> {
  // Define query to get 2 most popular images
  const q = query(
    collection(db, 'nasaData'),
    orderBy('clicks', 'desc'),
    limit(2)
  )

  // Get query snapshot from Firestore
  const querySnapshot = await getDocs(q)

  // Initialize array to store popular images
  const popularImages: Data[] = []

  // Loop through query snapshot and push data to popularImages array
  querySnapshot.forEach((doc) => {
    popularImages.push(doc.data() as Data)
  })

  // Return popular images array
  return popularImages
}

async function fetchLatestImage(): Promise<Data> {
  const today = new Date().toISOString().split('T')[0]
  const url = `${NASA_API_BASE}?date=${today}&api_key=${API_KEY}`
  const response = await fetch(url)
  const data: Data = await response.json()
  return data
}

function displayImages(images: Data[]) {
  // Get photo elements from DOM
  const photo1 = document.getElementById('photo1') as HTMLImageElement
  const photo2 = document.getElementById('photo2') as HTMLImageElement

  // Check if image data exists for first photo
  if (images[0]) {
    // Set photo1 src and alt attributes
    photo1.src = images[0].url ?? ''
    photo1.alt = images[0].title ?? ''
  }

  // Check if image data exists for second photo
  if (images[1]) {
    // Set photo2 src and alt attributes
    photo2.src = images[1].url ?? ''
    photo2.alt = images[1].title ?? ''
  }
}

async function storeDataInFirebase(data: Data) {
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

async function incrementClickCount(data: Data) {
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

function fetchDailyImage(dateToFetch: string) {
  const url = `${NASA_API_BASE}?date=${dateToFetch}&api_key=${API_KEY}`

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

window.addEventListener('load', async () => {
  const images = await fetchRandomImages()
  displayImages(images)

  const today = new Date().toISOString().split('T')[0]
  fetchDailyImage(today)
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
