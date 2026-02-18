'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function Navbar() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="navbar">
      <div className="navbar-content">
        <Link href="/projects">
          <h1>IssueHub</h1>
        </Link>
        <nav>
          <Link href="/projects">Projects</Link>
          <span style={{ color: '#666' }}>{user.name}</span>
          <button onClick={logout} className="btn btn-secondary">
            Logout
          </button>
        </nav>
      </div>
    </div>
  )
}
