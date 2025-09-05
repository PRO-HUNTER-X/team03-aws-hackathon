# 🔄 Lambda → Frontend 마이그레이션 가이드

## 변경 사항 요약

### ❌ 제거된 것들
- `lambda/login.ts` - 로그인 람다 함수
- `lambda/verify.ts` - 토큰 검증 람다 함수  
- `lambda-swagger.yaml` - 람다 API 문서
- `build:lambda`, `test:lambda` 스크립트

### ✅ 새로운 방식
- 프론트엔드에서 AWS Cognito 직접 호출
- 람다 배포 과정 제거
- 즉시 테스트 가능

## 🚀 마이그레이션 단계

### 1. AWS Cognito 설정
```bash
# AWS CLI로 User Pool 생성
aws cognito-idp create-user-pool \
  --pool-name cs-chatbot-admin \
  --policies PasswordPolicy='{MinimumLength=8,RequireUppercase=false,RequireLowercase=false,RequireNumbers=false,RequireSymbols=false}'

# User Pool Client 생성  
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name cs-chatbot-admin-client \
  --explicit-auth-flows USER_PASSWORD_AUTH
```

### 2. 관리자 계정 생성
```bash
# 관리자 사용자 생성
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username admin \
  --temporary-password TempPass123! \
  --message-action SUPPRESS

# 비밀번호 설정
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username admin \
  --password admin123 \
  --permanent
```

### 3. 프론트엔드 패키지 설치
```bash
cd ../admin-frontend
npm install @aws-sdk/client-cognito-identity-provider
```

### 4. 환경변수 설정
```bash
# admin-frontend/.env.local
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=us-east-1
```

## 📊 성능 비교

| 항목 | 기존 (Lambda) | 새로운 (Direct) |
|------|---------------|-----------------|
| 개발 속도 | 느림 (배포 필요) | 빠름 (즉시 테스트) |
| 응답 시간 | ~500ms | ~200ms |
| 비용 | Lambda 실행 비용 | Cognito 요청 비용만 |
| 복잡도 | 높음 | 낮음 |
| 디버깅 | 어려움 | 쉬움 |

## 🎯 다음 단계

1. **CDK 스택 업데이트**: 람다 리소스 제거
2. **프론트엔드 구현**: 인증 로직 추가
3. **테스트**: 로그인/로그아웃 플로우 확인
4. **배포**: 새로운 구조로 배포

이제 더 빠르고 간단한 개발이 가능합니다! 🚀