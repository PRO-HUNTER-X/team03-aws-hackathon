'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Reply {
  id: string
  content: string
  author: string
  authorName: string
  createdAt: string
  timeAgo: string
  isInternal: boolean
}

interface InquiryDetail {
  id: string
  status: string
  type: string
  title: string
  content: string
  urgency: string
  customerId: string
  customerName: string
  customerEmail: string
  createdAt: string
  updatedAt: string
  timeAgo: string
  replies: Reply[]
}

export default function InquiryDetailPage() {
  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  const router = useRouter()
  const params = useParams()
  const inquiryId = params.id as string

  const fetchInquiryDetail = async () => {
    try {
      const response = await fetch(`/api/inquiries/${inquiryId}`)
      const data = await response.json()

      if (data.success) {
        setInquiry(data.data)
      } else {
        console.error('문의 조회 실패')
      }
    } catch (error) {
      console.error('문의 상세 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    setSubmitting(true)
    try {
      // TODO: 답변 작성 API 호출
      console.log('답변 작성:', replyContent)
      setReplyContent('')
      // 답변 작성 후 다시 조회
      await fetchInquiryDetail()
    } catch (error) {
      console.error('답변 작성 실패:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      // TODO: 상태 변경 API 호출
      console.log('상태 변경:', newStatus)
      await fetchInquiryDetail()
    } catch (error) {
      console.error('상태 변경 실패:', error)
    }
  }

  useEffect(() => {
    if (inquiryId) {
      fetchInquiryDetail()
    }
  }, [inquiryId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">문의 상세 로딩 중...</div>
      </div>
    )
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">문의를 찾을 수 없습니다</h2>
          <button
            onClick={() => router.push('/inquiries')}
            className="text-blue-600 hover:text-blue-800"
          >
            ← 문의 목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">문의 상세</h1>
            <button
              onClick={() => router.push('/inquiries')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← 문의 목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 문의 정보 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {inquiry.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>문의 ID: {inquiry.id}</span>
                    <span>{inquiry.type}</span>
                    <span>{inquiry.timeAgo}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    inquiry.status === '대기' ? 'bg-yellow-100 text-yellow-800' :
                    inquiry.status === '처리중' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {inquiry.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    inquiry.urgency === '높음' ? 'bg-red-100 text-red-800' :
                    inquiry.urgency === '보통' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {inquiry.urgency}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">고객 정보</h3>
                  <div className="text-sm text-gray-600">
                    <p>이름: {inquiry.customerName}</p>
                    <p>이메일: {inquiry.customerEmail}</p>
                    <p>고객 ID: {inquiry.customerId}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">상태 변경</h3>
                  <select
                    value={inquiry.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="대기">대기</option>
                    <option value="처리중">처리중</option>
                    <option value="완료">완료</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">문의 내용</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">{inquiry.content}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 답변 히스토리 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                답변 히스토리 ({inquiry.replies?.length || 0}개)
              </h3>
            </div>
            <div className="px-6 py-4">
              {inquiry.replies && inquiry.replies.length > 0 ? (
                <div className="space-y-4">
                  {inquiry.replies?.map((reply) => (
                    <div key={reply.id} className={`border rounded-lg p-4 ${
                      reply.author === 'admin' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {reply.authorName}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            reply.author === 'admin' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {reply.author === 'admin' ? '관리자' : '고객'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{reply.timeAgo}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">아직 답변이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 답변 작성 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">답변 작성</h3>
            </div>
            <form onSubmit={handleReplySubmit} className="px-6 py-4">
              <div className="mb-4">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="고객에게 보낼 답변을 작성하세요..."
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setReplyContent('')}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '답변 작성 중...' : '답변 보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}