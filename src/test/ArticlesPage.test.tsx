import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ArticlesPage } from '../pages/ArticlesPage'

function renderArticles() {
  return render(
    <MemoryRouter>
      <ArticlesPage />
    </MemoryRouter>,
  )
}

describe('ArticlesPage', () => {
  it('renders the article feed heading', () => {
    renderArticles()
    expect(screen.getByRole('heading', { name: /articles/i })).toBeInTheDocument()
  })

  it('renders seed articles', () => {
    renderArticles()
    expect(screen.getByText(/The Future of AI/i)).toBeInTheDocument()
    expect(screen.getByText(/Web Performance/i)).toBeInTheDocument()
  })

  it('shows polling status', () => {
    renderArticles()
    expect(screen.getByText(/Polling every 10 s/i)).toBeInTheDocument()
  })

  it('pauses and resumes polling via button', () => {
    renderArticles()
    const btn = screen.getByRole('button', { name: /pause/i })
    fireEvent.click(btn)
    expect(screen.getByText(/Polling paused/i)).toBeInTheDocument()
    const resumeBtn = screen.getByRole('button', { name: /resume/i })
    fireEvent.click(resumeBtn)
    expect(screen.getByText(/Polling every 10 s/i)).toBeInTheDocument()
  })
})
