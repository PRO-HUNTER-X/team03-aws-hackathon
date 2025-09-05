# 백엔드 Sprint 1 Tasks (Python Lambda)

## 우선순위 1: 핵심 Lambda 함수 구현

### Task 1.1: Python Lambda 프로젝트 설정
- [ ] 프로젝트 구조 생성 (handlers/, services/, utils/)
- [ ] requirements.txt 작성 (boto3, uuid, datetime)
- [ ] 공통 유틸리티 함수 (response.py, validation.py)
- [ ] 환경변수 설정

### Task 1.2: DynamoDB 서비스 연동
- [ ] services/dynamodb_service.py 구현
- [ ] 테이블 스키마 정의 (Companies, Inquiries, AIResponses)
- [ ] CRUD 연산 함수 작성

### Task 1.3: 핵심 Lambda 함수 구현
```python
# 구현할 Lambda 함수들
handlers/create_inquiry.py     # POST /api/inquiries
handlers/get_inquiry.py        # GET /api/inquiries/{id}
handlers/list_inquiries.py     # GET /api/inquiries
handlers/update_status.py      # PUT /api/inquiries/{id}/status
handlers/escalate_inquiry.py   # POST /api/inquiries/{id}/escalate
```

### Task 1.4: AWS Bedrock 연동
- [ ] services/ai_service.py 구현
- [ ] Claude 3.5 Sonnet 모델 연동
- [ ] 프롬프트 템플릿 작성
- [ ] 토큰 사용량 추적

## 우선순위 2: 이메일 & 보안

### Task 2.1: 이메일 서비스 구현
- [ ] services/email_service.py - AWS SES 연동
- [ ] 이메일 템플릿 (에스컬레이션, 답변 완료)
- [ ] 알림 로직 구현

### Task 2.2: 입력 검증 및 보안
- [ ] utils/validation.py - 입력 데이터 검증
- [ ] 에러 핸들링 및 로깅
- [ ] 보안 헤더 설정

## 예상 소요 시간
- Task 1.1-1.2: 2시간
- Task 1.3: 4시간  
- Task 1.4: 5시간
- Task 2.1-2.2: 2시간

## 완료 기준
- 모든 Lambda 함수 개별 테스트 통과
- AI 응답 생성 3초 이내 완료
- DynamoDB 연동 및 에러 핸들링 구현
