'use client'

import { useState, useEffect } from 'react'
import { AuthService, VerifyResponse } from '@/lib/auth'

interface DashboardProps {
  token: string
  onLogout: () => void
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [verifyResult, setVerifyResult] = useState<VerifyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerifyToken = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await AuthService.verify(token)
      setVerifyResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : '토큰 검증에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.removeToken()
    onLogout()
  }

  useEffect(() => {
    handleVerifyToken()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                CS 챗봇 관리자 대시보드
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 토큰 정보 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  현재 토큰 정보
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>현재 로그인된 토큰의 상태를 확인할 수 있습니다.</p>
                </div>
                <div className="mt-5">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-sm font-mono break-all text-gray-700">
                      {token.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 토큰 검증 카드 */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  토큰 검증
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>토큰의 유효성을 검증합니다.</p>
                </div>
                <div className="mt-5">
                  <button
                    onClick={handleVerifyToken}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                  >
                    {loading ? '검증 중...' : '토큰 검증'}
                  </button>
                </div>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {verifyResult && (
                  <div className="mt-4 p-4 bg-green-50 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          토큰 검증 성공
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>유효한 토큰: {verifyResult.valid ? '예' : '아니오'}</p>
                          {verifyResult.user && (
                            <p>사용자: {verifyResult.user.username}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API 테스트 섹션 */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  API 엔드포인트 테스트
                </h3>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">POST /auth/login</h4>
                    <p className="text-sm text-gray-500 mt-1">관리자 로그인 API</p>
                    <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      <pre>{JSON.stringify({ username: "admin", password: "admin123" }, null, 2)}</pre>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">POST /auth/verify</h4>
                    <p className="text-sm text-gray-500 mt-1">토큰 검증 API</p>
                    <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
                      <pre>Authorization: Bearer {'{token}'}</pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}