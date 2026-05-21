import type { ReactElement } from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import { ChatProvider } from '../contexts/ChatContext'
import { ChatPage } from '../pages/ChatPage'
import { storage, hashPassword } from '../utils/storage'

function buildUser(username = 'tester') {
  return {
    id: 'user-1',
    username,
    email: `${username}@test.com`,
    avatar: '',
    bio: '',
    createdAt: 0,
    passwordHash: hashPassword('pass'),
  }
}

function wrap(ui: ReactElement) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ChatProvider>{ui}</ChatProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('ChatPage', () => {
  beforeEach(() => {
    localStorage.clear()
    const user = buildUser()
    storage.saveUsers({ [user.id]: user })
    storage.setSession(user.id)
  })

  it('renders default rooms in sidebar', () => {
    wrap(<ChatPage />)
    // sidebar buttons carry accessible name "# RoomName"
    expect(screen.getByRole('button', { name: /# general/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /# random/i })).toBeInTheDocument()
  })

  it('shows message input', () => {
    wrap(<ChatPage />)
    expect(screen.getByRole('textbox', { name: /message input/i })).toBeInTheDocument()
  })

  it('send button disabled when input empty', () => {
    wrap(<ChatPage />)
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()
  })

  it('sends a message on form submit', async () => {
    wrap(<ChatPage />)
    const input = screen.getByRole('textbox', { name: /message input/i })
    fireEvent.change(input, { target: { value: 'Hello chat!' } })
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Hello chat!')).toBeInTheDocument()
  })

  it('clears input after sending', async () => {
    wrap(<ChatPage />)
    const input = screen.getByRole('textbox', { name: /message input/i }) as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Hi!' } })
    fireEvent.submit(input.closest('form')!)
    await act(async () => {})
    expect(input.value).toBe('')
  })

  it('can create a new room', async () => {
    wrap(<ChatPage />)
    const addBtn = screen.getByRole('button', { name: /new room/i })
    fireEvent.click(addBtn)
    const nameInput = screen.getByLabelText(/room name/i)
    fireEvent.change(nameInput, { target: { value: 'design' } })
    fireEvent.submit(nameInput.closest('form')!)
    expect(await screen.findByText(/# design/i)).toBeInTheDocument()
  })
})
