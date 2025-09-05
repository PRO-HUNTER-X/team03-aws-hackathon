# 백엔드 Sprint 1 Tasks

## 우선순위 1: 핵심 API 구현

### Task 1.1: 프로젝트 초기 설정
- [ ] Node.js + Express 프로젝트 생성
- [ ] Prisma ORM 설정 및 스키마 정의
- [ ] 환경변수 설정 (.env.example 포함)
- [ ] ESLint, Prettier 설정

### Task 1.2: 데이터베이스 연결
- [ ] PostgreSQL 연결 설정
- [ ] Prisma 마이그레이션 실행
- [ ] 시드 데이터 생성 (샘플 회사, FAQ)

### Task 1.3: 문의 관리 API
```javascript
// 구현할 엔드포인트
POST /api/inquiries - 문의 접수
GET /api/inquiries/:id - 문의 조회  
PUT /api/inquiries/:id/status - 상태 업데이트
POST /api/inquiries/:id/escalate - 에스컬레이션
```

### Task 1.4: AWS Bedrock 연동
- [ ] AWS SDK 설정
- [ ] Claude 3.5 Sonnet 모델 연동
- [ ] 프롬프트 템플릿 작성
- [ ] 토큰 사용량 추적

## 우선순위 2: 인증 및 보안

### Task 2.1: JWT 인증 구현
- [ ] JWT 토큰 생성/검증 미들웨어
- [ ] API Key 기반 회사 인증
- [ ] Rate limiting 설정

### Task 2.2: 입력 검증
- [ ] Joi/Zod 스키마 검증
- [ ] XSS, SQL Injection 방지
- [ ] 파일 업로드 보안 (향후 확장용)

## 예상 소요 시간
- Task 1.1-1.2: 4시간
- Task 1.3: 6시간  
- Task 1.4: 8시간
- Task 2.1-2.2: 4시간

## 완료 기준
- 모든 API 엔드포인트 Postman 테스트 통과
- AI 응답 생성 3초 이내 완료
- 에러 핸들링 및 로깅 구현
