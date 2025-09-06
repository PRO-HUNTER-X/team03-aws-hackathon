# Admin 로그인 후 FnQ 데이터 확인 라우팅

## 📋 작업 개요
관리자 로그인 후 해당 회사의 FnQ 데이터 존재 여부를 확인하고 적절한 화면으로 라우팅하는 로직 구현

## 🎯 요구사항

### 라우팅 로직
1. **Admin 로그인 성공** → JWT 토큰에 companyId 포함
2. **FnQ 데이터 확인** → DB에서 해당 회사의 qna-data 조회
3. **조건부 라우팅**:
   - FnQ 데이터 있음 → 대시보드로 이동
   - FnQ 데이터 없음 → 초기 설정 화면으로 이동

### API 엔드포인트
```typescript
// 로그인 후 초기 라우팅 정보 제공
GET /auth/initial-route
Response: {
  hasQnAData: boolean;
  companyInfo: Company;
  redirectTo: '/dashboard' | '/setup';
  qnaCount: number;
}
```

## 🔧 구현 단계

### 1. JWT 토큰 확장
```typescript
interface JWTPayload {
  userId: string;
  username: string;
  companyId: string;  // 추가
  role: string;
}
```

### 2. Auth 서비스 확장
- 로그인 시 companyId 포함
- 초기 라우팅 정보 제공 메서드

### 3. 라우팅 로직 구현
```typescript
async getInitialRoute(companyId: string) {
  const company = await this.companyService.getCompanyById(companyId);
  const qnaData = await this.setupService.getQnADataByCompany(companyId);
  
  return {
    hasQnAData: qnaData.length > 0,
    companyInfo: company,
    redirectTo: qnaData.length > 0 ? '/dashboard' : '/setup',
    qnaCount: qnaData.length
  };
}
```

### 4. 프론트엔드 연동
- 로그인 성공 후 initial-route API 호출
- 응답에 따른 자동 리다이렉트

## 📊 예상 응답 데이터
```typescript
// FnQ 데이터가 있는 경우
{
  hasQnAData: true,
  companyInfo: {
    companyId: "hunters-company",
    companyName: "헌터스 쇼핑몰",
    industry: "이커머스"
  },
  redirectTo: "/dashboard",
  qnaCount: 25
}

// FnQ 데이터가 없는 경우  
{
  hasQnAData: false,
  companyInfo: {
    companyId: "new-company",
    companyName: "신규 회사",
    industry: "SaaS"
  },
  redirectTo: "/setup",
  qnaCount: 0
}
```

## ✅ 완료 조건
- [ ] JWT 토큰에 companyId 추가
- [ ] initial-route API 구현
- [ ] 회사별 QnA 데이터 조회 로직
- [ ] Auth 가드에서 companyId 검증
- [ ] API 테스트 완료

## 🔗 연관 작업
- companies 테이블 연동
- qna-data 테이블 연동
- 프론트엔드 라우팅 연동
