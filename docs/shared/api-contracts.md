# API 명세서

## 인증
- JWT 토큰 기반 인증
- 회사별 API Key 발급

## 핵심 엔드포인트

### 1. 문의 접수 API
```
POST /api/inquiries
Content-Type: application/json

{
  "companyId": "string",
  "customerEmail": "string", 
  "category": "string",
  "title": "string",
  "content": "string",
  "urgency": "low|medium|high"
}

Response:
{
  "inquiryId": "string",
  "aiResponse": "string",
  "estimatedResponseTime": "number (minutes)",
  "status": "ai_responded|escalated|resolved"
}
```

### 2. AI 응답 생성 API
```
POST /api/ai/generate-response
{
  "inquiryId": "string",
  "companyContext": "string",
  "faqData": "array"
}
```

### 3. 인간 에스컬레이션 API
```
POST /api/inquiries/{id}/escalate
{
  "reason": "string",
  "additionalInfo": "string"
}
```

### 4. 상태 조회 API
```
GET /api/inquiries/{id}/status
Response:
{
  "status": "string",
  "estimatedTime": "number",
  "lastUpdate": "datetime"
}
```

## 에러 코드
- 400: 잘못된 요청
- 401: 인증 실패
- 403: 권한 없음
- 429: 요청 한도 초과
- 500: 서버 오류
