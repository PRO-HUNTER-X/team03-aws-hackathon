# CS 챗봇 백엔드 - AWS Lambda 아키텍처

## 개요
FastAPI에서 AWS Lambda로 마이그레이션된 서버리스 백엔드 시스템

## Lambda 함수 구조

### 1. create_inquiry.py
- **경로**: `POST /inquiries`
- **기능**: 새로운 문의 생성 및 AI 응답 생성
- **입력**: 문의 데이터 (제목, 내용, 카테고리 등)
- **출력**: 문의 ID, AI 응답, 예상 응답 시간

### 2. get_inquiry.py  
- **경로**: `GET /inquiries/{id}`
- **기능**: 문의 상세 조회
- **입력**: 문의 ID (path parameter)
- **출력**: 문의 상세 정보

### 3. auth.py
- **경로**: 
  - `POST /auth/login` - 로그인
  - `POST /auth/verify` - 토큰 검증
- **기능**: JWT 기반 인증 처리
- **입력**: 이메일, 비밀번호 또는 JWT 토큰
- **출력**: JWT 토큰 또는 검증 결과

### 4. admin.py
- **경로**: 
  - `GET /admin/inquiries` - 문의 목록 조회
  - `GET /admin/inquiries/{id}` - 문의 상세 조회
  - `PUT /admin/inquiries/{id}/status` - 상태 변경
  - `GET /admin/dashboard` - 대시보드 통계
- **기능**: 관리자 전용 기능
- **인증**: @admin_required 데코레이터 적용

### 5. update_status.py
- **경로**: `PUT /inquiries/{id}/status`
- **기능**: 문의 상태 업데이트
- **입력**: 문의 ID, 새로운 상태
- **출력**: 업데이트 결과

## 공통 기능

### CORS 헤더
모든 Lambda 함수에 CORS 헤더 자동 추가:
```python
headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

### 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "message": "사용자 친화적 메시지"
  }
}
```

### 성공 응답 형식
```json
{
  "success": true,
  "data": { ... }
}
```

## 배포 방법

### 1. 의존성 설치
```bash
pip install -r requirements.txt
```

### 2. 자동 배포 (권장)
```bash
python deploy.py
```

### 3. 수동 배포
각 Lambda 함수별로 패키징 후 AWS Console에서 업로드

## 환경 변수
Lambda 함수에서 사용하는 환경 변수:
- `JWT_SECRET`: JWT 토큰 서명용 시크릿
- `DYNAMODB_TABLE_NAME`: DynamoDB 테이블 이름
- `AWS_REGION`: AWS 리전

### Bedrock AI 모델 설정
- `BEDROCK_DEFAULT_MODEL`: 기본 모델 (claude-4-1-opus)
- `BEDROCK_FALLBACK_MODEL`: 백업 모델 (claude-4-opus)
- `BEDROCK_FAST_MODEL`: 빠른 응답 모델 (claude-4-sonnet)
- `BEDROCK_MAX_TOKENS`: 최대 토큰 수 (4096)
- `BEDROCK_TEMPERATURE`: 창의성 설정 (0.7)
- `BEDROCK_SELECTION_STRATEGY`: 모델 선택 전략 (adaptive)

## 테스트
```bash
# 단위 테스트 실행
pytest tests/

# 특정 핸들러 테스트
pytest tests/unit/handlers/test_create_inquiry.py
```

## 주요 변경사항
- ✅ FastAPI → AWS Lambda 마이그레이션 완료
- ✅ 개별 Lambda 함수로 분리
- ✅ CORS 헤더 자동 추가
- ✅ 통일된 에러 응답 형식
- ✅ 한국어 에러 메시지
- ✅ 구조화된 로깅
- ❌ FastAPI 의존성 제거

## AWS Bedrock 모델 스위칭

### 지원 모델
- `claude-4-1-opus`: 최고 품질 (복잡한 문의, 높은 우선순위)
- `claude-4-opus`: 일반 품질 (중간 복잡도 문의)
- `claude-4-sonnet`: 빠른 응답 (간단한 문의)

### 자동 선택 로직
```python
# 간단한 문의 (50자 미만) → Claude 4 Sonnet
# 복잡한 문의 (200자 이상, 키워드 포함) → Claude 4.1 Opus
# 높은 우선순위 → Claude 4.1 Opus
# 일반 문의 → Claude 4 Opus
```

### 모델 변경 방법
```bash
# infra/stacks/api_stack.py에서 환경변수 수정
BEDROCK_DEFAULT_MODEL="claude-4-1-opus"
BEDROCK_SELECTION_STRATEGY="adaptive"  # fixed, adaptive, cost_optimized

# 재배포
cd infra && ./deploy.sh api
```

### 테스트
```bash
# 간단한 문의 테스트
curl -X POST https://api-url/api/ai-response \
  -d '{"content": "안녕하세요", "urgency": "normal"}'

# 복잡한 문의 테스트  
curl -X POST https://api-url/api/ai-response \
  -d '{"content": "결제 시스템 문제 상세 분석 필요", "urgency": "high"}'
```

## 다음 단계
1. ✅ AWS CDK로 인프라 코드 작성
2. ✅ API Gateway 연동
3. ✅ DynamoDB 테이블 생성
4. ✅ CloudWatch 로그 및 메트릭 설정
5. ✅ AWS Bedrock AI 서비스 연동 (모델 스위칭 포함)