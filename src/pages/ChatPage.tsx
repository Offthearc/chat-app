import { useRef, useEffect, useState, type FormEvent } from 'react'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from '../components/MessageBubble'

export function ChatPage() {
  const { messages, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    sendMessage(text)
    setInput('')
  }

  return (
    <div className="page chat-page">
      <h1>Chat</h1>
      <div className="messages" role="log" aria-live="polite">
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isOwn={m.author === 'You'} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a message…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Message input"
        />
        <button type="submit" disabled={!input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
