'use client'

import { useState } from 'react'

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
    { question: '', answer: '', category: '일반 문의' }
  ])
  const [loading, setLoading] = useState(false)

  const categories = [
    '배송 문의',
    '결제 문의', 
    '상품 문의',
    '기술 지원',
    '기타 문의'
  ]

  const addQnAItem = () => {
    setQnaList([...qnaList, { question: '', answer: '', category: '일반 문의' }])
  }

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
            초기 QnA 설정
          </h1>
          <p className="text-gray-600">
            고객 문의에 대한 기본 답변을 설정해주세요.
          </p>
        </div>

        <div className="space-y-6">
          {qnaList.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">QnA #{index + 1}</h3>
                {qnaList.length > 1 && (
                  <button
                    onClick={() => removeQnAItem(index)}
                    className="px-3 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    카테고리
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={item.category}
                    onChange={(e) => updateQnAItem(index, 'category', e.target.value)}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    질문
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="자주 묻는 질문을 입력하세요"
                    value={item.question}
                    onChange={(e) => updateQnAItem(index, 'question', e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    답변
                  </label>
                  <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="질문에 대한 답변을 입력하세요"
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
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              + QnA 추가
            </button>
          </div>

          <div className="flex justify-center pt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '설정 중...' : 'QnA 설정 완료'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}