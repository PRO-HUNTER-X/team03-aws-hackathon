'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Eye, Filter } from 'lucide-react'
import api from '@/lib/api'
import type { Inquiry } from '@/lib/types'

export default function InquiriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')

  useEffect(() => {
    // URL 파라미터에서 status 읽기
    const urlStatus = searchParams.get('status')
    if (urlStatus) {
      setStatusFilter(urlStatus)
    }
  }, [searchParams])

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter, sortBy])

  const fetchInquiries = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const response = await api.get<{ inquiries: Inquiry[] }>('/admin/inquiries', { params })
      let sortedInquiries = [...response.data.inquiries]
      
      // 정렬 적용
      if (sortBy === 'satisfaction') {
        sortedInquiries.sort((a, b) => {
          const aScore = a.satisfaction_score || 0
          const bScore = b.satisfaction_score || 0
          return bScore - aScore // 높은 점수부터
        })
      } else if (sortBy === 'date') {
        sortedInquiries.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }
      
      setInquiries(sortedInquiries)
    } catch (error) {
      console.error('문의 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/inquiries/${id}/status`, { status })
      fetchInquiries() // 목록 새로고침
    } catch (error) {
      console.error('상태 변경 실패:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    }
    const labels = {
      pending: '대기중',
      in_progress: '처리중',
      completed: '완료'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    }
    const labels = {
      low: '낮음',
      medium: '보통',
      high: '높음'
    }
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[urgency as keyof typeof styles]}`}>
        {labels[urgency as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문의 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            고객 문의를 확인하고 처리하세요
          </p>
        </div>

        {/* 필터 및 정렬 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">전체</option>
              <option value="pending">대기중</option>
              <option value="in_progress">처리중</option>
              <option value="completed">완료</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="date">날짜순</option>
              <option value="satisfaction">만족도순</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <div 
                className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => router.push(`/admin/inquiries/${inquiry.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {inquiry.title}
                    </p>
                    {getStatusBadge(inquiry.status)}
                    {getUrgencyBadge(inquiry.urgency)}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span>{inquiry.category}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={inquiry.status}
                    onChange={(e) => {
                      e.stopPropagation() // 카드 클릭 이벤트 방지
                      updateStatus(inquiry.id, e.target.value)
                    }}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    onClick={(e) => e.stopPropagation()} // 카드 클릭 이벤트 방지
                  >
                    <option value="pending">대기중</option>
                    <option value="in_progress">처리중</option>
                    <option value="completed">완료</option>
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>


    </div>
  )
}