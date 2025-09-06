# Admin Frontend API 문서

## 📋 **API 엔드포인트 목록**

### 🔐 **인증 API**

#### POST `/api/auth/login`
관리자 로그인

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "mock.eyJ1c2VybmFtZSI6ImFkbWluIn0.signature",
  "expires_in": 3600,
  "redirect": {
    "hasQnASetup": false,
    "nextRoute": "/qna-setup",
    "message": "QnA 설정을 완료해주세요"
  }
}
```

#### POST `/api/auth/verify`
토큰 검증

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "username": "admin"
  }
}
```

---

### 📊 **대시보드 API**

#### GET `/api/dashboard/stats`
대시보드 통계 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 7,
    "status": {
      "pending": 3,
      "processing": 2,
      "completed": 2
    },
    "urgency": {
      "high": 3,
      "normal": 2,
      "low": 2
    },
    "types": {
      "기술 문의": 2,
      "결제 문의": 2,
      "일반 문의": 2,
      "기타": 1
    }
  }
}
```

#### GET `/api/dashboard/recent-inquiries`
최근 문의 목록 조회

**Query Parameters:**
- `limit` (optional): 조회할 문의 수 (기본값: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inq_006",
      "status": "대기",
      "type": "결제 문의",
      "title": "환불 요청",
      "content": "주문 취소 후 환불이 안되었습니다.",
      "urgency": "높음",
      "customerId": "customer_006",
      "timeAgo": "1시간 전"
    }
  ],
  "count": 5
}
```

#### GET `/api/dashboard/urgent-alerts`
긴급 문의 알림 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "inquiries": [
      {
        "id": "inq_006",
        "status": "대기",
        "type": "결제 문의",
        "title": "환불 요청",
        "urgency": "높음",
        "timeAgo": "1시간 전"
      }
    ]
  }
}
```

---

### 📝 **문의 관리 API**

#### GET `/api/inquiries`
문의 목록 조회 (필터링/정렬/페이징)

**Query Parameters:**
- `status` (optional): 전체, 대기, 처리중, 완료
- `urgency` (optional): 높음, 보통, 낮음
- `type` (optional): 기술 문의, 결제 문의, 일반 문의, 기타
- `search` (optional): 제목/내용/고객명 검색
- `sortBy` (optional): createdAt, urgency, status (기본값: createdAt)
- `sortOrder` (optional): asc, desc (기본값: desc)
- `page` (optional): 페이지 번호 (기본값: 1)
- `limit` (optional): 페이지당 항목 수 (기본값: 10)

**Example URLs:**
```
GET /api/inquiries?status=대기&sortBy=urgency&sortOrder=desc
GET /api/inquiries?urgency=높음&page=1&limit=5
GET /api/inquiries?search=로그인&sortBy=createdAt
GET /api/inquiries?type=기술 문의&status=대기
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "inq_006",
      "status": "대기",
      "type": "결제 문의",
      "title": "환불 요청",
      "content": "주문 취소 후 환불이 안되었습니다.",
      "urgency": "높음",
      "customerId": "customer_006",
      "customerName": "한고객",
      "customerEmail": "customer006@example.com",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z",
      "timeAgo": "1시간 전",
      "replyCount": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 7,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "filters": {
    "status": "대기",
    "urgency": null,
    "type": null,
    "search": null,
    "sortBy": "urgency",
    "sortOrder": "desc"
  }
}
```

#### GET `/api/inquiries/[id]`
문의 상세 조회

**Path Parameters:**
- `id`: 문의 ID (예: inq_001)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "inq_002",
    "status": "처리중",
    "type": "결제 문의",
    "title": "결제 오류 문의",
    "content": "결제가 완료되었는데 주문이 취소되었습니다. 카드에서는 결제가 되었다고 나오는데 주문 내역에서는 취소로 표시됩니다.",
    "urgency": "보통",
    "customerId": "customer_002",
    "customerName": "이고객",
    "customerEmail": "customer002@example.com",
    "createdAt": "2024-01-01T06:00:00Z",
    "updatedAt": "2024-01-01T09:00:00Z",
    "timeAgo": "4시간 전",
    "replies": [
      {
        "id": "reply_001",
        "content": "안녕하세요. 결제 오류 문의 주셔서 감사합니다. 확인해보니 시스템 오류로 인한 문제였습니다. 곧 해결해드리겠습니다.",
        "author": "admin",
        "authorName": "관리자",
        "createdAt": "2024-01-01T09:00:00Z",
        "timeAgo": "1시간 전",
        "isInternal": false
      }
    ]
  }
}
```

**Error Response (404):**
```json
{
  "message": "문의를 찾을 수 없습니다"
}
```

---

### ⚙️ **설정 API**

#### GET `/api/setup/status`
설정 상태 확인

**Response:**
```json
{
  "success": true,
  "data": {
    "setupComplete": false,
    "hasQnAData": false,
    "nextStep": "qna-setup",
    "message": "QnA 데이터를 설정해주세요."
  }
}
```

#### POST `/api/setup/qna`
QnA 데이터 설정

**Request Body:**
```json
{
  "qnaList": [
    {
      "category": "로그인",
      "question": "비밀번호를 잊어버렸어요",
      "answer": "비밀번호 찾기 버튼을 클릭하여 재설정하세요."
    },
    {
      "category": "결제",
      "question": "결제가 안돼요",
      "answer": "카드 정보를 다시 확인해주세요."
    }
  ]
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "QnA 데이터가 성공적으로 설정되었습니다",
  "count": 2
}
```

#### GET `/api/setup/qna`
QnA 데이터 조회

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "qna_1",
      "question": "비밀번호를 잊어버렸어요",
      "answer": "비밀번호 찾기 버튼을 클릭하여 재설정하세요.",
      "category": "로그인",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "count": 2
}
```

---

## 🧪 **테스트 방법**

### 로컬 테스트
```bash
# 개발 서버 시작
npm run dev

# API 테스트
curl http://localhost:3002/api/dashboard/stats
curl http://localhost:3002/api/inquiries?status=대기
curl http://localhost:3002/api/inquiries/inq_001
```

### 단위 테스트
```bash
# 전체 테스트
npm test

# 문의 API 테스트만
npm test -- --testPathPatterns=inquiries
```

---

## 🚀 **배포 정보**

- **플랫폼**: AWS Amplify
- **자동 배포**: `admin` 브랜치 push 시
- **API Routes**: 자동으로 Lambda 함수로 변환
- **정적 파일**: CloudFront로 배포

---

## 📋 **에러 코드**

| 상태 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 404 | 리소스 없음 |
| 500 | 서버 오류 |

---

## 🔧 **개발 참고사항**

### 데이터 저장소
- 현재는 **메모리 내 배열**로 구현
- 실제 운영시 **DynamoDB** 또는 **RDS** 연결 필요

### 인증
- 현재는 **간단한 토큰** 방식
- 실제 운영시 **JWT** 라이브러리 사용 권장

### 페이징
- 기본 페이지 크기: 10개
- 최대 페이지 크기: 100개 (제한 권장)