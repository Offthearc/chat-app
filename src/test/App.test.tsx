import { render, screen } from '@testing-library/react'
import { App } from '../App'

describe('App', () => {
  it('renders nav brand', () => {
    render(<App />)
    expect(screen.getByText('Chat App')).toBeInTheDocument()
  })

  it('renders chat and articles nav links', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /chat/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /articles/i })).toBeInTheDocument()
  })
})
