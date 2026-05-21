import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { storage, toPublicUser, hashPassword } from '../utils/storage'

interface AuthCtx {
  currentUser: User | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<Pick<User, 'username' | 'avatar' | 'bio'>>) => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const userId = storage.getSession()
    if (userId) {
      const users = storage.getUsers()
      const stored = users[userId]
      if (stored) setCurrentUser(toPublicUser(stored))
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const users = storage.getUsers()
    const stored = Object.values(users).find((u) => u.email === email)
    if (!stored) throw new Error('No account found with that email')
    if (stored.passwordHash !== hashPassword(password)) throw new Error('Incorrect password')
    storage.setSession(stored.id)
    setCurrentUser(toPublicUser(stored))
  }, [])

  const register = useCallback(async (username: string, email: string, password: string) => {
    const users = storage.getUsers()
    if (Object.values(users).some((u) => u.email === email))
      throw new Error('Email already registered')
    if (Object.values(users).some((u) => u.username === username))
      throw new Error('Username already taken')
    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      avatar: '',
      bio: '',
      createdAt: Date.now(),
      passwordHash: hashPassword(password),
    }
    users[newUser.id] = newUser
    storage.saveUsers(users)
    storage.setSession(newUser.id)
    setCurrentUser(toPublicUser(newUser))
  }, [])

  const logout = useCallback(() => {
    storage.clearSession()
    setCurrentUser(null)
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<Pick<User, 'username' | 'avatar' | 'bio'>>) => {
      if (!currentUser) throw new Error('Not authenticated')
      const users = storage.getUsers()
      const stored = users[currentUser.id]
      if (!stored) throw new Error('User not found')
      const updated = { ...stored, ...updates }
      users[currentUser.id] = updated
      storage.saveUsers(users)
      const pub = toPublicUser(updated)
      setCurrentUser(pub)
      try {
        const ch = new BroadcastChannel('ca-sync')
        ch.postMessage({ type: 'USER_UPDATED', user: pub })
        ch.close()
      } catch {
        // not available in tests
      }
    },
    [currentUser],
  )

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
