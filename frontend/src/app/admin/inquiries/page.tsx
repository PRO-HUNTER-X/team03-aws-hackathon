'use client'

import { useEffect, useState } from 'react'
import { Eye, Filter } from 'lucide-react'
import api from '@/lib/api'
import type { Inquiry } from '@/lib/types'

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)

  useEffect(() => {
    fetchInquiries()
  }, [statusFilter])

  const fetchInquiries = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {}
      const response = await api.get<{ inquiries: Inquiry[] }>('/admin/inquiries', { params })
      setInquiries(response.data.inquiries)
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
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: status as any })
      }
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

        {/* 필터 */}
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
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <div className="px-4 py-4 flex items-center justify-between">
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
                    onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pending">대기중</option>
                    <option value="in_progress">처리중</option>
                    <option value="completed">완료</option>
                  </select>
                  <button
                    onClick={() => setSelectedInquiry(inquiry)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 문의 상세 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{selectedInquiry.title}</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">문의 내용</h4>
                <p className="mt-2 text-gray-700">{selectedInquiry.content}</p>
              </div>
              
              {selectedInquiry.ai_response && (
                <div>
                  <h4 className="font-medium text-gray-900">AI 응답</h4>
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-gray-700">{selectedInquiry.ai_response}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>카테고리: {selectedInquiry.category}</span>
                <span>긴급도: {selectedInquiry.urgency}</span>
                <span>생성일: {new Date(selectedInquiry.created_at).toLocaleString()}</span>
              </div>

              {selectedInquiry.satisfaction_score && (
                <div>
                  <span className="text-sm text-gray-500">
                    만족도: {selectedInquiry.satisfaction_score}/5
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}