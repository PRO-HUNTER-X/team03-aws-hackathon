# CS 챗봇 관리자 인증 백엔드

## 🚀 빠른 시작

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env

# 개발 서버 실행
npm run start:dev

# 테스트 실행
npm test
```

### 📋 API 엔드포인트

#### 로그인
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**응답 (성공)**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

**응답 (실패)**
```json
{
  "statusCode": 401,
  "message": "인증에 실패했습니다"
}
```

### 🧪 테스트

```bash
# 전체 테스트
npm test

# 테스트 커버리지
npm run test:cov

# 테스트 감시 모드
npm run test:watch
```

### 🔧 개발 가이드

- **TDD 방식**: 테스트 작성 → 구현 → 리팩토링
- **JWT 토큰**: 1시간 유효기간
- **기본 포트**: 3001
- **CORS**: 프론트엔드(3000) 허용

### 📁 프로젝트 구조

```
src/
├── auth/
│   ├── dto/
│   │   └── login.dto.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── auth.controller.spec.ts
├── app.module.ts
└── main.ts
```