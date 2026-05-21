import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { currentUser, updateProfile, logout } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState(currentUser?.username ?? '')
  const [bio, setBio] = useState(currentUser?.bio ?? '')
  const [avatar, setAvatar] = useState(currentUser?.avatar ?? '')
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (!currentUser) return null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErr('')
    setSuccess('')
    setLoading(true)
    try {
      await updateProfile({ username: username.trim(), bio, avatar })
      setSuccess('Profile updated!')
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logout()
    nav('/login', { replace: true })
  }

  const initial = currentUser.username[0]?.toUpperCase() ?? '?'

  return (
    <div className="profile-page">
      <div className="profile-content">
        <h2>Profile Settings</h2>
        <div className="avatar-row">
          <div className="avatar-lg">
            {avatar ? <img src={avatar} alt={currentUser.username} /> : initial}
          </div>
          <div>
            <p style={{ fontWeight: 700, color: '#fff' }}>{currentUser.username}</p>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>{currentUser.email}</p>
          </div>
        </div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="p-username">Username</label>
            <input
              id="p-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              maxLength={32}
            />
          </div>
          <div className="form-row">
            <label htmlFor="p-avatar">Avatar URL</label>
            <input
              id="p-avatar"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="form-row">
            <label htmlFor="p-bio">Bio</label>
            <textarea
              id="p-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell everyone a bit about yourself…"
              maxLength={200}
            />
          </div>
          {err && <p className="err">{err}</p>}
          {success && <p className="success-msg">{success}</p>}
          <div className="profile-actions">
            <button type="submit" className="btn btn-primary" style={{ width: 'auto', marginTop: 0 }} disabled={loading}>
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => nav('/')}
            >
              ← Back to Chat
            </button>
          </div>
        </form>
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-danger btn-sm" onClick={handleLogout} type="button">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
