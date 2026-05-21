export interface Message {
  id: string
  author: string
  content: string
  timestamp: number
}

export interface Article {
  id: string
  title: string
  summary: string
  url: string
  publishedAt: number
  source: string
}
