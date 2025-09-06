# CS Inquiries 테이블 및 API 구현

## 📋 작업 개요
고객 문의 데이터를 저장하고 관리하는 cs-inquiries 테이블과 관련 API 구현

## 🎯 요구사항

### 테이블 스키마
```typescript
interface CSInquiry {
  inquiryId: string;           // 문의 고유 ID
  companyId: string;           // 회사 ID (companies 테이블 참조)
  customerId: string;          // 고객 ID
  category: string;            // 문의 카테고리 (배송, 결제, 기술, 일반 등)
  title: string;               // 문의 제목
  content: string;             // 문의 내용
  status: 'pending' | 'in_progress' | 'resolved'; // 처리 상태
  urgency: 'low' | 'medium' | 'high';             // 긴급도
  aiResponse?: string;         // AI 응답 (있는 경우)
  humanResponse?: string;      // 인간 응답 (있는 경우)
  satisfactionScore?: number;  // 만족도 점수 (1-5)
  createdAt: string;          // 생성 시간
  updatedAt?: string;         // 수정 시간
  resolvedAt?: string;        // 해결 시간
}
```

### API 엔드포인트
- `GET /cs-inquiries` - 모든 문의 조회
- `GET /cs-inquiries/:id` - 특정 문의 조회
- `GET /cs-inquiries/company/:companyId` - 회사별 문의 조회
- `GET /cs-inquiries/stats` - 문의 통계
- `POST /cs-inquiries` - 새 문의 생성
- `PUT /cs-inquiries/:id` - 문의 수정
- `DELETE /cs-inquiries/:id` - 문의 삭제

## 🔧 구현 단계

### 1. 서비스 및 컨트롤러 생성
```bash
cd admin-backend/src
mkdir cs-inquiries
```

### 2. 인터페이스 정의
- CSInquiry 인터페이스 정의
- 요청/응답 DTO 정의

### 3. 서비스 로직 구현
- DynamoDB 연동
- CRUD 작업
- 통계 계산 로직

### 4. 컨트롤러 구현
- REST API 엔드포인트
- 입력 검증
- 에러 처리

### 5. 샘플 데이터 생성
- 테스트용 문의 데이터
- 다양한 카테고리/상태 포함

## 📊 예상 샘플 데이터
```typescript
const sampleInquiries = [
  {
    inquiryId: "inq_001",
    companyId: "hunters-company",
    customerId: "cust_001", 
    category: "배송",
    title: "배송 지연 문의",
    content: "주문한 상품이 예정일보다 3일 늦어지고 있습니다.",
    status: "pending",
    urgency: "medium",
    createdAt: "2024-09-06T10:00:00Z"
  }
];
```

## ✅ 완료 조건
- [ ] CSInquiry 인터페이스 정의
- [ ] cs-inquiries 모듈 생성
- [ ] CRUD API 구현
- [ ] 샘플 데이터 초기화
- [ ] API 테스트 완료
- [ ] app.module.ts에 모듈 등록

## 🔗 연관 작업
- companies 테이블과 연동
- qna-data 테이블과 연동 (인사이트 분석용)
