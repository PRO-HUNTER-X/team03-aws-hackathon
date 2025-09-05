# 백엔드 개발 컨텍스트

## 아키텍처
- **패턴**: 서버리스 마이크로서비스
- **프레임워크**: Node.js + Express (Lambda 런타임)
- **ORM**: Prisma (PostgreSQL)
- **인증**: JWT + AWS Cognito

## 핵심 서비스 모듈

### 1. AI Response Service
- AWS Bedrock Claude 3.5 Sonnet 연동
- 프롬프트 엔지니어링: 회사 컨텍스트 + FAQ 기반 응답 생성
- 토큰 사용량 최적화

### 2. Inquiry Management Service  
- 문의 접수/조회/상태 업데이트
- 에스컬레이션 로직
- 이메일 알림 (SES 연동)

### 3. Analytics Service
- 문의 패턴 분석
- AI 응답 품질 측정
- 비용 추적

## 보안 요구사항
- API Rate Limiting (1000 req/hour per company)
- 입력 데이터 검증 및 sanitization
- 회사별 데이터 격리
- PII 데이터 암호화

## 성능 목표
- API 응답 시간: < 500ms
- AI 응답 생성: < 3초
- 동시 처리: 100 req/sec

## 현재 진행 상황
- [ ] 프로젝트 초기 설정
- [ ] 데이터베이스 연결 설정
- [ ] AWS Bedrock 연동
- [ ] 기본 CRUD API 구현
- [ ] 인증 미들웨어 구현
