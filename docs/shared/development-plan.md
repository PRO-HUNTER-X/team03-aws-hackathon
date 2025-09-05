# 24시간 개발 계획 (4명 병렬)

## 👥 개발자 스펙별 역할 분담

### 정민 - 프론트엔드 전문
### 다나 - 풀스택 (Frontend + Backend)
### 규원 - 백엔드 중심 (Backend Heavy + Frontend)
### 다혜 - 인프라 중심 (Infrastructure + Backend Support)

---

## 👨💻 정민 - 프론트엔드 전문
**예상 소요: 10-12시간**

### Phase 1 (0-6시간): 핵심 고객 UI
#### Task A1: Next.js 프로젝트 초기 설정 (2시간)
- [x] Next.js 14 프로젝트 생성 및 Static Export 설정 ✅
- [x] Tailwind CSS + shadcn/ui 설정 ✅
- [x] 기본 레이아웃 및 라우팅 구조 ✅
- [x] TypeScript 설정 ✅

#### Task A2: 고객 문의 폼 페이지 (`/inquiry`) (4시간)
```tsx
// 핵심 컴포넌트 구현
<InquiryForm>
  <CategorySelect />     // 문의 유형 (기술/결제/기타)
  <TitleInput />         // 제목 (필수)
  <ContentTextarea />    // 내용 (필수)
  <UrgencyRadio />       // 긴급도 (낮음/보통/높음)
  <SubmitButton />       // 제출
</InquiryForm>
```

### Phase 2 (6-12시간): 응답 & 상태 UI
#### Task A3: AI 응답 표시 컴포넌트 (4시간)
- [x] AI 응답 텍스트 표시 (마크다운 지원) ✅
- [x] 만족도 평가 (1-5점 별점) ✅
- [x] "사람과 연결" 에스컬레이션 버튼 ✅
- [x] 로딩 스피너 및 타이핑 애니메이션 ✅

#### Task A4: 상태 추적 페이지 (`/status/[id]`) (2시간)
- [x] 문의 처리 진행 상황 (대기중/처리중/완료) ✅
- [x] 예상 응답 시간 카운트다운 ✅
- [x] 간단한 타임라인 UI ✅

**완료 기준:**
- 모든 페이지 모바일/데스크톱 반응형 완료
- 기본 폼 검증 및 에러 처리
- 접근성 기본 요구사항 충족

---

## 👨💻 다나 - 풀스택 (Frontend + Backend)
**예상 소요: 10-12시간**

### Phase 1 (0-6시간): 관리자 프론트엔드
#### Task B1: 관리자 대시보드 레이아웃 (3시간)
- [ ] 로그인 페이지 (간단한 폼)
- [ ] 사이드바 네비게이션
- [ ] 통계 카드 컴포넌트 (문의 수, 처리율 등)
- [ ] 반응형 레이아웃

#### Task B2: 문의 관리 화면 (3시간)
- [ ] 문의 목록 테이블 (상태별 필터링)
- [ ] 문의 상세 보기 모달
- [ ] 답변 작성 폼
- [ ] 상태 변경 드롭다운

### Phase 2 (6-12시간): API 연동 & 인증
#### Task B3: 프론트엔드 API 연동 (3시간)
- [ ] Axios 설정 및 API 클라이언트
- [ ] React Query/SWR 데이터 페칭
- [ ] 에러 처리 및 로딩 상태
- [ ] 토스트 알림 시스템

#### Task B4: 간단한 인증 백엔드 (3시간)
- [ ] JWT 토큰 생성/검증 API
- [ ] 로그인/로그아웃 엔드포인트
- [ ] 인증 미들웨어 구현
- [ ] 세션 관리

**완료 기준:**
- 관리자 대시보드 완전 동작
- 프론트-백엔드 API 연동 완성
- JWT 기반 인증 시스템 동작

---

## 👨💻 규원 - 백엔드 중심 (Backend Heavy + Frontend)
**예상 소요: 10-12시간** (Python 순수 Lambda로 2시간 단축)

### Phase 1 (0-5시간): 핵심 백엔드 Lambda 함수
#### Task C1: Python Lambda 프로젝트 설정 (1시간)
- [x] 프로젝트 구조 생성 (handlers/, services/, utils/) ✅
- [x] requirements.txt 작성 (boto3, uuid, datetime) ✅
- [x] 공통 유틸리티 함수 (response.py, validation.py) ✅
- [x] 환경변수 설정 ✅

