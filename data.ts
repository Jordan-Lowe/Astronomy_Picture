//Type of data fetched from the NASA API

export interface Data {
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
