'use client'

import { useState, useEffect } from 'react'
import { AuthService, Company } from '@/lib/auth'
import CompanyInsights from './CompanyInsights'

interface QnAItem {
  question: string
  answer: string
  category: string
}

interface QnASetupProps {
  onSetupComplete: () => void
}

export default function QnASetup({ onSetupComplete }: QnASetupProps) {
  const [qnaList, setQnaList] = useState<QnAItem[]>([
    { 
      question: '배송은 언제 시작되나요?', 
      answer: '주문 완료 후 1-2일 내에 배송이 시작됩니다. 배송 현황은 마이페이지에서 확인하실 수 있습니다.', 
      category: '배송 문의' 
    }
  ])
  const [loading, setLoading] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<Company | null>(null)

  const categories = [
    '배송 문의',
    '결제 문의', 
    '상품 문의',
    '교환/환불',
    '기술 지원',
    '회원 관리',
    '기타 문의'
  ]

  const addQnAItem = () => {
    setQnaList([...qnaList, { question: '', answer: '', category: '배송 문의' }])
  }

  useEffect(() => {
    const loadCompanyInfo = async () => {
      const companyId = AuthService.getCompanyId()
      if (companyId) {
        try {
          const routeInfo = await AuthService.getInitialRoute(companyId)
          setCompanyInfo(routeInfo.data.companyInfo)
        } catch (error) {
          console.error('회사 정보 로드 실패:', error)
        }
      }
    }
    loadCompanyInfo()
  }, [])

  const removeQnAItem = (index: number) => {
    if (qnaList.length > 1) {
      setQnaList(qnaList.filter((_, i) => i !== index))
    }
  }

  const updateQnAItem = (index: number, field: keyof QnAItem, value: string) => {
    const updated = qnaList.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    )
    setQnaList(updated)
  }

  const handleSubmit = async () => {
    const validItems = qnaList.filter(item => 
      item.question.trim() && item.answer.trim()
    )

    if (validItems.length === 0) {
      alert('최소 1개의 QnA를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/setup/qna', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qnaList: validItems }),
      })

      if (response.ok) {
        onSetupComplete()
      } else {
        throw new Error('QnA 설정에 실패했습니다')
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'QnA 설정에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 CS 챗봇 초기 설정
          </h1>
          <p className="text-gray-600 mb-4">
            고객 문의에 대한 기본 답변을 설정해주세요.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">💡 설정 가이드</p>
            <p>• 자주 받는 문의를 미리 등록하면 AI가 더 정확한 답변을 제공합니다</p>
            <p>• 나중에 대시보드에서 언제든 수정할 수 있습니다</p>
          </div>
        </div>

        {/* 회사 맞춤 인사이트 */}
        {companyInfo && (
          <CompanyInsights 
            company={companyInfo} 
            qnaCount={qnaList.filter(item => item.question.trim() && item.answer.trim()).length}
          />
        )}

        <div className="space-y-6">
          {qnaList.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  📝 QnA #{index + 1}
                </h3>
                {qnaList.length > 1 && (
                  <button
                    onClick={() => removeQnAItem(index)}
                    className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                  >
                    🗑️ 삭제
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    📂 카테고리
                  </label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={item.category}
                    onChange={(e) => updateQnAItem(index, 'category', e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    ❓ 질문
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 배송은 언제 시작되나요?"
                    value={item.question}
                    onChange={(e) => updateQnAItem(index, 'question', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    💬 답변
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: 주문 완료 후 1-2일 내에 배송이 시작됩니다. 배송 현황은 마이페이지에서 확인하실 수 있습니다."
                    rows={4}
                    value={item.answer}
                    onChange={(e) => updateQnAItem(index, 'answer', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              onClick={addQnAItem}
              className="px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              ➕ QnA 추가하기
            </button>
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? '⏳ 설정 중...' : '🚀 QnA 설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}