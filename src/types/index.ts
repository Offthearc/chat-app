export interface User {
  id: string
  username: string
  email: string
  avatar: string
  bio: string
  createdAt: number
}

export interface StoredUser extends User {
  passwordHash: string
}

export interface Message {
  id: string
  roomId: string
  senderId: string
  senderUsername: string
  content: string
  timestamp: number
}

export interface Room {
  id: string
  name: string
  description: string
  createdAt: number
}

export type BroadcastPayload =
  | { type: 'MESSAGE'; message: Message }
  | { type: 'PM'; convId: string; message: Message }
  | { type: 'ROOM_CREATED'; room: Room }
  | { type: 'USER_UPDATED'; user: User }
