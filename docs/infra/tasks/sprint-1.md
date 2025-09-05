# 인프라 Sprint 1 Tasks

## 우선순위 1: 기본 인프라 구축

### Task 1.1: CDK 프로젝트 초기화
- [ ] AWS CDK TypeScript 프로젝트 생성
- [ ] 환경별 스택 분리 (dev/staging/prod)
- [ ] CDK 컨텍스트 및 설정 파일 작성

### Task 1.2: 네트워크 인프라
```typescript
// 구현할 CDK 스택
VpcStack:
  - VPC (2 AZ, public/private 서브넷)
  - NAT Gateway
  - Internet Gateway
  - Route Tables
  - Security Groups
```

### Task 1.3: 데이터베이스 스택
- [ ] RDS PostgreSQL 인스턴스 (t3.micro)
- [ ] 서브넷 그룹 설정
- [ ] 보안 그룹 (Lambda에서만 접근)
- [ ] 백업 및 모니터링 설정

### Task 1.4: Lambda 함수 배포
```typescript
// Lambda 함수 구성
ApiStack:
  - inquiry-handler
  - ai-response-generator  
  - status-tracker
  - analytics-processor
```

## 우선순위 2: API Gateway 및 보안

### Task 2.1: API Gateway 설정
- [ ] REST API 생성
- [ ] Lambda 프록시 통합
- [ ] CORS 설정
- [ ] API Key 및 사용량 계획

### Task 2.2: 보안 설정
- [ ] WAF 규칙 (Rate limiting, IP 화이트리스트)
- [ ] Secrets Manager (DB 자격증명)
- [ ] IAM 역할 최소 권한 설정

## 우선순위 3: 모니터링 및 배포

### Task 3.1: CloudWatch 설정
```typescript
// 모니터링 구성
MonitoringStack:
  - Lambda 함수별 로그 그룹
  - 커스텀 메트릭 (AI 토큰 사용량)
  - 알람 (에러율, 응답시간)
  - 대시보드
```

### Task 3.2: CI/CD 파이프라인
- [ ] GitHub Actions 워크플로우
- [ ] 환경별 배포 스크립트
- [ ] 롤백 전략 수립

## 예상 소요 시간
- Task 1.1-1.2: 4시간
- Task 1.3-1.4: 6시간
- Task 2.1-2.2: 4시간
- Task 3.1-3.2: 4시간

## 완료 기준
- 모든 AWS 리소스 CDK로 배포 완료
- 백엔드 API Lambda 함수 정상 동작
- 모니터링 대시보드에서 메트릭 확인 가능
- CI/CD 파이프라인으로 자동 배포 성공
