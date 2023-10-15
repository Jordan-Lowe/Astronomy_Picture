import { Data } from './data'
import * as dotenv from 'dotenv'
dotenv.config()

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDoc,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore'

const API_KEY = process.env.NASA_API_KEY!
const NASA_API_BASE = 'https://api.nasa.gov/planetary/apod'

// Fetch random images from NASA API

export async function fetchRandomImages(): Promise<Data[]> {
  // Construct API URL
  const url = `${NASA_API_BASE}?count=9&api_key=${API_KEY}`

  // Fetch data from API
  const response = await fetch(url)

  // Parse response as JSON
  const data: Data[] = await response.json()

  // Store data in Firestore
  data.forEach((image) => {
    storeDataInFirebase(image)
  })

  // Return fetched data
  return data
}

// Fetch popular images from Firestore
export async function fetchPopularImages(): Promise<Data[]> {
  // Define query to get 2 most popular images
  const q = query(
    collection(db, 'nasaData'),
    orderBy('clicks', 'desc'),
    limit(9)
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

export async function fetchLastImages(): Promise<Data[]> {
  const latestImages: Data[] = []
  const promises: Promise<Response>[] = []

  for (let i = 0; i < 9; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toISOString().split('T')[0] // format as YYYY-MM-DD
    const url = `${NASA_API_BASE}?date=${dateString}&api_key=${API_KEY}`
    promises.push(fetch(url))
  }

  const results = await Promise.all(promises)
  for (const response of results) {
    if (response.ok) {
      const data: Data = await response.json()
      latestImages.push(data)
    }
  }
  return latestImages
}

export async function fetchLatestImage(): Promise<Data> {
  const today = new Date().toISOString().split('T')[0]
  const url = `${NASA_API_BASE}?date=${today}&api_key=${API_KEY}`
  const response = await fetch(url)
  const data: Data = await response.json()
  return data
}

export async function fetchDailyImage(dateToFetch: string) {
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

export async function incrementClickCount(data: Data) {
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

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY!,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.FIREBASE_PROJECT_ID!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.FIREBASE_APP_ID!,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID!,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
