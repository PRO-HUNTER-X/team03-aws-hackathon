'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle, MessageCircle, User, Bot } from 'lucide-react'
import Link from 'next/link'

export default function StatusDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null)

  const demoScenarios = [
    {
      id: 'pending',
      title: '대기중 상태',
      description: '문의가 접수되어 처리를 기다리는 상태',
      inquiryId: 'INQ-PENDING-001',
      status: 'pending' as const,
      timeRemaining: 180,
      badge: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, label: '대기중' }
    },
    {
      id: 'processing',
      title: '처리중 상태',
      description: '담당자가 문의를 검토하고 있는 상태',
      inquiryId: 'INQ-PROCESSING-002',
      status: 'processing' as const,
      timeRemaining: 45,
      badge: { color: 'bg-blue-100 text-blue-800', icon: <AlertCircle className="w-4 h-4" />, label: '처리중' }
    },
    {
      id: 'completed',
      title: '완료 상태',
      description: '답변이 완료된 상태',
      inquiryId: 'INQ-COMPLETED-003',
      status: 'completed' as const,
      timeRemaining: 0,
      badge: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: '완료' }
    }
  ]

  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return '완료됨'
    
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `약 ${hours}시간 ${mins}분 후 답변 예정`
    }
    return `약 ${mins}분 후 답변 예정`
  }

  const getProgressPercentage = (timeRemaining: number, totalTime: number = 240) => {
    return Math.max(10, 100 - (timeRemaining / totalTime * 100))
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">상태 추적 페이지 데모</h1>
        <p className="text-muted-foreground">
          다양한 문의 상태와 카운트다운 타이머를 테스트해볼 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">데모 시나리오</h2>
          <div className="space-y-4">
            {demoScenarios.map((scenario) => (
              <Card 
                key={scenario.id} 
                className={`cursor-pointer transition-all ${
                  selectedDemo === scenario.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedDemo(scenario.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge className={scenario.badge.color}>
                      {scenario.badge.icon}
                      <span className="ml-1">{scenario.badge.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {scenario.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    문의 ID: {scenario.inquiryId}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">실제 상태 페이지 테스트</h3>
            <div className="space-y-2">
              <Link href="/status/INQ-1234567890">
                <Button variant="outline" className="w-full">
                  샘플 문의 상태 보기
                </Button>
              </Link>
              <Link href="/inquiry">
                <Button variant="outline" className="w-full">
                  새 문의 작성 후 상태 확인
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">미리보기</h2>
          {selectedDemo ? (
            <div className="space-y-4">
              {(() => {
                const scenario = demoScenarios.find(s => s.id === selectedDemo)!
                return (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>현재 상태</span>
                          <Badge className={scenario.badge.color}>
                            {scenario.badge.icon}
                            <span className="ml-1">{scenario.badge.label}</span>
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-semibold mb-2">로그인 문제 해결 요청</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          카테고리: 기술 문의
                        </p>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">예상 응답 시간</span>
                          </div>
                          <p className="text-lg font-semibold text-blue-700">
                            {formatTimeRemaining(scenario.timeRemaining)}
                          </p>
                          {scenario.timeRemaining > 0 && (
                            <div className="mt-2">
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                  style={{ 
                                    width: `${getProgressPercentage(scenario.timeRemaining)}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>처리 과정</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <div className="w-px h-8 bg-gray-200 mt-2"></div>
                            </div>
                            <div className="flex-1 pb-4">
                              <h4 className="font-medium">문의 접수</h4>
                              <p className="text-sm text-muted-foreground mb-1">
                                고객님의 문의가 접수되었습니다.
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(Date.now() - 30 * 60 * 1000).toLocaleString('ko-KR')}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <Bot className="w-4 h-4" />
                              </div>
                              {scenario.status !== 'pending' && (
                                <div className="w-px h-8 bg-gray-200 mt-2"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <h4 className="font-medium">AI 자동 응답</h4>
                              <p className="text-sm text-muted-foreground mb-1">
                                AI가 초기 답변을 제공했습니다.
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(Date.now() - 29 * 60 * 1000).toLocaleString('ko-KR')}
                              </p>
                            </div>
                          </div>

                          {scenario.status !== 'pending' && (
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                  <User className="w-4 h-4" />
                                </div>
                                {scenario.status !== 'completed' && (
                                  <div className="w-px h-8 bg-gray-200 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <h4 className="font-medium">담당자 연결</h4>
                                <p className="text-sm text-muted-foreground mb-1">
                                  전문 상담사에게 문의가 전달되었습니다.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(Date.now() - 25 * 60 * 1000).toLocaleString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          )}

                          {scenario.status === 'completed' ? (
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="flex-1 pb-4">
                                <h4 className="font-medium text-green-700">답변 완료</h4>
                                <p className="text-sm text-muted-foreground mb-1">
                                  담당자가 상세한 답변을 제공했습니다.
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(Date.now() - 5 * 60 * 1000).toLocaleString('ko-KR')}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-4 opacity-50">
                              <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              </div>
                              <div className="flex-1 pb-4">
                                <h4 className="font-medium text-gray-500">답변 완료</h4>
                                <p className="text-sm text-gray-400">
                                  담당자가 상세한 답변을 제공할 예정입니다.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="text-center">
                      <Link href={`/status/${scenario.inquiryId}`}>
                        <Button>실제 상태 페이지에서 보기</Button>
                      </Link>
                    </div>
                  </>
                )
              })()}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-muted-foreground">
                  왼쪽에서 데모 시나리오를 선택해주세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}