# CS 챗봇 플랫폼 API 명세서

## 📋 개요
- **Base URL**: `https://api.cs-chatbot.com` (배포 후)
- **Content-Type**: `application/json`
- **인증**: Bearer Token (추후 구현)

## 🔗 API 엔드포인트

### 1. 문의 생성 (Create Inquiry)
**POST** `/api/inquiries`

**Request Body:**
```json
{
  "companyId": "company-123",
  "customerEmail": "customer@example.com",
  "category": "technical",
  "title": "로그인 문제",
  "content": "로그인이 안됩니다",
  "urgency": "medium"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inquiryId": "uuid-generated-id",
    "aiResponse": "로그인 문제 해결 방법을 안내드리겠습니다...",
    "estimatedResponseTime": 15,
    "status": "ai_responded"
  }
}
```

---

### 2. 문의 조회 (Get Inquiry)
**GET** `/api/inquiries/{id}`

**Path Parameters:**
- `id`: 문의 ID (string, required)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "inquiry-id",
    "companyId": "company-123",
    "customerEmail": "customer@example.com",
    "title": "로그인 문제",
    "content": "로그인이 안됩니다",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z",
    "estimatedResponseTime": 15
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": "Inquiry not found"
}
```

---

### 3. 문의 목록 조회 (List Inquiries)
**GET** `/api/inquiries`

**Query Parameters:**
- `companyId`: 회사 ID (string, required)
- `status`: 상태 필터 (string, optional) - `pending`, `ai_responded`, `escalated`, `resolved`
- `limit`: 조회 개수 (number, optional, default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inquiries": [
      {
        "id": "inquiry-1",
        "title": "첫 번째 문의",
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### 4. 문의 상태 업데이트 (Update Status)
**PUT** `/api/inquiries/{id}/status`

**Path Parameters:**
- `id`: 문의 ID (string, required)

**Request Body:**
```json
{
  "status": "resolved",
  "humanResponse": "문제가 해결되었습니다."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "inquiry-id",
    "status": "resolved",
    "humanResponse": "문제가 해결되었습니다.",
    "updatedAt": "2024-01-01T00:00:00Z",
    "resolvedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 5. 문의 에스컬레이션 (Escalate Inquiry)
**POST** `/api/inquiries/{id}/escalate`

**Path Parameters:**
- `id`: 문의 ID (string, required)

**Request Body:**
```json
{
  "reason": "고객이 AI 응답에 만족하지 않음"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "inquiryId": "inquiry-id",
    "status": "escalated",
    "reason": "고객이 AI 응답에 만족하지 않음",
    "emailSent": true,
    "estimatedResponseTime": 120
  }
}
```

## 📊 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | 성공 |
| 400 | 잘못된 요청 (입력 검증 실패) |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

## 🔄 문의 상태 플로우

```
pending → ai_responded → escalated → resolved
    ↓           ↓            ↓
    └─────→ resolved ←──────┘
```

**상태 설명:**
- `pending`: 접수 대기
- `ai_responded`: AI 응답 완료
- `escalated`: 사람 담당자에게 전달
- `resolved`: 해결 완료

## 🧪 테스트 방법

### 1. 단위 테스트 실행
```bash
cd backend
source venv/bin/activate
python -m pytest tests/ -v
```

### 2. 개별 함수 테스트
```bash
# 문의 생성 테스트
python -c "
from src.handlers.create_inquiry import lambda_handler
import json
event = {
    'body': json.dumps({
        'companyId': 'test-company',
        'customerEmail': 'test@example.com',
        'title': '테스트 문의',
        'content': '테스트 내용'
    })
}
result = lambda_handler(event, {})
print(json.dumps(result, indent=2, ensure_ascii=False))
"
```

### 3. 모든 핸들러 테스트
```bash
python -m pytest tests/unit/handlers/ -v
```

## 🚀 배포 후 테스트

배포 완료 후 실제 API Gateway URL로 테스트:

```bash
# 문의 생성
curl -X POST https://your-api-gateway-url/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test-company",
    "customerEmail": "test@example.com",
    "title": "API 테스트",
    "content": "API가 잘 작동하는지 테스트합니다"
  }'

# 문의 조회
curl https://your-api-gateway-url/api/inquiries/inquiry-id

# 문의 목록
curl "https://your-api-gateway-url/api/inquiries?companyId=test-company&limit=10"
```

## 📝 참고사항

- 모든 API는 CORS가 활성화되어 있습니다
- AI 응답 생성은 AWS Bedrock Claude 3.5 Sonnet을 사용합니다
- 에러 발생 시 기본 응답(Fallback)이 제공됩니다
- 모든 데이터는 DynamoDB에 저장됩니다
- 이메일 알림은 AWS SES를 통해 발송됩니다