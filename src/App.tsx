import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { ChatPage } from './pages/ChatPage'
import { ArticlesPage } from './pages/ArticlesPage'
import './App.css'

export function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <span className="nav-brand">Chat App</span>
        <div className="nav-links">
          <NavLink to="/" end>
            Chat
          </NavLink>
          <NavLink to="/articles">Articles</NavLink>
        </div>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
