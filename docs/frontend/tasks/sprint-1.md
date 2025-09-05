# 프론트엔드 Sprint 1 Tasks

## 우선순위 1: 핵심 UI 구현

### Task 1.1: 프로젝트 초기 설정
- [ ] Next.js 14 프로젝트 생성
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] 폴더 구조 및 라우팅 설정
- [ ] TypeScript 설정

### Task 1.2: 디자인 시스템 구축
- [ ] 컬러 팔레트 및 타이포그래피 정의
- [ ] 공통 컴포넌트 (Button, Input, Card 등)
- [ ] 반응형 레이아웃 컴포넌트
- [ ] 로딩 스켈레톤 UI

### Task 1.3: 문의 폼 페이지 (`/inquiry`)
```tsx
// 구현할 컴포넌트
<InquiryForm>
  <CategorySelect /> // 문의 유형 선택
  <TitleInput />     // 문의 제목
  <ContentTextarea /> // 문의 내용  
  <UrgencySelect />  // 긴급도
  <SubmitButton />   // 제출 버튼
</InquiryForm>

<AIResponseDisplay>
  <ResponseText />   // AI 응답 내용
  <FeedbackButtons /> // 만족도 평가
  <EscalateButton /> // 인간 상담 요청
</AIResponseDisplay>
```

### Task 1.4: 상태 추적 페이지 (`/status/[id]`)
- [ ] 문의 상태 표시 (대기중/처리중/완료)
- [ ] 예상 응답 시간 카운트다운
- [ ] 진행 상황 타임라인 UI

## 우선순위 2: 관리자 대시보드

### Task 2.1: 대시보드 레이아웃
- [ ] 사이드바 네비게이션
- [ ] 통계 카드 컴포넌트
- [ ] 문의 목록 테이블
- [ ] 필터링 및 검색 기능

### Task 2.2: API 연동
- [ ] Axios 설정 및 API 클라이언트
- [ ] React Query/SWR 데이터 페칭
- [ ] 에러 바운더리 및 에러 처리
- [ ] 로딩 상태 관리

## 예상 소요 시간
- Task 1.1-1.2: 4시간
- Task 1.3: 8시간
- Task 1.4: 4시간
- Task 2.1-2.2: 6시간

## 완료 기준
- 모든 페이지 모바일/데스크톱 반응형 완료
- API 연동 및 실시간 데이터 표시
- 접근성 기본 요구사항 충족 (키보드 네비게이션, 스크린 리더)