#### Task C2: 핵심 Lambda 함수 구현 (4시간)
```python
# 구현 완료된 Lambda 함수들
handlers/inquiry_handler.py    # POST/GET /api/inquiries (통합)
handlers/ai_response_generator.py  # POST /api/ai-response
handlers/health_check.py       # GET /

# 추가 구현 필요한 Lambda 함수들 (우선순위)
handlers/update_status.py      # PUT /api/inquiries/{id}/status - 관리자용
handlers/escalate_inquiry.py   # POST /api/inquiries/{id}/escalate - 고객용
```

### Phase 2 (5-12시간): AI 연동 & 고급 기능
#### Task C3: AWS Bedrock Claude 연동 (5시간)
- [x] services/ai_service.py - Bedrock 클라이언트 설정 ✅
- [x] Claude 3.5 Sonnet 모델 연동 ✅
- [x] 프롬프트 엔지니어링 (회사 컨텍스트 + FAQ) ✅
- [x] 토큰 사용량 추적 및 최적화 ✅
- [x] AI 응답 품질 점수 계산 ✅

#### Task C4: 비동기 이메일 시스템 & DynamoDB 연동 (2시간) - **아키텍처 개선**
- [ ] **services/queue_service.py** - SQS 메시지 발송 서비스
  ```python
  def send_email_message(message_type: str, data: dict):
      sqs.send_message(
          QueueUrl=os.environ['EMAIL_QUEUE_URL'],
          MessageBody=json.dumps({
              'type': message_type,
              'data': data,
              'timestamp': datetime.utcnow().isoformat()
          })
      )
  ```
- [ ] **handlers/email_processor.py** - SQS 트리거 Lambda (이메일 전용)
- [x] services/dynamodb_service.py - DB 연동 완성
- [ ] 이메일 템플릿 (에스컬레이션, 답변 완룄)
- [ ] **응답 속도 최적화** - 이메일 발송을 비동기로 처리하여 200ms 이내 응답

#### Task C5: 추가 필수 API 구현 (3시간)
- [x] **에스컬레이션 API** (POST /api/inquiries/{id}/escalate) ✅
  - [x] 문의 상태를 'escalated'로 변경
  - [x] 관리자에게 이메일 알림 발송
  - [x] 고객에게 확인 응답 반환
  - **SQS로 이메일 메시지 발송** (비동기)
  - 고객에게 즉시 확인 응답 반환 (200ms 이내)
- [x] **상태 업데이트 API** (PUT /api/inquiries/{id}/status) ✅
  - [x] 관리자가 문의 상태 변경 (pending → in_progress → resolved)
  - [x] 상태 변경 시 타임스탬프 업데이트
  - **SQS로 알림 메시지 발송** (선택적, 비동기)

**완료 기준:**
- 모든 Lambda 함수 개별 테스트 통과 (7/7 함수)
- AI 응답 생성 3초 이내 완료 ✅
- DynamoDB 연동 및 에러 핸들링 구현 ✅
- 에스컬레이션 플로우 완전 동작
- 관리자 상태 관리 기능 완성

---

## 👨💻 다혜 - 인프라 중심 (Infrastructure + Backend Support)
**예상 소요: 8-10시간**

### Phase 1 (0-4시간): AWS 인프라 구축
#### Task D1: CDK 프로젝트 초기화 (2시간)
- [x] AWS CDK Python 프로젝트 생성 ✅
- [x] 환경별 스택 분리 (dev/prod) ✅
- [x] DynamoDB 테이블 생성 ✅
- [x] IAM 역할 및 권한 설정 ✅

#### Task D2: API Gateway & Lambda 배포 (2시간)
- [x] REST API Gateway 설정 ✅
- [x] Lambda 함수 기본 구조 생성 ✅
- [x] Lambda 프록시 통합 ✅
- [x] CORS 및 기본 보안 설정 ✅

