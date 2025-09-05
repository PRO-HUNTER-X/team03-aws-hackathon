'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Inquiry {
  id: string
  status: string
  type: string
  title: string
  content: string
  urgency: string
  customerId: string
  customerName: string
  customerEmail: string
  timeAgo: string
  replyCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

function InquiriesPageContent() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '전체',
    urgency: '',
    type: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  const searchParams = useSearchParams()
  const router = useRouter()

  const fetchInquiries = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== '전체') params.set('status', filters.status)
      if (filters.urgency) params.set('urgency', filters.urgency)
      if (filters.type) params.set('type', filters.type)
      if (filters.search) params.set('search', filters.search)
      params.set('sortBy', filters.sortBy)
      params.set('sortOrder', filters.sortOrder)
      params.set('page', page.toString())
      params.set('limit', '10')

      const response = await fetch(`/api/inquiries?${params}`)
      const data = await response.json()

      if (data.success) {
        setInquiries(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('문의 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchInquiries(1)
  }

  const handlePageChange = (page: number) => {
    fetchInquiries(page)
  }

  const handleInquiryClick = (id: string) => {
    router.push(`/inquiries/${id}`)
  }

  useEffect(() => {
    // URL 파라미터에서 초기 필터 설정
    const status = searchParams.get('status') || '전체'
    const urgency = searchParams.get('urgency') || ''
    const type = searchParams.get('type') || ''
    
    setFilters(prev => ({
      ...prev,
      status,
      urgency,
      type
    }))
    
    // 필터 설정 후 바로 데이터 조회
    const fetchWithParams = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (status !== '전체') params.set('status', status)
        if (urgency) params.set('urgency', urgency)
        if (type) params.set('type', type)
        params.set('sortBy', 'createdAt')
        params.set('sortOrder', 'desc')
        params.set('page', '1')
        params.set('limit', '10')

        const response = await fetch(`/api/inquiries?${params}`)
        const data = await response.json()

        if (data.success) {
          setInquiries(data.data)
          setPagination(data.pagination)
        }
      } catch (error) {
        console.error('문의 목록 로딩 실패:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWithParams()
  }, [searchParams])

  useEffect(() => {
    // 필터 변경시에만 조회 (URL 파라미터 변경 제외)
    if (searchParams.get('status') === null && searchParams.get('urgency') === null && searchParams.get('type') === null) {
      fetchInquiries(1)
    }
  }, [filters.status, filters.urgency, filters.type])



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">문의 목록 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">문의 관리</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← 대시보드로 돌아가기
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 필터 섹션 */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* 상태 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상태
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="전체">전체</option>
                  <option value="대기">대기</option>
                  <option value="처리중">처리중</option>
                  <option value="완료">완료</option>
                </select>
              </div>

              {/* 긴급도 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  긴급도
                </label>
                <select
                  value={filters.urgency}
                  onChange={(e) => handleFilterChange('urgency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">전체</option>
                  <option value="높음">높음</option>
                  <option value="보통">보통</option>
                  <option value="낮음">낮음</option>
                </select>
              </div>

              {/* 유형 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  유형
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">전체</option>
                  <option value="기술 문의">기술 문의</option>
                  <option value="결제 문의">결제 문의</option>
                  <option value="일반 문의">일반 문의</option>
                  <option value="기타">기타</option>
                </select>
              </div>

              {/* 정렬 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    handleFilterChange('sortBy', sortBy)
                    handleFilterChange('sortOrder', sortOrder)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="createdAt-desc">최신순</option>
                  <option value="createdAt-asc">오래된순</option>
                  <option value="urgency-desc">긴급도 높은순</option>
                  <option value="urgency-asc">긴급도 낮은순</option>
                </select>
              </div>
            </div>

            {/* 검색 */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="제목, 내용, 고객명으로 검색..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex-1 p-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                검색
              </button>
            </div>
          </div>

          {/* 문의 목록 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                문의 목록 ({pagination?.total || 0}건)
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {inquiries.length > 0 ? (
                inquiries.map((inquiry) => (
                  <div
                    key={inquiry.id}
                    onClick={() => handleInquiryClick(inquiry.id)}
                    className="p-6 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">
                            {inquiry.title}
                          </h4>
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
                        </div>
                        
                        <p className="text-gray-600 mb-2">
                          {inquiry.content.length > 100 
                            ? `${inquiry.content.substring(0, 100)}...` 
                            : inquiry.content}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{inquiry.type}</span>
                          <span>{inquiry.customerName}</span>
                          <span>{inquiry.timeAgo}</span>
                          <span>답변 {inquiry.replyCount}개</span>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  조건에 맞는 문의가 없습니다.
                </div>
              )}
            </div>

            {/* 페이징 */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    {pagination.total}개 중 {((pagination.page - 1) * pagination.limit) + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      이전
                    </button>
                    
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 border rounded-md ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">페이지 로딩 중...</div>
      </div>
    }>
      <InquiriesPageContent />
    </Suspense>
  )
}