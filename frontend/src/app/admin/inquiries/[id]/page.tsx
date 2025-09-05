'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import api from '@/lib/api'
import type { Inquiry } from '@/lib/types'

export default function InquiryDetail() {
  const router = useRouter()
  const params = useParams()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchInquiry(params.id as string)
    }
  }, [params.id])

  const fetchInquiry = async (id: string) => {
    try {
      const response = await api.get<{ inquiry: Inquiry }>(`/admin/inquiries/${id}`)
      setInquiry(response.data.inquiry)
    } catch (error) {
      console.error('문의 상세 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!inquiry) return
    
    try {
      await api.put(`/admin/inquiries/${inquiry.id}/status`, { status })
      setInquiry({ ...inquiry, status: status as any })
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[urgency as keyof typeof styles]}`}>
        {labels[urgency as keyof typeof labels]}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!inquiry) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">문의를 찾을 수 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{inquiry.title}</h1>
            <p className="text-sm text-gray-600">문의 ID: {inquiry.id}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge(inquiry.status)}
          {getUrgencyBadge(inquiry.urgency)}
        </div>
      </div>

      {/* 문의 정보 카드 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">카테고리</h3>
            <p className="text-lg text-gray-900 capitalize">{inquiry.category}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">생성일</h3>
            <p className="text-lg text-gray-900">{new Date(inquiry.created_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">문의 내용</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-900 whitespace-pre-wrap">{inquiry.content}</p>
          </div>
        </div>

        {inquiry.ai_response && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">AI 응답</h3>
            <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-400">
              <p className="text-gray-900 whitespace-pre-wrap">{inquiry.ai_response}</p>
            </div>
          </div>
        )}

        {inquiry.satisfaction_score && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">고객 만족도</h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= inquiry.satisfaction_score!
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-medium text-gray-900">
                {inquiry.satisfaction_score}/5
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 상태 변경 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">문의 상태 관리</h3>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">상태 변경:</label>
          <select
            value={inquiry.status}
            onChange={(e) => updateStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">대기중</option>
            <option value="in_progress">처리중</option>
            <option value="completed">완료</option>
          </select>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-between">
        <button
          onClick={() => router.push('/admin/inquiries')}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          문의 목록으로 돌아가기
        </button>
        
        <div className="space-x-3">
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            답변 작성
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            이메일 발송
          </button>
        </div>
      </div>
    </div>
  )
}