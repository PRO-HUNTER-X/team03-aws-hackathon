# QnA Data 테이블 및 API 구현

## 📋 작업 개요
FAQ 및 QnA 학습 데이터를 저장하고 관리하는 qna-data 테이블과 관련 API 구현

## 🎯 요구사항

### 테이블 스키마 (기존 확장)
```typescript
interface QnAData {
  id: string;                  // QnA 고유 ID
  companyId?: string;          // 회사 ID (회사별 맞춤 QnA)
  question: string;            // 질문
  answer: string;              // 답변
  category: string;            // 카테고리
  industry?: string;           // 업종 (업종별 공통 QnA)
  tags: string[];              // 태그 배열
  isActive: boolean;           // 활성화 여부
  confidence: number;          // 신뢰도 점수 (0-1)
  usageCount: number;          // 사용 횟수
  lastUsed?: string;           // 마지막 사용 시간
  createdAt: string;           // 생성 시간
  updatedAt?: string;          // 수정 시간
}
```

### API 엔드포인트
- `GET /qna-data` - 모든 QnA 조회
- `GET /qna-data/:id` - 특정 QnA 조회
- `GET /qna-data/company/:companyId` - 회사별 QnA 조회
- `GET /qna-data/category/:category` - 카테고리별 QnA 조회
- `GET /qna-data/search?q=keyword` - QnA 검색
- `POST /qna-data` - 새 QnA 생성
- `PUT /qna-data/:id` - QnA 수정
- `DELETE /qna-data/:id` - QnA 삭제

## 🔧 구현 단계

### 1. 기존 setup 서비스 확장
- QnAData 인터페이스 확장
- 새로운 필드 추가

### 2. 고급 기능 구현
- 검색 기능 (키워드 매칭)
- 카테고리별 필터링
- 회사별/업종별 필터링

### 3. 샘플 데이터 확장
- 업종별 공통 QnA
- 회사별 맞춤 QnA
- 다양한 카테고리 포함

## 📊 예상 샘플 데이터
```typescript
const sampleQnAData = [
  // 이커머스 공통 QnA
  {
    id: "qna_001",
    industry: "이커머스",
    question: "배송비는 얼마인가요?",
    answer: "5만원 이상 구매시 무료배송이며, 미만시 3,000원입니다.",
    category: "배송",
    tags: ["배송비", "무료배송"],
    confidence: 0.95,
    usageCount: 150
  },
  // 회사별 맞춤 QnA
  {
    id: "qna_002", 
    companyId: "hunters-company",
    question: "헌터스몰 적립금은 언제 지급되나요?",
    answer: "구매 확정 후 7일 이내에 자동 지급됩니다.",
    category: "적립금",
    tags: ["적립금", "지급시기"],
    confidence: 0.98,
    usageCount: 89
  }
];
```

## ✅ 완료 조건
- [ ] QnAData 인터페이스 확장
- [ ] 검색 기능 구현
- [ ] 카테고리/회사별 필터링
- [ ] 확장된 샘플 데이터
- [ ] API 테스트 완료

## 🔗 연관 작업
- companies 테이블과 연동
- cs-inquiries 테이블과 연동
- 인사이트 분석에 활용
