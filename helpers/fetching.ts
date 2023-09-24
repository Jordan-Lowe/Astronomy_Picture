import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
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

const db = getFirestore()

export async function fetchRandomImages(): Promise<Data[]> {
  const url = `${NASA_API_BASE}?count=2&api_key=${API_KEY}`
  const response = await fetch(url)
  const data: Data[] = await response.json()
  return data
}

export async function fetchPopularImages(): Promise<Data[]> {
  const q = query(
    collection(db, 'nasaData'),
    orderBy('clicks', 'desc'),
    limit(2)
  )
  const querySnapshot = await getDocs(q)
  const popularImages: Data[] = []
  querySnapshot.forEach((doc) => {
    popularImages.push(doc.data() as Data)
  })
  return popularImages
}

export async function fetchLatestImage(): Promise<Data> {
  const today = new Date().toISOString().split('T')[0]
  const url = `${NASA_API_BASE}?date=${today}&api_key=${API_KEY}`
  const response = await fetch(url)
  const data: Data = await response.json()
  return data
}
