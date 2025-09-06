'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'

interface DashboardProps {
  token: string
  onLogout: () => void
}

interface Stats {
  total: number
  status: { pending: number; processing: number; completed: number }
  urgency: { high: number; normal: number; low: number }
  types: Record<string, number>
}

interface Inquiry {
  id: string
  status: string
  type: string
  title: string
  content: string
  urgency: string
  customerId: string
  timeAgo: string
}

interface UrgentAlerts {
  count: number
  inquiries: Inquiry[]
}

export default function Dashboard({ token, onLogout }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([])
  const [urgentAlerts, setUrgentAlerts] = useState<UrgentAlerts | null>(null)
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchDashboardData = async () => {
    try {
      const [statsRes, inquiriesRes, alertsRes, insightsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/recent-inquiries?limit=5'),
        fetch('/api/dashboard/urgent-alerts'),
        fetch('/api/dashboard/insights')
      ])

      const statsData = await statsRes.json()
      const inquiriesData = await inquiriesRes.json()
      const alertsData = await alertsRes.json()
      const insightsData = await insightsRes.json()

      setStats(statsData.data)
      setRecentInquiries(inquiriesData.data)
      setUrgentAlerts(alertsData.data)
      if (insightsData.success) setInsights(insightsData.data)
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.removeToken()
    onLogout()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">대시보드 로딩 중...</div>
      </div>
    )
  }

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
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchDashboardData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                새로고침
              </button>
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
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <button 
                onClick={() => router.push('/inquiries')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">전체 문의</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
              </button>
              <button 
                onClick={() => router.push('/inquiries?status=대기')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">대기 중</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.status.pending}</p>
              </button>
              <button 
                onClick={() => router.push('/inquiries?status=처리중')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">처리 중</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.status.processing}</p>
              </button>
              <button 
                onClick={() => router.push('/inquiries?status=완료')}
                className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-left"
              >
                <h3 className="text-lg font-medium text-gray-900">완료</h3>
                <p className="text-3xl font-bold text-gray-600 mt-2">{stats.status.completed}</p>
              </button>
            </div>
          )}

          {/* AI 비즈니스 인사이트 */}
          {insights && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-blue-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  🤖 AI 비즈니스 인사이트
                  <span className="ml-2 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">실시간</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-red-600 mb-2">🚨 오늘의 주요 이슈</h4>
                    <p className="text-sm text-gray-700">{insights.todayAlert}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-600 mb-2">💡 빠른 개선안</h4>
                    <p className="text-sm text-gray-700">{insights.quickWins}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-medium text-yellow-600 mb-2">📅 예측 알림</h4>
                    <p className="text-sm text-gray-700">{insights.predictions}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-600 mb-2">💰 절약 효과</h4>
                    <p className="text-sm text-gray-700">{insights.costSaving}</p>
                  </div>
                </div>
                {insights.actionItems && (
                  <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">⚡ 지금 바로 할 수 있는 일</h4>
                    <ul className="space-y-2">
                      {insights.actionItems.map((item: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {urgentAlerts && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    <button 
                      onClick={() => router.push('/inquiries?urgency=높음')}
                      className="hover:text-blue-600"
                    >
                      긴급 알림 ({urgentAlerts.count}건)
                    </button>
                  </h3>
                </div>
                <div className="p-6">
                  {urgentAlerts.inquiries.length > 0 ? (
                    <div className="space-y-4">
                      {urgentAlerts.inquiries.map((inquiry) => (
                        <div 
                          key={inquiry.id} 
                          onClick={() => router.push(`/inquiries/${inquiry.id}`)}
                          className="border-l-4 border-red-500 pl-4 py-2 hover:bg-gray-50 cursor-pointer rounded-r-md transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 hover:text-blue-600">{inquiry.title}</h4>
                              <p className="text-sm text-gray-600">{inquiry.type}</p>
                              <p className="text-xs text-gray-500 mt-1">{inquiry.timeAgo}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                                {inquiry.urgency}
                              </span>
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">긴급 문의가 없습니다.</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  최근 문의 ({recentInquiries.length}건)
                </h3>
              </div>
              <div className="p-6">
                {recentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiries.map((inquiry) => (
                      <div 
                        key={inquiry.id} 
                        onClick={() => router.push(`/inquiries/${inquiry.id}`)}
                        className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 hover:text-blue-600">{inquiry.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{inquiry.content}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">{inquiry.type}</span>
                              <span className="text-xs text-gray-500">{inquiry.timeAgo}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              inquiry.status === '대기' ? 'bg-yellow-100 text-yellow-800' :
                              inquiry.status === '처리중' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {inquiry.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              inquiry.urgency === '높음' ? 'bg-red-100 text-red-800' :
                              inquiry.urgency === '보통' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {inquiry.urgency}
                            </span>
                            <svg className="w-4 h-4 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">최근 문의가 없습니다.</p>
                )}
              </div>
            </div>
          </div>


        </div>
      </main>
    </div>
  )
}