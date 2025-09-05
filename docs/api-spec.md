# CS 챗봇 플랫폼 API 명세

## 🌐 Base URL
```
https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod
```

## 📋 API 엔드포인트

### 1. 헬스체크
```http
GET /
```
**응답 예시:**
```json
{
  "status": "healthy",
  "service": "CS Chatbot API",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. 문의 생성
```http
POST /api/inquiries
Content-Type: application/json
```

**요청 바디:**
```json
{
  "companyId": "company123",
  "customerEmail": "user@example.com",
  "title": "로그인 문제",
  "content": "로그인이 안됩니다",
  "category": "technical",
  "urgency": "high"
}
```

**필수 필드:**
- `companyId` (string): 회사 ID
- `customerEmail` (string): 고객 이메일
- `title` (string): 문의 제목
- `content` (string): 문의 내용

**선택 필드:**
- `category` (string): 카테고리 (기본값: "general")
- `urgency` (string): 긴급도 (기본값: "medium")

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "inquiryId": "uuid-string",
    "status": "pending",
    "estimatedResponseTime": 15,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. 문의 목록 조회
```http
GET /api/inquiries?companyId=company123&status=pending&limit=10
```

**쿼리 파라미터:**
- `companyId` (필수): 회사 ID
- `status` (선택): 문의 상태 필터
- `limit` (선택): 결과 개수 제한 (기본값: 50)

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "inquiries": [
      {
        "inquiry_id": "uuid-string",
        "companyId": "company123",
        "customerEmail": "user@example.com",
        "title": "로그인 문제",
        "content": "로그인이 안됩니다",
        "category": "technical",
        "urgency": "high",
        "status": "pending",
        "created_at": "2024-01-15T10:30:00.000Z",
        "estimatedResponseTime": 15
      }
    ],
    "count": 1
  }
}
```

### 4. 특정 문의 조회
```http
GET /api/inquiries/{inquiry_id}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "inquiry_id": "uuid-string",
    "companyId": "company123",
    "customerEmail": "user@example.com",
    "title": "로그인 문제",
    "content": "로그인이 안됩니다",
    "category": "technical",
    "urgency": "high",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00.000Z",
    "estimatedResponseTime": 15
  }
}
```

### 5. AI 응답 생성
```http
POST /api/ai-response
Content-Type: application/json
```

**요청 바디:**
```json
{
  "title": "로그인 문제",
  "content": "로그인이 안됩니다",
  "category": "technical"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "aiResponse": "로그인 문제를 해결해드리겠습니다...",
    "responseTime": 3,
    "confidence": 0.85
  }
}
```

## 🧪 테스트 예시

### cURL 명령어

#### 1. 헬스체크
```bash
curl -X GET "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/"
```

#### 2. 문의 생성
```bash
curl -X POST "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/api/inquiries" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test123",
    "customerEmail": "test@example.com",
    "title": "테스트 문의",
    "content": "API 테스트입니다",
    "category": "technical",
    "urgency": "medium"
  }'
```

#### 3. 문의 목록 조회
```bash
curl -X GET "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/api/inquiries?companyId=test123"
```

#### 4. AI 응답 생성
```bash
curl -X POST "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/api/ai-response" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "로그인 문제",
    "content": "로그인이 안됩니다",
    "category": "technical"
  }'
```

## ❌ 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

**HTTP 상태 코드:**
- `400`: 잘못된 요청 (필수 필드 누락, 유효성 검사 실패)
- `404`: 리소스를 찾을 수 없음
- `405`: 허용되지 않는 HTTP 메서드
- `500`: 서버 내부 오류

## 📝 참고사항

- 모든 API는 CORS가 활성화되어 있습니다
- 날짜/시간은 ISO 8601 형식 (UTC)으로 반환됩니다
- 문의 ID는 UUID v4 형식입니다
- AI 응답 생성은 AWS Bedrock Claude 3.5를 사용합니다