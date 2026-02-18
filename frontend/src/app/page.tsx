'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/projects')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="loading">
      <p>Loading...</p>
    </div>
  )
}
