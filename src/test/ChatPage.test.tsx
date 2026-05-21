import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ChatPage } from '../pages/ChatPage'

function renderChat() {
  return render(
    <MemoryRouter>
      <ChatPage />
    </MemoryRouter>,
  )
}

describe('ChatPage', () => {
  it('renders welcome message', () => {
    renderChat()
    expect(screen.getByText(/Welcome to Chat App/i)).toBeInTheDocument()
  })

  it('sends a message when form is submitted', async () => {
    renderChat()
    const input = screen.getByRole('textbox', { name: /message input/i })
    fireEvent.change(input, { target: { value: 'Hello world' } })
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Hello world')).toBeInTheDocument()
  })

  it('clears input after sending', async () => {
    renderChat()
    const input = screen.getByRole('textbox', { name: /message input/i }) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => expect(input.value).toBe(''))
  })

  it('disables send button when input is empty', () => {
    renderChat()
    const btn = screen.getByRole('button', { name: /send/i })
    expect(btn).toBeDisabled()
  })
})
