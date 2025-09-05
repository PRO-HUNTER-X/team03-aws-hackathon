# AWS 인프라 아키텍처

## 전체 아키텍처 다이어그램
```
[Frontend]     [API Gateway]     [Lambda Functions]     [DynamoDB]
   Next.js  →  REST API Endpoints  →  Python Functions  →  NoSQL Tables
      ↓              ↓                      ↓                   ↓
[CloudFront]   [WAF + Rate Limit]    [AWS Bedrock]      [Backup/Restore]
```

## AWS 서비스 구성

### 1. 컴퓨팅 계층
- **AWS Lambda**: 서버리스 백엔드 함수
  - Runtime: Python 3.11
  - Memory: 512MB
  - Timeout: 30초
  - 동시 실행: 100개

### 2. API 계층  
- **API Gateway**: REST API 엔드포인트
  - Rate Limiting: 1000 req/hour per API key
  - CORS 설정
  - JWT 인증 연동

### 3. 데이터 계층
- **DynamoDB**: NoSQL 데이터베이스
  - On-demand 빌링
  - Point-in-time recovery 활성화
  - Global Secondary Index 사용

### 4. AI 서비스
- **AWS Bedrock**: Claude 3.5 Sonnet 모델
  - 토큰 사용량 모니터링
  - 응답 캐싱 최적화

### 5. 프론트엔드 배포
- **S3**: 정적 웹사이트 호스팅
- **CloudFront**: CDN 및 캐싱
- **Route 53**: 도메인 관리

### 6. 보안 및 모니터링
- **AWS WAF**: 웹 애플리케이션 방화벽
- **CloudWatch**: 로그 및 메트릭 모니터링
- **AWS Cognito**: 사용자 인증 관리

## 네트워크 구성
- **VPC**: 기본 VPC 사용 (서버리스 환경)
- **보안 그룹**: Lambda 함수용 최소 권한
- **IAM 역할**: 서비스별 세분화된 권한

## 비용 최적화
- **Lambda**: 요청 기반 과금
- **DynamoDB**: On-demand 모드
- **S3**: Intelligent Tiering
- **CloudFront**: 캐싱으로 오리진 요청 최소화

## 현재 배포 상태
- [ ] CDK 스택 초기 설정
- [ ] Lambda 함수 배포
- [ ] DynamoDB 테이블 생성
- [ ] API Gateway 설정
- [ ] S3 + CloudFront 설정
- [ ] 도메인 및 SSL 인증서
