# 프론트엔드 개발 컨텍스트

## 기술 스택
- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS + shadcn/ui
- **상태 관리**: Zustand
- **HTTP 클라이언트**: Axios
- **폼 관리**: React Hook Form + Zod

## 프로젝트 구조
```
frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (dashboard)/       # 대시보드 레이아웃
│   │   ├── auth/             # 인증 페이지
│   │   └── layout.tsx        # 루트 레이아웃
│   ├── components/           # 재사용 컴포넌트
│   │   ├── ui/              # shadcn/ui 컴포넌트
│   │   ├── forms/           # 폼 컴포넌트
│   │   └── layout/          # 레이아웃 컴포넌트
│   ├── lib/                 # 유틸리티
│   │   ├── api.ts           # API 클라이언트
│   │   ├── auth.ts          # 인증 로직
│   │   └── utils.ts         # 공통 유틸
│   ├── stores/              # Zustand 스토어
│   │   ├── auth.ts          # 인증 상태
│   │   └── inquiries.ts     # 문의 상태
│   └── types/               # TypeScript 타입
│       ├── api.ts           # API 응답 타입
│       └── auth.ts          # 인증 타입
```

## 핵심 컴포넌트

### 1. InquiryForm
- **용도**: 고객 문의 접수 폼
- **위치**: `components/forms/InquiryForm.tsx`
- **상태**: React Hook Form + Zod 검증

### 2. InquiryList  
- **용도**: 문의 목록 표시
- **위치**: `components/InquiryList.tsx`
- **상태**: Zustand 스토어 연동

### 3. AIResponseCard
- **용도**: AI 응답 표시 카드
- **위치**: `components/AIResponseCard.tsx`
- **기능**: 응답 만족도, 에스컬레이션 버튼

## 상태 관리

### AuthStore (Zustand)
```typescript
interface AuthState {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}
```

### InquiryStore (Zustand)
```typescript
interface InquiryState {
  inquiries: Inquiry[]
  loading: boolean
  createInquiry: (data: CreateInquiryData) => Promise<void>
  fetchInquiries: () => Promise<void>
  escalateInquiry: (id: string) => Promise<void>
}
```

## 라우팅 구조
- `/` - 랜딩 페이지
- `/auth/login` - 로그인
- `/dashboard` - 대시보드 (문의 목록)
- `/dashboard/inquiries/[id]` - 문의 상세
- `/dashboard/analytics` - 분석 페이지

## 현재 구현 상태
- [ ] Next.js 프로젝트 초기 설정
- [ ] shadcn/ui 컴포넌트 설치
- [ ] 기본 레이아웃 구성
- [ ] 문의 폼 컴포넌트
- [ ] API 클라이언트 설정
- [ ] 인증 플로우 구현
