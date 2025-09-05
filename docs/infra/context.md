# 인프라 개발 컨텍스트

## 아키텍처 개요
- **IaC**: AWS CDK (TypeScript)
- **배포**: GitHub Actions CI/CD
- **환경**: dev, staging, prod 분리
- **모니터링**: CloudWatch + AWS X-Ray

## AWS 서비스 구성

### 1. Compute & API
```
API Gateway → Lambda Functions
├── inquiry-handler (문의 처리)
├── ai-response-generator (AI 응답)
├── status-tracker (상태 조회)
└── analytics-processor (분석)
```

### 2. Storage & Database
- **RDS PostgreSQL**: 메인 데이터베이스 (Multi-AZ)
- **S3**: 정적 파일, 로그 저장
- **ElastiCache Redis**: 세션, 캐싱

### 3. AI & ML
- **AWS Bedrock**: Claude 3.5 Sonnet 모델
- **SageMaker**: 향후 커스텀 모델 학습용

### 4. Security & Auth
- **AWS Cognito**: 사용자 인증
- **WAF**: API 보호
- **Secrets Manager**: 민감 정보 관리

## 비용 최적화 전략
- Lambda 콜드 스타트 최소화 (Provisioned Concurrency)
- RDS 인스턴스 크기 자동 조정
- S3 Intelligent Tiering
- Bedrock 토큰 사용량 모니터링

## 보안 설정
- VPC 내 RDS 배치
- Lambda 보안 그룹 최소 권한
- API Gateway 요청 검증
- CloudTrail 감사 로깅

## 모니터링 & 알림
```
CloudWatch Alarms:
- API 에러율 > 5%
- Lambda 실행 시간 > 10초  
- RDS CPU > 80%
- Bedrock 비용 > $100/day
```

## 배포 파이프라인
1. **dev**: PR 생성 시 자동 배포
2. **staging**: main 브랜치 머지 시 배포
3. **prod**: 수동 승인 후 배포

## 현재 진행 상황
- [ ] CDK 프로젝트 초기화
- [ ] VPC 및 네트워크 설정
- [ ] RDS 인스턴스 생성
- [ ] Lambda 함수 배포 설정
- [ ] CI/CD 파이프라인 구축
