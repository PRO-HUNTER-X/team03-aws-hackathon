# 3개 테이블 기반 인사이트 분석 API

## 📋 작업 개요
companies + cs-inquiries + qna-data 테이블을 활용한 고급 인사이트 분석 API 구현

## 🎯 분석 카테고리

### 1. 🏢 회사별 맞춤 분석
```typescript
GET /insights/company-analysis/:companyId
Response: {
  industryPattern: {
    category: string;
    percentage: number;
    recommendation: string;
  }[];
  benchmarking: {
    metric: string;
    companyValue: number;
    industryAverage: number;
    ranking: string; // "상위 5%", "평균", "하위 10%" 등
  }[];
}
```

### 2. 🤖 AI 최적화 분석
```typescript
GET /insights/ai-optimization/:companyId
Response: {
  categoryAccuracy: {
    category: string;
    aiAccuracy: number;
    recommendation: string;
    needsHumanIntervention: boolean;
  }[];
  learningOpportunities: {
    category: string;
    missingQnA: number;
    suggestedQuestions: string[];
  }[];
}
```

### 3. 📊 비즈니스 임팩트 분석
```typescript
GET /insights/business-impact/:companyId
Response: {
  riskAnalysis: {
    category: string;
    riskLevel: 'low' | 'medium' | 'high';
    potentialLoss: number; // 시간당 예상 손실
    impactDescription: string;
  }[];
  predictions: {
    period: string; // "주말", "연말" 등
    expectedIncrease: number; // 증가율 %
    category: string;
    preparation: string;
  }[];
}
```

### 4. 🎯 실행 가능한 조치
```typescript
GET /insights/actionable-recommendations/:companyId
Response: {
  immediateActions: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    estimatedSavings: number;
    implementation: string;
  }[];
  longTermStrategies: {
    strategy: string;
    timeline: string;
    expectedROI: number;
    requirements: string[];
  }[];
}
```

## 🔧 구현 단계

### 1. 기존 insights 서비스 확장
- 현재 insights.service.ts 개선
- 3개 테이블 조인 로직 구현

### 2. 분석 알고리즘 구현
```typescript
class InsightsAnalyzer {
  // 업종별 패턴 분석
  analyzeIndustryPatterns(company: Company, inquiries: CSInquiry[]): IndustryPattern[]
  
  // 벤치마킹 계산
  calculateBenchmarking(company: Company, allCompanies: Company[], inquiries: CSInquiry[]): Benchmarking[]
  
  // AI 정확도 계산
  calculateAIAccuracy(category: string, qnaData: QnAData[]): number
  
  // 비즈니스 임팩트 계산
  calculateBusinessImpact(company: Company, inquiries: CSInquiry[]): BusinessImpact[]
}
```

### 3. 샘플 분석 결과
```typescript
// 이커머스 회사 분석 예시
{
  industryPattern: [
    {
      category: "배송",
      percentage: 70,
      recommendation: "물류 최적화 필요 - 배송 추적 API 개선 권장"
    },
    {
      category: "결제", 
      percentage: 20,
      recommendation: "결제 시스템 안정성 점검 필요"
    }
  ],
  benchmarking: [
    {
      metric: "문의처리속도",
      companyValue: 2.5, // 시간
      industryAverage: 5.0,
      ranking: "상위 5%"
    }
  ]
}
```

## ✅ 완료 조건
- [ ] InsightsAnalyzer 클래스 구현
- [ ] 4개 분석 API 엔드포인트 구현
- [ ] 3개 테이블 조인 쿼리 최적화
- [ ] 샘플 분석 결과 생성
- [ ] API 테스트 완료

## 🔗 연관 작업
- companies 테이블 데이터 활용
- cs-inquiries 테이블 데이터 활용  
- qna-data 테이블 데이터 활용
- 프론트엔드 대시보드 연동
