import { useState, useEffect, useRef, useCallback } from 'react'
import type { Article } from '../types'

const SEED_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'The Future of AI in Everyday Life',
    summary: 'Artificial intelligence is rapidly becoming part of our daily routines.',
    url: '#',
    publishedAt: Date.now() - 3600_000,
    source: 'Tech Daily',
  },
  {
    id: '2',
    title: 'Web Performance Best Practices in 2024',
    summary: 'A roundup of the most impactful techniques to speed up web apps.',
    url: '#',
    publishedAt: Date.now() - 7200_000,
    source: 'Dev Weekly',
  },
  {
    id: '3',
    title: "React 19: What's New",
    summary: 'A deep dive into the new concurrent features shipping in React 19.',
    url: '#',
    publishedAt: Date.now() - 10800_000,
    source: 'Frontend Focus',
  },
]

let articleCounter = SEED_ARTICLES.length

function fetchLatestArticles(): Promise<Article[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (Math.random() < 0.4) {
        articleCounter += 1
        const newArticle: Article = {
          id: String(articleCounter),
          title: `Breaking: Story #${articleCounter} just published`,
          summary: 'This is a freshly polled article from the news feed.',
          url: '#',
          publishedAt: Date.now(),
          source: 'Live Feed',
        }
        resolve([newArticle])
      } else {
        resolve([])
      }
    }, 300)
  })
}

export function useArticlePolling(intervalMs = 10_000) {
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES)
  const [lastPolled, setLastPolled] = useState<Date | null>(null)
  const [isPolling, setIsPolling] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const poll = useCallback(async () => {
    const fresh = await fetchLatestArticles()
    if (fresh.length > 0) {
      setArticles((prev) => {
        const existingIds = new Set(prev.map((a) => a.id))
        const newOnes = fresh.filter((a) => !existingIds.has(a.id))
        return newOnes.length > 0 ? [newOnes[0], ...prev] : prev
      })
    }
    setLastPolled(new Date())
  }, [])

  useEffect(() => {
    poll()
  }, [poll])

  useEffect(() => {
    if (!isPolling) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(poll, intervalMs)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPolling, intervalMs, poll])

  return { articles, lastPolled, isPolling, setIsPolling }
}
