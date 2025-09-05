'use client'

import { useState } from 'react'
import { AIResponse } from '@/components/ai-response'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoPage() {
  const [currentDemo, setCurrentDemo] = useState<'loading' | 'response' | 'none'>('none')
  const [demoResponse, setDemoResponse] = useState<string>('')

  const mockResponses = {
    technical: `## 기술 문의 답변

**로그인 문제**에 대한 답변을 드립니다.

### 해결 방법
1. 먼저 브라우저 캐시를 삭제해보세요
2. 다른 브라우저에서 시도해보세요  
3. 네트워크 연결을 확인해주세요

### 추가 도움
위 방법으로 해결되지 않으면 **사람과 연결하기**를 클릭해주세요.

### 코드 예시
\`\`\`javascript
// 캐시 삭제 방법
localStorage.clear();
sessionStorage.clear();
\`\`\`

> **참고**: 대부분의 로그인 문제는 캐시 삭제로 해결됩니다.`,

    billing: `## 결제 문의 답변

**요금제 변경**에 대해 안내드립니다.

### 요금제 정보
- **기본**: 월 29,000원 (AI 응답 무제한)
- **프로**: 월 59,000원 (AI + 실시간 상담)
- **엔터프라이즈**: 월 99,000원 (맞춤 설정)

### 변경 방법
1. 설정 → 요금제 메뉴 접속
2. 원하는 요금제 선택
3. 결제 정보 확인 후 변경

더 자세한 내용은 담당자와 상담하시기 바랍니다.`,

    general: `## 일반 문의 답변

**서비스 이용 방법**에 대해 답변드립니다.

### 서비스 안내
저희 CS 챗봇 플랫폼은 다음과 같은 기능을 제공합니다:

- ✅ 24시간 AI 자동 응답
- ✅ 실시간 상담 연결  
- ✅ 문의 이력 관리
- ✅ 다양한 채널 지원

### 시작하기
1. **회원가입** → 기본 정보 입력
2. **회사 설정** → FAQ 및 정책 등록
3. **채널 연결** → 웹사이트/앱 연동
4. **테스트** → 실제 문의 테스트

추가 궁금한 점이 있으시면 언제든 문의해주세요!`
  }

  const startDemo = (type: 'loading' | keyof typeof mockResponses) => {
    if (type === 'loading') {
      setCurrentDemo('loading')
      setDemoResponse('')
    } else {
      setCurrentDemo('loading')
      setDemoResponse('')
      
      // 3초 후 응답 표시
      setTimeout(() => {
        setDemoResponse(mockResponses[type])
        setCurrentDemo('response')
      }, 3000)
    }
  }

  const handleEscalation = () => {
    alert('데모: 담당자 연결 요청이 전송되었습니다!')
  }

  const handleRating = (rating: number) => {
    alert(`데모: ${rating}점 평가가 저장되었습니다!`)
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI 응답 컴포넌트 데모</h1>
        <p className="text-muted-foreground">
          다양한 AI 응답 시나리오를 테스트해볼 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>데모 시나리오</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => startDemo('loading')} 
              className="w-full"
              variant="outline"
            >
              로딩 상태만 보기
            </Button>
            <Button 
              onClick={() => startDemo('technical')} 
              className="w-full"
              variant="outline"
            >
              기술 문의 응답
            </Button>
            <Button 
              onClick={() => startDemo('billing')} 
              className="w-full"
              variant="outline"
            >
              결제 문의 응답
            </Button>
            <Button 
              onClick={() => startDemo('general')} 
              className="w-full"
              variant="outline"
            >
              일반 문의 응답
            </Button>
            <Button 
              onClick={() => setCurrentDemo('none')} 
              className="w-full"
              variant="destructive"
            >
              초기화
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>기능 설명</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• <strong>로딩 애니메이션</strong>: 3가지 스타일의 로딩 표시</li>
              <li>• <strong>타이핑 효과</strong>: 실시간으로 텍스트가 나타남</li>
              <li>• <strong>마크다운 지원</strong>: 제목, 목록, 코드 블록 등</li>
              <li>• <strong>별점 평가</strong>: 1-5점 만족도 평가</li>
              <li>• <strong>에스컬레이션</strong>: 사람과 연결 기능</li>
              <li>• <strong>반응형 디자인</strong>: 모바일/데스크톱 대응</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* AI 응답 표시 영역 */}
      {currentDemo !== 'none' && (
        <AIResponse
          response={demoResponse}
          isLoading={currentDemo === 'loading'}
          onEscalate={handleEscalation}
          onRating={handleRating}
        />
      )}
    </div>
  )
}