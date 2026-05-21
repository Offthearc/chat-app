import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useChat } from '../contexts/ChatContext'
import type { Message } from '../types'

function Avatar({ username, url }: { username: string; url?: string }) {
  const initial = username[0]?.toUpperCase() ?? '?'
  return (
    <div className="msg-avatar">
      {url ? <img src={url} alt={username} /> : initial}
    </div>
  )
}

function MessageItem({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="msg">
      <Avatar username={msg.senderUsername} />
      <div className="msg-body">
        <div className="msg-meta">
          <span className={`msg-name${isOwn ? ' own' : ''}`}>{msg.senderUsername}</span>
          <span className="msg-time">{time}</span>
        </div>
        <div className="msg-text">{msg.content}</div>
      </div>
    </div>
  )
}

function NewRoomModal({ onClose }: { onClose: () => void }) {
  const { createRoom } = useChat()
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    createRoom(name.trim(), desc.trim())
    onClose()
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Create Room</h3>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <label htmlFor="room-name">Room Name</label>
            <input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. design"
              required
              autoFocus
            />
          </div>
          <div className="form-row">
            <label htmlFor="room-desc">Description</label>
            <input
              id="room-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="modal-btns">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ width: 'auto', marginTop: 0 }}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ChatPage() {
  const { currentUser, logout } = useAuth()
  const {
    rooms, users,
    currentRoomId, setCurrentRoomId,
    messages, pmMessages,
    activePMUserId, setActivePMUserId,
    sendMessage, sendPM,
  } = useChat()
  const nav = useNavigate()
  const [input, setInput] = useState('')
  const [showNewRoom, setShowNewRoom] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const displayMessages = activePMUserId ? pmMessages : messages
  const activeRoom = rooms.find((r) => r.id === currentRoomId)
  const pmUser = activePMUserId ? users.find((u) => u.id === activePMUserId) : null
  const otherUsers = users.filter((u) => u.id !== currentUser?.id)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages])

  function handleSend(e?: FormEvent) {
    e?.preventDefault()
    const text = input.trim()
    if (!text) return
    if (activePMUserId) {
      sendPM(text)
    } else {
      sendMessage(text)
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleLogout() {
    logout()
    nav('/login', { replace: true })
  }

  const initial = currentUser?.username[0]?.toUpperCase() ?? '?'

  return (
    <div className="app">
      <header className="app-header">
        <span className="brand">💬 Chat App</span>
        <div className="header-right">
          <div className="msg-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
            {currentUser?.avatar
              ? <img src={currentUser.avatar} alt={currentUser.username} />
              : initial}
          </div>
          <span className="uname">{currentUser?.username}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => nav('/profile')}>
            Profile
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </header>
      <div className="app-body">
        <nav className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-section-hd">
              <span>Rooms</span>
              <button onClick={() => setShowNewRoom(true)} aria-label="New room" title="New room">+</button>
            </div>
            {rooms.map((room) => (
              <button
                key={room.id}
                className={`sidebar-item${!activePMUserId && currentRoomId === room.id ? ' active' : ''}`}
                onClick={() => { setActivePMUserId(null); setCurrentRoomId(room.id) }}
              >
                # {room.name}
              </button>
            ))}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-section-hd">
              <span>Direct Messages</span>
            </div>
            {otherUsers.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 8px' }}>
                No other users yet
              </p>
            )}
            {otherUsers.map((user) => (
              <button
                key={user.id}
                className={`sidebar-item${activePMUserId === user.id ? ' active' : ''}`}
                onClick={() => setActivePMUserId(user.id)}
              >
                @ {user.username}
              </button>
            ))}
          </div>
        </nav>
        <div className="chat-area">
          <div className="chat-hd">
            {activePMUserId ? (
              <>
                <div className="room-name">@ {pmUser?.username ?? 'User'}</div>
                <div className="room-desc">Direct message</div>
              </>
            ) : (
              <>
                <div className="room-name"># {activeRoom?.name ?? currentRoomId}</div>
                <div className="room-desc">{activeRoom?.description ?? ''}</div>
              </>
            )}
          </div>
          <div className="messages" role="log" aria-live="polite">
            {displayMessages.length === 0 && (
              <div className="messages-empty">No messages yet — say hello!</div>
            )}
            {displayMessages.map((msg) => (
              <MessageItem key={msg.id} msg={msg} isOwn={msg.senderId === currentUser?.id} />
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="input-bar">
            <form className="input-inner" onSubmit={handleSend}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activePMUserId ? `Message @ ${pmUser?.username ?? ''}` : `Message # ${activeRoom?.name ?? ''}`}
                aria-label="Message input"
              />
              <button type="submit" className="send-btn" disabled={!input.trim()}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
      {showNewRoom && <NewRoomModal onClose={() => setShowNewRoom(false)} />}
    </div>
  )
}
