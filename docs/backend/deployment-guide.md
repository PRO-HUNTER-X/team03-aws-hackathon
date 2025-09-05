# 백엔드 배포 가이드

## 🚀 인프라 연동 배포

### 📋 배포 구조
```
backend/
├── src/              # 개발용 소스 코드
├── lambda/           # 배포용 Lambda 함수
├── tests/            # 테스트 코드
└── requirements.txt  # 의존성
```

### 🔗 API 엔드포인트 매핑

| 기존 핸들러 | Lambda 함수 | API 경로 |
|------------|-------------|----------|
| create_inquiry.py | inquiry_handler.py | POST /api/inquiries |
| get_inquiry.py | inquiry_handler.py | GET /api/inquiries/{id} |
| list_inquiries.py | inquiry_handler.py | GET /api/inquiries |
| AI 응답 생성 | ai_response_generator.py | POST /api/ai-response |
| Health Check | health_check.py | GET / |

### 📊 DynamoDB 스키마

**테이블**: `cs-inquiries`
- **Partition Key**: `inquiry_id` (String)
- **GSI**: `company-index` (companyId, created_at)
- **GSI**: `status-index` (status, created_at)

### 🧪 배포 전 테스트

```bash
# 로컬 테스트
cd backend
python test_api.py

# 단위 테스트
pytest tests/ -v
```

### 🚀 배포 실행

```bash
# 인프라 배포
cd infra
./deploy.sh
```

### ✅ 배포 후 확인

배포 완료 시 출력되는 API Gateway URL로 테스트:

```bash
# Health Check
curl https://your-api-gateway-url/

# 문의 생성
curl -X POST https://your-api-gateway-url/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test-company",
    "customerEmail": "test@example.com",
    "title": "테스트 문의",
    "content": "API 테스트입니다"
  }'

# AI 응답 생성
curl -X POST https://your-api-gateway-url/api/ai-response \
  -H "Content-Type: application/json" \
  -d '{
    "title": "로그인 문제",
    "content": "로그인이 안됩니다",
    "category": "technical"
  }'
```

### 🔧 환경 변수

Lambda 함수에서 사용하는 환경 변수:
- `DYNAMODB_TABLE`: DynamoDB 테이블 이름 (자동 설정)

### 📝 주의사항

1. **DynamoDB 스키마**: 기존 `id` 필드가 `inquiry_id`로 변경됨
2. **API 경로**: `/api/` 프리픽스 추가
3. **CORS**: 모든 오리진 허용으로 설정됨
4. **권한**: Lambda 실행 역할에 DynamoDB 및 Bedrock 권한 포함

### 🐛 트러블슈팅

**문제**: Lambda 함수에서 모듈을 찾을 수 없음
**해결**: `sys.path.append()` 추가됨

**문제**: DynamoDB 테이블 접근 권한 없음  
**해결**: IAM 역할에 DynamoDB 권한 자동 부여

**문제**: Bedrock 모델 접근 불가
**해결**: IAM 역할에 `bedrock:InvokeModel` 권한 추가됨