import type { Article } from '../types'

interface Props {
  article: Article
}

export function ArticleCard({ article }: Props) {
  const time = new Date(article.publishedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <article className="article-card">
      <header>
        <span className="source">{article.source}</span>
        <time>{time}</time>
      </header>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
    </article>
  )
}
