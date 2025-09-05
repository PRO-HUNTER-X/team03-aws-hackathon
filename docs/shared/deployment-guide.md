# 배포 가이드

## AWS 리소스 구성
- **Compute**: AWS Lambda (서버리스 백엔드)
- **Frontend**: S3 + CloudFront (정적 호스팅)
- **Database**: RDS PostgreSQL
- **AI**: AWS Bedrock (Claude 3.5 Sonnet)
- **Auth**: AWS Cognito
- **Monitoring**: CloudWatch

## 환경 변수
```bash
# Backend
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-jwt-secret
AWS_BEDROCK_REGION=us-east-1
CORS_ORIGIN=https://your-frontend-domain.com

# Frontend  
REACT_APP_API_URL=https://your-api-gateway-url
REACT_APP_AWS_REGION=us-east-1
```

## 배포 순서
1. Infrastructure (CDK 스택 배포)
2. Database 마이그레이션
3. Backend API 배포
4. Frontend 빌드 & 배포

## 모니터링 대시보드
- API 응답 시간
- AI 모델 사용량 및 비용
- 문의 처리 현황
- 에러율 및 알림
