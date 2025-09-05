# 백엔드 API 명세서

## 기본 정보
- **Base URL**: `https://api.cs-chatbot.com/v1`
- **인증**: JWT Bearer Token
- **Content-Type**: `application/json`

## 엔드포인트

### 1. 문의 접수
```http
POST /inquiries
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "company_id": "string",
  "customer_email": "string", 
  "message": "string",
  "category": "string" // optional
}
```

**응답**:
```json
{
  "inquiry_id": "uuid",
  "ai_response": "string",
  "status": "pending|resolved|escalated",
  "estimated_response_time": "2024-01-01T10:00:00Z",
  "created_at": "2024-01-01T10:00:00Z"
}
```

### 2. 문의 조회
```http
GET /inquiries/{inquiry_id}
Authorization: Bearer {jwt_token}
```

### 3. 문의 목록
```http
GET /inquiries?company_id={company_id}&status={status}&limit={limit}
Authorization: Bearer {jwt_token}
```

### 4. 문의 에스컬레이션
```http
POST /inquiries/{inquiry_id}/escalate
Authorization: Bearer {jwt_token}

{
  "reason": "string"
}
```

## 에러 응답
```json
{
  "error": "string",
  "message": "string", 
  "code": "ERROR_CODE"
}
```
