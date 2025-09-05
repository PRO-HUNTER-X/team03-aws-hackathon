# CS 챗봇 플랫폼 API 명세

## 🌐 Base URL
```
https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod
```

## 📋 API 엔드포인트

## 🔐 인증 API

### 1. 관리자 로그인
```http
POST /auth/login
Content-Type: application/json
```

**요청 바디:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**응답 예시:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "email": "admin@example.com",
    "name": "관리자",
    "role": "admin"
  }
}
```

### 2. 토큰 검증
```http
POST /auth/verify
Authorization: Bearer {token}
```

**응답 예시:**
```json
{
  "valid": true,
  "user": {
    "email": "admin@example.com",
    "name": "관리자",
    "role": "admin"
  }
}
```

### 3. 고객 로그인
```http
POST /auth/customer/login
Content-Type: application/json
```

**요청 바디:**
```json
{
  "email": "customer@example.com",
  "password": "customer_password"
}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "user": {
      "email": "customer@example.com",
      "role": "customer"
    }
  }
}
```

## 👥 관리자 API

### 4. 관리자 문의 목록 조회
```http
GET /admin/inquiries?status=pending
Authorization: Bearer {admin_token}
```

**쿼리 파라미터:**
- `status` (선택): 문의 상태 필터 (pending, in_progress, completed)

**응답 예시:**
```json
{
  "inquiries": [
    {
      "id": "1",
      "title": "결제 문제 문의",
      "content": "결제가 안 되는데 도와주세요",
      "category": "payment",
      "urgency": "high",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z",
      "ai_response": "결제 문제는 다음과 같은 방법으로 해결할 수 있습니다...",
      "satisfaction_score": null
    }
  ],
  "total": 1
}
```

### 5. 관리자 문의 상세 조회
```http
GET /admin/inquiries/{inquiry_id}
Authorization: Bearer {admin_token}
```

**응답 예시:**
```json
{
  "inquiry": {
    "id": "1",
    "title": "결제 문제 문의",
    "content": "결제가 안 되는데 도와주세요",
    "category": "payment",
    "urgency": "high",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "ai_response": "결제 문제는 다음과 같은 방법으로 해결할 수 있습니다...",
    "satisfaction_score": null
  }
}
```

### 6. 문의 상태 변경
```http
PUT /admin/inquiries/{inquiry_id}/status
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**요청 바디:**
```json
{
  "status": "in_progress"
}
```

**응답 예시:**
```json
{
  "message": "상태가 업데이트되었습니다",
  "inquiry": {
    "id": "1",
    "status": "in_progress",
    "title": "결제 문제 문의"
  }
}
```

### 7. 관리자 대시보드 통계
```http
GET /admin/dashboard
Authorization: Bearer {admin_token}
```

**응답 예시:**
```json
{
  "stats": {
    "total_inquiries": 10,
    "pending_count": 3,
    "in_progress_count": 4,
    "completed_count": 3,
    "avg_satisfaction": 4.2
  }
}
```

## 👤 고객 API

### 8. 고객 문의 목록 조회
```http
GET /customer/inquiries?email=customer@example.com
```

**쿼리 파라미터:**
- `email` (필수): 고객 이메일

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "inquiries": [
      {
        "inquiry_id": "uuid-string",
        "title": "로그인 문제",
        "content": "로그인이 안됩니다",
        "category": "technical",
        "status": "pending",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

## 📝 기본 API

### 9. 헬스체크
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

#### 1. 관리자 로그인
```bash
curl -X POST "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### 2. 고객 로그인
```bash
curl -X POST "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/auth/customer/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "customer_password"
  }'
```

#### 3. 관리자 문의 목록 조회
```bash
curl -X GET "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/admin/inquiries" \
  -H "Authorization: Bearer {admin_token}"
```

#### 4. 문의 상태 변경
```bash
curl -X PUT "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/admin/inquiries/1/status" \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

#### 5. 고객 문의 목록 조회
```bash
curl -X GET "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/customer/inquiries?email=customer@example.com"
```

#### 6. 헬스체크
```bash
curl -X GET "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/"
```

#### 7. 문의 생성
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

#### 8. 문의 목록 조회
```bash
curl -X GET "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/api/inquiries?companyId=test123"
```

#### 9. AI 응답 생성
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

## 🔐 인증 및 권한

### 관리자 인증
- 관리자 API는 JWT 토큰 인증이 필요합니다
- `Authorization: Bearer {token}` 헤더를 포함해야 합니다
- 토큰 만료 시간: 24시간

### 고객 인증
- 고객은 문의 작성 시 사용한 이메일/비밀번호로 로그인
- 간단한 세션 기반 인증 사용

## 📝 참고사항

- 모든 API는 CORS가 활성화되어 있습니다
- 날짜/시간은 ISO 8601 형식 (UTC)으로 반환됩니다
- 문의 ID는 UUID v4 형식입니다
- AI 응답 생성은 AWS Bedrock Claude 3.5를 사용합니다
- 관리자 기본 계정: `admin@example.com` / `admin123`

## 📊 API 엔드포인트 요약

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| POST | `/auth/login` | 관리자 로그인 | 없음 |
| POST | `/auth/verify` | 토큰 검증 | Bearer |
| POST | `/auth/customer/login` | 고객 로그인 | 없음 |
| GET | `/admin/inquiries` | 관리자 문의 목록 | Bearer |
| GET | `/admin/inquiries/{id}` | 관리자 문의 상세 | Bearer |
| PUT | `/admin/inquiries/{id}/status` | 문의 상태 변경 | Bearer |
| GET | `/admin/dashboard` | 대시보드 통계 | Bearer |
| GET | `/customer/inquiries` | 고객 문의 목록 | 없음 |
| GET | `/` | 헬스체크 | 없음 |
| POST | `/api/inquiries` | 문의 생성 | 없음 |
| GET | `/api/inquiries` | 문의 목록 | 없음 |
| GET | `/api/inquiries/{id}` | 문의 상세 | 없음 |
| POST | `/api/ai-response` | AI 응답 생성 | 없음 |