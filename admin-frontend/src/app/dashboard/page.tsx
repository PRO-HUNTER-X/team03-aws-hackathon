'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'
import Dashboard from '@/components/Dashboard'

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const handleLogout = () => {
    AuthService.removeToken()
    router.push('/')
  }

  useEffect(() => {
    const savedToken = AuthService.getToken()
    if (savedToken) {
      setToken(savedToken)
    } else {
      router.push('/')
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  if (!token) {
    return null
  }

  return <Dashboard token={token} onLogout={handleLogout} />
}