### Phase 2 (4-10시간): AI 인프라 & 배포
#### Task D3: AWS Bedrock 설정 및 모델 관리 (2시간) - **신규 추가**
- [ ] **Bedrock 모델 액세스 권한 설정**
  - Claude 4.1 Opus 모델 활성화 (기본 모델)
  - Claude 4 Opus 모델 활성화 (백업 모델)
  - Claude 4 Sonnet 모델 활성화 (빠른 응답용)
  - IAM 역할에 Bedrock 권한 추가
- [ ] **설정 파일 기반 모델 스위칭 구현**
  ```python
  # config/ai_models.py
  AI_MODEL_CONFIG = {
      "default_model": "claude-4-1-opus",
      "fallback_model": "claude-4-opus", 
      "fast_model": "claude-4-sonnet",
      "max_tokens": 4096,
      "temperature": 0.7,
      "model_selection_strategy": "adaptive"  # 요청 복잡도에 따라 자동 선택
  }
  ```
- [ ] **Lambda 환경변수로 모델 설정 주입**
  - CDK에서 환경변수 설정: `BEDROCK_DEFAULT_MODEL`, `BEDROCK_FALLBACK_MODEL`, `BEDROCK_FAST_MODEL`
  - **적응형 모델 선택 로직**:
    - 간단한 문의 → Claude 4 Sonnet (빠른 응답)
    - 복잡한 문의 → Claude 4.1 Opus (최고 품질)
    - 오류 발생 시 → Claude 4 Opus (백업)
  - 런타임 모델 변경 가능하도록 구성

#### Task D4: CI/CD 파이프라인 구축 (2시간)
- [ ] GitHub Actions 워크플로우 작성
- [ ] 환경별 배포 스크립트 (dev/prod)
- [ ] 자동 배포 설정
- [ ] 롤백 전략 수립

#### Task D5: 이메일 인프라 & 비동기 처리 (2시간) - **아키텍처 개선**
- [ ] **SQS 큐 생성** (이메일 처리용)
  ```typescript
  // CDK 구성
  const emailQueue = new sqs.Queue(this, 'EmailQueue', {
    visibilityTimeout: Duration.minutes(5),
    retentionPeriod: Duration.days(14)
  });
  ```
- [ ] **이메일 처리 Lambda 함수** (SQS 트리거)
  - 에스컬레이션 이메일 템플릿
  - 상태 변경 알림 템플릿
  - SES 발송 로직
- [ ] **비동기 이메일 발송 아키텍처**
  - API → SQS → Lambda → SES
  - 사용자 응답 지연 최소화 (200ms 이내)
- [ ] **SES 도메인 설정** (개발용 샌드박스 모드)

#### Task D6: 샘플 데이터 & 모니터링 (1시간)
- [ ] 가상 회사 3개 프로필 생성
- [ ] 각 회사별 샘플 문의 데이터 30개
- [ ] CloudWatch 기본 모니터링 설정

**완료 기준:**
- 모든 AWS 리소스 CDK로 배포 완료
- **AWS Bedrock Claude 모델 액세스 권한 설정 완료**
- **환경변수 기반 AI 모델 스위칭 시스템 구축**
- **SQS 기반 비동기 이메일 처리 시스템 구축**
- **SES 샌드박스 모드 이메일 발송 테스트 완료**
- CI/CD 파이프라인으로 자동 배포 성공
- 모니터링 대시보드에서 메트릭 확인 가능

---

## 🕐 24시간 상세 타임라인

### 0-8시간 (기반 구축)
| 시간 | 정민 | 다나 | 규원 | 다혜 |
|---|---|---|---|---|
| 0-2h | Next.js 설정 | 로그인 페이지 | Python Lambda 설정 | CDK 초기화 |
| 2-4h | 문의 폼 UI | 대시보드 레이아웃 | 핵심 Lambda 함수 | DynamoDB 설정 |
| 4-6h | 문의 폼 완성 | 문의 관리 화면 | Lambda 함수 완성 | Lambda 배포 |
| 6-8h | AI 응답 UI 시작 | API 연동 시작 | AI 서비스 연동 | Bedrock 설정 |

