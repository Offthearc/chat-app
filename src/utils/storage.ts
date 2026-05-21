import type { StoredUser, User, Message, Room } from '../types'

const KEYS = {
  users: 'ca_users',
  rooms: 'ca_rooms',
  messages: 'ca_messages',
  pm: 'ca_pm',
  session: 'ca_session',
} as const

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

const DEFAULT_ROOMS: Room[] = [
  { id: 'general', name: 'General', description: 'General discussion', createdAt: 0 },
  { id: 'random', name: 'Random', description: 'Off-topic chatter', createdAt: 0 },
  { id: 'tech', name: 'Tech', description: 'Technology talk', createdAt: 0 },
]

export const storage = {
  getUsers(): Record<string, StoredUser> {
    return load<Record<string, StoredUser>>(KEYS.users, {})
  },
  saveUsers(users: Record<string, StoredUser>): void {
    save(KEYS.users, users)
  },
  getRooms(): Room[] {
    return load<Room[]>(KEYS.rooms, DEFAULT_ROOMS)
  },
  saveRooms(rooms: Room[]): void {
    save(KEYS.rooms, rooms)
  },
  getMessages(roomId: string): Message[] {
    const all = load<Record<string, Message[]>>(KEYS.messages, {})
    return all[roomId] ?? []
  },
  addMessage(msg: Message): void {
    const all = load<Record<string, Message[]>>(KEYS.messages, {})
    all[msg.roomId] = [...(all[msg.roomId] ?? []), msg]
    save(KEYS.messages, all)
  },
  getPMMessages(convId: string): Message[] {
    const all = load<Record<string, Message[]>>(KEYS.pm, {})
    return all[convId] ?? []
  },
  addPMMessage(convId: string, msg: Message): void {
    const all = load<Record<string, Message[]>>(KEYS.pm, {})
    all[convId] = [...(all[convId] ?? []), msg]
    save(KEYS.pm, all)
  },
  getSession(): string | null {
    return localStorage.getItem(KEYS.session)
  },
  setSession(userId: string): void {
    localStorage.setItem(KEYS.session, userId)
  },
  clearSession(): void {
    localStorage.removeItem(KEYS.session)
  },
}

export function toPublicUser(stored: StoredUser): User {
  return {
    id: stored.id,
    username: stored.username,
    email: stored.email,
    avatar: stored.avatar,
    bio: stored.bio,
    createdAt: stored.createdAt,
  }
}

export function hashPassword(password: string): string {
  let h = 0
  for (let i = 0; i < password.length; i++) {
    h = Math.imul(31, h) + password.charCodeAt(i)
  }
  return (h >>> 0).toString(36)
}
