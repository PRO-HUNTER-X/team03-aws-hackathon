# 프론트엔드 개발 컨텍스트

## 기술 스택
- **프레임워크**: React 18 + Next.js 14
- **스타일링**: Tailwind CSS + shadcn/ui
- **상태관리**: Zustand
- **폼 관리**: React Hook Form + Zod
- **HTTP 클라이언트**: Axios

## 핵심 페이지 구성

### 1. 고객용 문의 페이지 (`/inquiry`)
- 문의 폼 (카테고리, 제목, 내용, 긴급도)
- AI 응답 표시
- 만족도 평가 (1-5점)
- 인간 상담 요청 버튼

### 2. 회사 관리자 대시보드 (`/dashboard`)
- 문의 현황 통계
- 실시간 문의 목록
- AI 응답 품질 분석
- 설정 관리 (FAQ, 회사 정보)

### 3. 상태 추적 페이지 (`/status/:inquiryId`)
- 문의 처리 진행 상황
- 예상 응답 시간
- 히스토리 타임라인

## UI/UX 원칙
- **간편성**: 3클릭 이내 문의 완료
- **반응성**: 모바일 우선 반응형 디자인
- **접근성**: WCAG 2.1 AA 준수
- **로딩**: 스켈레톤 UI로 체감 속도 개선

## 컴포넌트 구조
```
components/
├── ui/ (shadcn/ui 기본 컴포넌트)
├── forms/
│   ├── InquiryForm.tsx
│   └── FeedbackForm.tsx
├── dashboard/
│   ├── StatsCard.tsx
│   └── InquiryList.tsx
└── common/
    ├── Header.tsx
    └── StatusBadge.tsx
```

## 상태 관리
- 전역: 사용자 인증, 회사 설정
- 로컬: 폼 데이터, UI 상태

## 현재 진행 상황
- [ ] Next.js 프로젝트 초기 설정
- [ ] 디자인 시스템 구축
- [ ] 문의 폼 컴포넌트 개발
- [ ] API 연동 설정
- [ ] 대시보드 레이아웃 구성