### 8-16시간 (핵심 기능)
| 시간 | 정민 | 다나 | 규원 | 다혜 |
|---|---|---|---|---|
| 8-10h | AI 응답 UI | React Query 설정 | Bedrock 연동 | 모델 스위칭 구현 |
| 10-12h | 상태 추적 페이지 | JWT 인증 백엔드 | 프롬프트 엔지니어링 | CI/CD 설정 |
| 12-14h | 반응형 최적화 | 인증 프론트 연동 | AI 품질 개선 | 배포 테스트 |
| 14-16h | 접근성 개선 | 에러 처리 | 이메일 알림 | 성능 최적화 |

### 16-24시간 (통합 & 배포)
| 시간 | 정민 | 다나 | 규원 | 다혜 |
|---|---|---|---|---|
| 16-18h | 프론트엔드 통합 테스트 | 관리자 기능 완성 | 에러 핸들링 | 프로덕션 배포 |
| 18-20h | UI/UX 최종 점검 | 전체 플로우 테스트 | 성능 최적화 | 모니터링 확인 |
| 20-22h | 버그 수정 | API 연동 완성 | 로깅 개선 | 보안 설정 |
| 22-24h | 최종 테스트 | 데모 준비 | 문서화 | 운영 가이드 |

---

## 🎯 24시간 후 완성될 MVP

### 동작하는 기능
1. **고객 플로우**
   - 문의 폼 작성 → AI 응답 즉시 표시
   - 불만족 시 "사람과 연결" 클릭
   - 상태 추적 페이지에서 진행 상황 확인

2. **관리자 플로우**
   - 로그인 → 대시보드에서 새 문의 확인
   - 문의 상세 보기 → 답변 작성
   - 회사 설정 → FAQ/컨텍스트 관리

3. **시스템 기능**
   - 자동 AI 응답 생성
   - 이메일 알림 발송
   - 실시간 상태 업데이트

### 기술 스택 확정
- **Frontend**: Next.js 14 (Static) + Tailwind + shadcn/ui
- **Backend**: Python 순수 Lambda 함수 + boto3
- **Database**: DynamoDB (서버리스)
- **AI**: AWS Bedrock (Claude 4.1 Opus + Claude 4 Opus + Claude 4 Sonnet) - 설정파일 기반 모델 스위칭
- **Infrastructure**: AWS CDK + API Gateway + CloudFront

---

## 🚨 리스크 관리

### 기술적 리스크
1. **AI 응답 품질**: 프롬프트 엔지니어링 시간 부족
   - **대응**: 기본 템플릿 우선 구현, 점진적 개선

2. **AWS 서비스 연동**: 권한 설정 복잡성
   - **대응**: 개발자 D가 인프라 전담, 미리 권한 설정

3. **프론트-백엔드 연동**: API 스펙 불일치
   - **대응**: API 명세서 우선 작성, 개발자 B가 연동 전담

### 일정 리스크
1. **개발 지연**: 예상보다 복잡한 구현
   - **대응**: 기능 우선순위 조정, 핵심 기능 먼저

2. **통합 이슈**: 마지막 8시간에 집중
   - **대응**: 16시간 후부터 점진적 통합 시작

---

## 📋 완료 체크리스트

### 정민 - Frontend
- [x] 문의 폼 페이지 완성 ✅
  - [x] Next.js 14 + TypeScript 설정
  - [x] shadcn/ui + Tailwind CSS 적용
  - [x] 문의 유형/제목/내용/긴급도 폼 구현
  - [x] React Hook Form + Zod 검증
- [x] AI 응답 표시 완성 ✅
  - [x] 마크다운 지원 AI 응답 컴포넌트
  - [x] 만족도 평가 (별점) 기능
  - [x] "사람과 연결" 에스컬레이션 버튼
  - [x] 로딩 스피너 및 타이핑 애니메이션
- [x] 상태 추적 페이지 기본 구조 ✅
- [x] 모바일 반응형 완성 ✅

### 다나 - Fullstack
- [ ] 관리자 대시보드 완성
- [ ] JWT 인증 시스템 완성
- [ ] API 연동 완성
- [ ] 에러 처리 완성

### 규원 - Backend
- [x] 기본 API 엔드포인트 완성 (7/7 Lambda 함수) ✅
  - [x] POST /api/inquiries (문의 생성)
  - [x] GET /api/inquiries (문의 목록 조회)
  - [x] GET /api/inquiries/{id} (특정 문의 조회)
  - [x] POST /api/ai-response (AI 응답 생성)
  - [x] GET / (헬스체크)
  - [x] **PUT /api/inquiries/{id}/status** (상태 업데이트) ✅
  - [x] **POST /api/inquiries/{id}/escalate** (에스컬레이션) ✅
