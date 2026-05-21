import { useState, useCallback } from 'react'
import type { Message } from '../types'

const DEMO_RESPONSES = [
  'That\'s interesting! Tell me more.',
  'I totally agree with that.',
  'Great point! Have you considered the other side?',
  'Thanks for sharing that!',
  'What do you think about the latest news?',
  'I\'ve been reading some great articles lately.',
]

function makeid(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: makeid(),
      author: 'Bot',
      content: 'Welcome to Chat App! Send a message to get started.',
      timestamp: Date.now(),
    },
  ])

  const sendMessage = useCallback((content: string) => {
    const userMsg: Message = {
      id: makeid(),
      author: 'You',
      content,
      timestamp: Date.now(),
    }
    setMessages((prev) => [...prev, userMsg])

    // Simulate bot reply after short delay
    const reply = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)]
    setTimeout(() => {
      const botMsg: Message = {
        id: makeid(),
        author: 'Bot',
        content: reply,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, botMsg])
    }, 800)
  }, [])

  return { messages, sendMessage }
}
