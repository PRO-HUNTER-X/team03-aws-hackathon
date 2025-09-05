'use client'

import { useState, useEffect } from 'react'
import LoginForm from '@/components/LoginForm'
import Dashboard from '@/components/Dashboard'
import QnASetup from '@/components/QnASetup'
import { AuthService } from '@/lib/auth'

type AppState = 'loading' | 'login' | 'qna-setup' | 'dashboard'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = AuthService.getToken()
    if (savedToken) {
      setToken(savedToken)
      // 토큰이 있으면 설정 상태 확인
      checkSetupStatus()
    } else {
      setAppState('login')
    }
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/setup/status')
      const data = await response.json()
      
      if (data.data.hasQnAData) {
        setAppState('dashboard')
      } else {
        setAppState('qna-setup')
      }
    } catch (error) {
      console.error('설정 상태 확인 실패:', error)
      setAppState('login')
    }
  }

  const handleLoginSuccess = (newToken: string, hasQnASetup: boolean) => {
    setToken(newToken)
    setAppState(hasQnASetup ? 'dashboard' : 'qna-setup')
  }

  const handleQnASetupComplete = () => {
    setAppState('dashboard')
  }

  const handleLogout = () => {
    AuthService.removeToken()
    setToken(null)
    setAppState('login')
  }

  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <>
      {appState === 'login' && (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      )}
      {appState === 'qna-setup' && (
        <QnASetup onSetupComplete={handleQnASetupComplete} />
      )}
      {appState === 'dashboard' && token && (
        <Dashboard token={token} onLogout={handleLogout} />
      )}
    </>
  )
}