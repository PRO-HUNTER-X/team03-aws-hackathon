# CS 챗봇 관리자 프론트엔드

## 🚀 빠른 시작

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3002)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 
npm start
```

## 📋 기능

### 🔐 로그인 화면
- 관리자 인증 (username: admin, password: admin123)
- JWT 토큰 발급 및 저장

### 📊 대시보드
- 현재 토큰 정보 표시
- 토큰 검증 기능
- API 엔드포인트 테스트 정보
- 로그아웃 기능

## 🔗 API 연동

### 백엔드 API (포트 3001)
- `POST /auth/login` - 로그인
- `POST /auth/verify` - 토큰 검증

### 환경변수
- `NEXT_PUBLIC_API_URL`: 백엔드 API URL (기본값: http://localhost:3001)

## 🛠️ 기술 스택
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks**

## 📱 접속 정보
- **프론트엔드**: http://localhost:3002
- **백엔드 API**: http://localhost:3001