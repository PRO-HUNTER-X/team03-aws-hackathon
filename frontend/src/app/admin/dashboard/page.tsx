'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Clock, CheckCircle, Star } from 'lucide-react'
import api from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get<{ stats: DashboardStats }>('/admin/dashboard')
      setStats(response.data.stats)
    } catch (error) {
      console.error('통계 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!stats) {
    return <div className="text-center py-8">데이터를 불러올 수 없습니다.</div>
  }

  const statCards = [
    {
      name: '전체 문의',
      value: stats.total_inquiries,
      icon: MessageSquare,
      color: 'bg-blue-500',
      filter: 'all'
    },
    {
      name: '대기 중',
      value: stats.pending_count,
      icon: Clock,
      color: 'bg-yellow-500',
      filter: 'pending'
    },
    {
      name: '처리 중',
      value: stats.in_progress_count,
      icon: MessageSquare,
      color: 'bg-orange-500',
      filter: 'in_progress'
    },
    {
      name: '완료',
      value: stats.completed_count,
      icon: CheckCircle,
      color: 'bg-green-500',
      filter: 'completed'
    }
  ]

  const handleCardClick = (filter: string) => {
    if (filter === 'all') {
      router.push('/admin/inquiries')
    } else {
      router.push(`/admin/inquiries?status=${filter}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">
          CS 문의 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon
          return (
            <div 
              key={item.name} 
              className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleCardClick(item.filter)}
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`${item.color} rounded-md p-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 만족도 점수 */}
      <div 
        className="bg-white shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => router.push('/admin/satisfaction')}
      >
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="bg-purple-500 rounded-md p-3">
                <Star className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-5">
              <h3 className="text-lg font-medium text-gray-900">평균 만족도</h3>
              <div className="flex items-center mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {stats.avg_satisfaction.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500 ml-1">/ 5.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 처리율 차트 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">처리 현황</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">완료율</span>
              <span className="text-sm font-medium">
                {stats.total_inquiries > 0 
                  ? Math.round((stats.completed_count / stats.total_inquiries) * 100)
                  : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: stats.total_inquiries > 0 
                    ? `${(stats.completed_count / stats.total_inquiries) * 100}%`
                    : '0%'
                }}
              />
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}