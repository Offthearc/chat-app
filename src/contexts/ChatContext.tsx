import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Room, Message, User, BroadcastPayload } from '../types'
import { storage, toPublicUser } from '../utils/storage'
import { useAuth } from './AuthContext'

interface ChatCtx {
  rooms: Room[]
  users: User[]
  currentRoomId: string
  setCurrentRoomId: (id: string) => void
  messages: Message[]
  pmMessages: Message[]
  activePMUserId: string | null
  setActivePMUserId: (id: string | null) => void
  sendMessage: (content: string) => void
  sendPM: (content: string) => void
  createRoom: (name: string, description: string) => void
}

const ChatContext = createContext<ChatCtx | null>(null)

function broadcast(payload: BroadcastPayload): void {
  try {
    const ch = new BroadcastChannel('ca-sync')
    ch.postMessage(payload)
    ch.close()
  } catch {
    // not available in test environment
  }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth()
  const [rooms, setRooms] = useState<Room[]>(() => storage.getRooms())
  const [users, setUsers] = useState<User[]>(() =>
    Object.values(storage.getUsers()).map(toPublicUser),
  )
  const [currentRoomId, setCurrentRoomId] = useState('general')
  const [activePMUserId, setActivePMUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>(() => storage.getMessages('general'))
  const [pmMessages, setPMMessages] = useState<Message[]>([])

  const roomIdRef = useRef(currentRoomId)
  const pmUserIdRef = useRef(activePMUserId)
  const currentUserRef = useRef(currentUser)
  roomIdRef.current = currentRoomId
  pmUserIdRef.current = activePMUserId
  currentUserRef.current = currentUser

  useEffect(() => {
    setMessages(storage.getMessages(currentRoomId))
  }, [currentRoomId])

  useEffect(() => {
    if (activePMUserId && currentUser) {
      const convId = [currentUser.id, activePMUserId].sort().join('_')
      setPMMessages(storage.getPMMessages(convId))
    } else {
      setPMMessages([])
    }
  }, [activePMUserId, currentUser])

  useEffect(() => {
    setUsers(Object.values(storage.getUsers()).map(toPublicUser))
  }, [currentUser])

  useEffect(() => {
    let ch: BroadcastChannel | null = null
    try {
      ch = new BroadcastChannel('ca-sync')
      ch.onmessage = (e: MessageEvent<BroadcastPayload>) => {
        const d = e.data
        if (d.type === 'MESSAGE' && d.message.roomId === roomIdRef.current) {
          setMessages((prev) => [...prev, d.message])
        } else if (d.type === 'ROOM_CREATED') {
          setRooms((prev) => [...prev, d.room])
        } else if (d.type === 'USER_UPDATED') {
          setUsers((prev) => prev.map((u) => (u.id === d.user.id ? d.user : u)))
        } else if (d.type === 'PM' && currentUserRef.current) {
          const convId = [currentUserRef.current.id, pmUserIdRef.current].sort().join('_')
          if (d.convId === convId) setPMMessages((prev) => [...prev, d.message])
        }
      }
    } catch {
      // not in tests
    }
    return () => ch?.close()
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      if (!currentUser) return
      const msg: Message = {
        id: crypto.randomUUID(),
        roomId: currentRoomId,
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        content,
        timestamp: Date.now(),
      }
      storage.addMessage(msg)
      setMessages((prev) => [...prev, msg])
      broadcast({ type: 'MESSAGE', message: msg })
    },
    [currentUser, currentRoomId],
  )

  const sendPM = useCallback(
    (content: string) => {
      if (!currentUser || !activePMUserId) return
      const convId = [currentUser.id, activePMUserId].sort().join('_')
      const msg: Message = {
        id: crypto.randomUUID(),
        roomId: convId,
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        content,
        timestamp: Date.now(),
      }
      storage.addPMMessage(convId, msg)
      setPMMessages((prev) => [...prev, msg])
      broadcast({ type: 'PM', convId, message: msg })
    },
    [currentUser, activePMUserId],
  )

  const createRoom = useCallback((name: string, description: string) => {
    const room: Room = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      createdAt: Date.now(),
    }
    const updated = [...storage.getRooms(), room]
    storage.saveRooms(updated)
    setRooms(updated)
    broadcast({ type: 'ROOM_CREATED', room })
  }, [])

  return (
    <ChatContext.Provider
      value={{
        rooms,
        users,
        currentRoomId,
        setCurrentRoomId,
        messages,
        pmMessages,
        activePMUserId,
        setActivePMUserId,
        sendMessage,
        sendPM,
        createRoom,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat(): ChatCtx {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be inside ChatProvider')
  return ctx
}
