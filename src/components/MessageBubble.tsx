import type { Message } from '../types'

interface Props {
  message: Message
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: Props) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  return (
    <div className={`message-row ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && <span className="author">{message.author}</span>}
      <div className="bubble">
        <p>{message.content}</p>
        <time>{time}</time>
      </div>
    </div>
  )
}
