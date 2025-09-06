'use client'

import { useState } from 'react'
import { AuthService, LoginRequest } from '@/lib/auth'

interface LoginFormProps {
  onLoginSuccess: (token: string, hasQnASetup: boolean, companyInfo?: any) => void
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',
    password: ''
  })
  const [selectedCompany, setSelectedCompany] = useState('hunters-company')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const companies = [
    { id: 'hunters-company', name: '헌터스 쇼핑몰', industry: '이커머스' },
    { id: 'tech-saas', name: '테크 SaaS', industry: 'SaaS' },
    { id: 'finance-corp', name: '파이낸스 코퍼레이션', industry: '금융' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await AuthService.login(credentials)
      AuthService.setToken(response.access_token)
      AuthService.setCompanyId(selectedCompany)
      
      // 회사별 QnA 데이터 확인
      const routeInfo = await AuthService.getInitialRoute(selectedCompany)
      
      onLoginSuccess(
        response.access_token, 
        routeInfo.data.hasQnAData,
        routeInfo.data.companyInfo
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회사 선택
              </label>
              <select
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name} ({company.industry})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="사용자명"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}