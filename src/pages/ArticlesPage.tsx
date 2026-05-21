import { useArticlePolling } from '../hooks/useArticlePolling'
import { ArticleCard } from '../components/ArticleCard'

export function ArticlesPage() {
  const { articles, lastPolled, isPolling, setIsPolling } = useArticlePolling(10_000)

  return (
    <div className="page articles-page">
      <h1>Articles</h1>
      <div className="poll-controls">
        <span className="poll-status">
          {isPolling ? 'Polling every 10 s' : 'Polling paused'}
          {lastPolled && ` — last updated ${lastPolled.toLocaleTimeString()}`}
        </span>
        <button onClick={() => setIsPolling((v) => !v)}>
          {isPolling ? 'Pause' : 'Resume'}
        </button>
      </div>
      <div className="article-list" role="feed" aria-label="Article feed">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  )
}
