'use client'

import { useEffect, useState } from 'react'
import { Star, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { DashboardStats } from '@/lib/types'

export default function SatisfactionAnalysis() {
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

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고객 만족도 종합 분석</h1>
          <p className="text-sm text-gray-600">상세한 만족도 데이터와 개선 방안을 확인하세요</p>
        </div>
      </div>

      {/* 전체 개요 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Star className="h-10 w-10 text-yellow-400 fill-current" />
            <span className="text-4xl font-bold text-gray-900">
              {stats.avg_satisfaction.toFixed(1)}
            </span>
            <span className="text-xl text-gray-500">/ 5.0</span>
          </div>
          <p className="text-lg font-medium text-gray-700">
            {stats.avg_satisfaction >= 4.5 ? '매우 우수' : 
             stats.avg_satisfaction >= 4.0 ? '우수' :
             stats.avg_satisfaction >= 3.5 ? '양호' :
             stats.avg_satisfaction >= 3.0 ? '보통' : '개선 필요'}
          </p>
          <p className="text-sm text-gray-500 mt-1">NPS: +{Math.round((stats.avg_satisfaction - 3) * 25)}</p>
        </div>
        
        <div className="text-center bg-green-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {Math.round((stats.completed_count / stats.total_inquiries) * 100)}%
          </div>
          <p className="text-lg font-medium text-gray-700">해결률</p>
          <p className="text-sm text-gray-500 mt-1">{stats.completed_count}/{stats.total_inquiries} 건 해결</p>
        </div>
        
        <div className="text-center bg-blue-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-2">2.3시간</div>
          <p className="text-lg font-medium text-gray-700">평균 응답시간</p>
          <p className="text-sm text-gray-500 mt-1">전주 대비 -15%</p>
        </div>
      </div>

      {/* 만족도 분포 & 카테고리별 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">만족도 분포</h4>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = rating === 4 ? 60 : rating === 5 ? 30 : rating === 3 ? 10 : 0
              const count = Math.round((percentage / 100) * stats.total_inquiries)
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-20">
                    <span className="text-sm font-medium text-gray-700">{rating}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        rating >= 4 ? 'bg-green-400' : rating === 3 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16">{count}건 ({percentage}%)</span>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">카테고리별 만족도</h4>
          <div className="space-y-3">
            {[
              { name: '기술 지원', score: 4.2, color: 'bg-blue-400' },
              { name: '결제 문의', score: 3.8, color: 'bg-orange-400' },
              { name: '일반 문의', score: 4.1, color: 'bg-green-400' }
            ].map((category) => (
              <div key={category.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 w-24">{category.name}</span>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${category.color}`}
                    style={{ width: `${(category.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-900 w-8">{category.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 액션 아이템 */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">이번 주 액션 아이템</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-medium text-gray-900 mb-2">즉시 실행</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 결제 문의 FAQ 업데이트</li>
              <li>• AI 응답 템플릿 개선</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-medium text-gray-900 mb-2">이번 달 목표</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 만족도 4.3점 달성</li>
              <li>• 응답시간 2시간 단축</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h5 className="font-medium text-gray-900 mb-2">장기 계획</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 전담 팀 신설 검토</li>
              <li>• 고객 여정 분석 도구 도입</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}