# 데이터베이스 스키마

## DynamoDB 테이블

### inquiries
**용도**: 고객 문의 데이터 저장

| 속성 | 타입 | 키 | 설명 |
|------|------|-----|------|
| inquiry_id | String | PK | UUID 형태의 문의 ID |
| company_id | String | GSI-PK | 회사 식별자 |
| customer_email | String | - | 고객 이메일 |
| message | String | - | 문의 내용 |
| ai_response | String | - | AI 생성 응답 |
| status | String | - | pending/resolved/escalated |
| category | String | - | 문의 카테고리 |
| created_at | String | GSI-SK | ISO 8601 타임스탬프 |
| updated_at | String | - | 마지막 수정 시간 |

**인덱스**:
- GSI: `company_id-created_at-index` (회사별 문의 조회용)

### companies
**용도**: 회사 정보 및 설정

| 속성 | 타입 | 키 | 설명 |
|------|------|-----|------|
| company_id | String | PK | 회사 식별자 |
| company_name | String | - | 회사명 |
| settings | Map | - | AI 응답 설정 |
| subscription_tier | String | - | 구독 등급 |
| created_at | String | - | 가입일 |

### ai_responses
**용도**: AI 응답 학습 데이터

| 속성 | 타입 | 키 | 설명 |
|------|------|-----|------|
| response_id | String | PK | 응답 ID |
| inquiry_id | String | - | 원본 문의 ID |
| company_id | String | GSI-PK | 회사 식별자 |
| ai_response | String | - | AI 생성 응답 |
| human_feedback | String | - | 인간 피드백 |
| quality_score | Number | - | 응답 품질 점수 |
| created_at | String | GSI-SK | 생성 시간 |