- [x] AI 응답 생성 완성 (Bedrock Claude 연동)
- [x] 이메일 알림 기본 구조 완성 (로깅 기반, SES 연동 준비 완료)
- [ ] **비동기 이메일 시스템 완성** (SQS + Lambda + SES)
- [x] 에러 핸들링 완성 (Decimal 직렬화 등)

### 다혜 - Infrastructure
- [x] AWS 인프라 기본 구조 완성 ✅
  - [x] CDK Python 프로젝트 설정
  - [x] API Gateway + Lambda 스택
  - [x] DynamoDB 스택
  - [x] CloudFront + S3 프론트엔드 스택
- [x] 배포 스크립트 완성 ✅
- [ ] **AWS Bedrock 모델 설정 완성** (Claude 4.1 Opus/4 Opus/4 Sonnet 스위칭 가능)
- [ ] **설정 파일 기반 AI 모델 관리 시스템 구축**
- [ ] CI/CD 파이프라인 완성 (GitHub Actions)
- [ ] 모니터링 설정 완성 (CloudWatch)
- [ ] 샘플 데이터 투입 완성

### 전체 통합
- [x] 고객 문의 → AI 응답 플로우 동작 (기본 API 완성)
- [x] 에스컬레이션 → 이메일 알림 동작 ✅ (API 완성, 테스트 통과)
- [x] 관리자 대시보드 → 문의 관리 동작 ✅ (상태 업데이트 API 완성)
- [x] 상태 추적 → 실시간 업데이트 동작 ✅ (프론트엔드 구현 완료)

## 🚀 현재 진행 상황 (2024-01-05 업데이트)

### ✅ 완료된 작업
1. **프론트엔드-백엔드 API 연동 완료** (TDD 방식)
   - API 클라이언트 라이브러리 구현 (createInquiry, generateAIResponse, escalateInquiry, getInquiry)
   - 문의 폼 Mock 데이터 제거 및 실제 API 연동
   - 상태 추적 페이지 Mock 데이터 제거 및 실제 API 연동
   - 환경변수 설정 (.env.local.example)
   - 코드 품질 규칙 추가 (EOF, 불필요한 import/코드 제거)

2. **테스트 환경 구축**
   - vitest + jsdom + @testing-library 설정
   - API 클라이언트 단위 테스트 (4/4 통과)
   - TDD Red → Green → Refactor 사이클 완료

### 🔄 현재 진행 중 (feat/api-integration-tdd 브랜치)
**목표**: 프론트엔드와 백엔드 완전 연동 및 실제 동작 확인

#### 다음 우선순위 작업 (TDD 방식)
1. **환경변수 설정 완성** (30분)
   - Next.js 환경변수 설정
   - API URL 동적 설정
   - 개발/프로덕션 환경 분리

2. **API 엔드포인트 테스트** (1시간)
   - 실제 Lambda 함수와 연동 테스트
   - 에러 처리 및 응답 형식 검증
   - CORS 설정 확인

3. **통합 테스트 작성** (1시간)
   - E2E 테스트 시나리오 작성
   - 문의 생성 → AI 응답 → 에스컬레이션 플로우
   - 상태 추적 페이지 동작 확인

4. **에러 처리 개선** (30분)
   - 네트워크 에러 처리
   - 사용자 친화적 에러 메시지
   - 재시도 로직 구현

### 🎯 다음 단계 작업
1. **AWS Bedrock 모델 설정** - 설정파일 기반 Claude 4.1 Opus/4 Opus/4 Sonnet 스위칭
2. **SQS 기반 비동기 이메일 시스템** - 응답 속도 최적화 (200ms 이내)
3. **JWT 인증 API** - 관리자 로그인/인증 시스템
4. **관리자 대시보드** - 문의 관리 UI
5. **인프라 배포 최적화** - CDK 스택 개선

**목표**: 완전히 동작하는 MVP 데모 가능 (프론트엔드 ↔ 백엔드 실제 연동)
