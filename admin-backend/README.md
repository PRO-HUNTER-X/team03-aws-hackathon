# Admin Backend

CS 챗봇 관리자 백엔드 서버

## 로컬 개발

1. 환경변수 설정
```bash
cp .env.example .env
# .env 파일을 실제 값으로 수정
```

2. 의존성 설치 및 실행
```bash
npm install
npm run start:dev
```

## Amplify 배포

### 환경변수 설정 (Amplify 콘솔)

다음 환경변수들을 Amplify 콘솔에서 설정해야 합니다:

```
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-password
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
COMPANY_TABLE=companies
CS_INQUIRIES_TABLE=cs-inquiries
QNA_TABLE=qna-data
```

### 빌드 설정 (amplify.yml)

```yaml
version: 1
backend:
  phases:
    build:
      commands:
        - npm ci
        - npm run build
frontend:
  phases:
    build:
      commands:
        - npm start
  artifacts:
    files:
      - '**/*'
```

## API 엔드포인트

- `GET /auth/health` - 헬스체크
- `GET /auth/initial-route?companyId=xxx` - 초기 라우팅 정보
- `GET /api-docs` - Swagger API 문서
