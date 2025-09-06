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
    // 개발 중에는 항상 로그인 화면부터 시작
    AuthService.removeToken()
    setAppState('login')
    
    // const savedToken = AuthService.getToken()
    // if (savedToken) {
    //   setToken(savedToken)
    //   checkSetupStatus()
    // } else {
    //   setAppState('login')
    // }
  }, [])

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/setup/status')
      const data = await response.json()
      
      if (data.data.hasQnAData) {
        window.location.href = '/dashboard'
      } else {
        setAppState('qna-setup')
      }
    } catch (error) {
      console.error('설정 상태 확인 실패:', error)
      setAppState('login')
    }
  }

  const handleLoginSuccess = (newToken: string, hasQnASetup: boolean, companyInfo?: any) => {
    setToken(newToken)
    
    if (companyInfo) {
      console.log('로그인된 회사 정보:', companyInfo)
    }
    
    if (hasQnASetup) {
      window.location.href = '/dashboard'
    } else {
      setAppState('qna-setup')
    }
  }

  const handleQnASetupComplete = () => {
    window.location.href = '/dashboard'
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