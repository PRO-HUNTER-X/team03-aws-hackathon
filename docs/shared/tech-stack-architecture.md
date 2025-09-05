# 기술 스택 & 아키텍처 설계

## 🏗️ AWS 중심 견고한 아키텍처

### 핵심 설계 원칙
- **서버리스 우선**: 운영 부담 최소화
- **관리형 서비스**: AWS가 관리하는 서비스 최대 활용
- **확장성**: 트래픽 증가에 자동 대응
- **보안**: AWS 보안 모범 사례 적용

---

## 🔧 최적화된 기술 스택

### Backend (서버리스)
```
기존: Node.js + Express + Prisma + PostgreSQL
개선: Python + AWS Lambda + API Gateway + DynamoDB + Step Functions
```

**변경 이유:**
- **Python**: AI/ML 라이브러리 생태계 우수, AWS SDK 완성도 높음
- **Lambda**: 서버 관리 불필요, 자동 스케일링
- **DynamoDB**: 서버리스 NoSQL, 밀리초 응답시간
- **Step Functions**: 복잡한 워크플로우 관리 (문의 → AI → 에스컬레이션)

### Frontend (정적 호스팅)
```
기존: Next.js 14 + Tailwind
개선: Next.js 14 (Static Export) + CloudFront + S3
```

**변경 이유:**
- **S3 + CloudFront**: 글로벌 CDN, 99.99% 가용성
- **Static Export**: 서버 비용 제로, 빠른 로딩

### AI & 데이터 처리
```
기존: AWS Bedrock만 사용
개선: Bedrock + SageMaker + Comprehend + Textract
```

**추가 AWS AI 서비스:**
- **Comprehend**: 감정 분석, 문의 우선순위 자동 분류
- **Textract**: 첨부 이미지/문서 텍스트 추출
- **SageMaker**: 커스텀 모델 학습 (향후 확장)

---

## 🚀 강화된 AWS 서비스 활용

### 1. 보안 & 인증
```
AWS Cognito: 사용자 인증/권한 관리
AWS WAF: 웹 애플리케이션 방화벽
AWS Shield: DDoS 보호
AWS Secrets Manager: API 키 관리
```

### 2. 데이터 & 스토리지
```
DynamoDB: 메인 데이터베이스 (서버리스)
S3: 파일 저장, 정적 호스팅
ElastiCache: 세션 캐싱 (필요시)
```

### 3. AI & 분석
```
AWS Bedrock: 기본 AI 응답 생성
Amazon Comprehend: 감정 분석, 분류
Amazon Textract: 문서 OCR
Amazon Translate: 다국어 지원 (향후)
```

### 4. 알림 & 통신
```
Amazon SES: 이메일 발송
Amazon SNS: 푸시 알림
Amazon EventBridge: 이벤트 기반 아키텍처
```

### 5. 모니터링 & 운영
```
CloudWatch: 로그, 메트릭, 알람
AWS X-Ray: 분산 추적
AWS Config: 리소스 구성 관리
AWS CloudTrail: API 호출 감사
```

---

## 📊 아키텍처 다이어그램

```
[고객] → [CloudFront] → [S3 Static Site]
                           ↓
[API Gateway] → [Lambda] → [DynamoDB]
     ↓              ↓
[Cognito]    [Step Functions]
                    ↓
            [Bedrock + Comprehend]
                    ↓
               [SES + SNS]
```

### 상세 플로우
```
1. 고객 문의 접수
   Frontend (S3/CloudFront) → API Gateway → Lambda → DynamoDB

2. AI 응답 생성
   Lambda → Step Functions → Bedrock → Comprehend → DynamoDB

3. 인간 에스컬레이션
   Lambda → SES (이메일) → SNS (알림) → 관리자 대시보드

4. 상태 추적
   Frontend → API Gateway → Lambda → DynamoDB → 실시간 업데이트
```

---

## 🎯 견고성 향상 포인트

### 1. 자동 복구 & 확장
- **Lambda**: 자동 스케일링, 장애 격리
- **DynamoDB**: 자동 백업, 다중 AZ
- **API Gateway**: 자동 재시도, 회로 차단기

### 2. 보안 강화
- **VPC**: 네트워크 격리
- **IAM**: 최소 권한 원칙
- **암호화**: 전송/저장 시 암호화

### 3. 비용 최적화
- **서버리스**: 사용한 만큼만 과금
- **Reserved Capacity**: DynamoDB 예약 용량
- **S3 Intelligent Tiering**: 자동 비용 최적화

### 4. 운영 효율성
- **CloudFormation/CDK**: 인프라 코드화
- **CloudWatch**: 통합 모니터링
- **AWS Config**: 규정 준수 자동 확인

---

## 🔧 DynamoDB 테이블 설계

### Companies 테이블
```javascript
{
  PK: "COMPANY#${companyId}",
  SK: "METADATA",
  name: "회사명",
  apiKey: "API 키",
  domainContext: "회사 도메인 정보",
  faqData: {...},
  subscriptionTier: "basic|pro|enterprise",
  createdAt: "2024-01-01T00:00:00Z"
}
```

### Inquiries 테이블
```javascript
{
  PK: "INQUIRY#${inquiryId}",
  SK: "METADATA",
  GSI1PK: "COMPANY#${companyId}",
  GSI1SK: "INQUIRY#${timestamp}",
  customerEmail: "customer@example.com",
  category: "기술문의",
  title: "문의 제목",
  content: "문의 내용",
  urgency: "high|medium|low",
  status: "pending|ai_responded|escalated|resolved",
  aiResponse: "AI 응답 내용",
  humanResponse: "인간 응답 내용",
  estimatedResponseTime: 180,
  createdAt: "2024-01-01T00:00:00Z"
}
```

### AI_Responses 테이블
```javascript
{
  PK: "AI_RESPONSE#${responseId}",
  SK: "METADATA",
  GSI1PK: "INQUIRY#${inquiryId}",
  GSI1SK: "RESPONSE#${timestamp}",
  modelUsed: "claude-3-5-sonnet",
  promptTokens: 500,
  completionTokens: 200,
  responseQualityScore: 4.2,
  createdAt: "2024-01-01T00:00:00Z"
}
```

---

## 🚀 Lambda 함수 구조 (Python)

### 1. inquiry-handler
```python
# POST /api/inquiries
import json
import boto3
from datetime import datetime

def lambda_handler(event, context):
    # 1. 입력 검증
    # 2. DynamoDB에 문의 저장
    # 3. Step Functions 워크플로우 시작
    # 4. 응답 반환
    pass
```

### 2. ai-response-generator
```python
# Step Functions에서 호출
import boto3
from boto3.dynamodb.conditions import Key

def lambda_handler(event, context):
    # 1. 회사 컨텍스트 조회
    # 2. Comprehend로 감정/우선순위 분석
    # 3. Bedrock으로 AI 응답 생성
    # 4. 품질 점수 계산
    # 5. DynamoDB 업데이트
    pass
```

### 3. status-tracker
```python
# GET /api/inquiries/{id}/status
def lambda_handler(event, context):
    # 1. 문의 ID로 상태 조회
    # 2. 예상 응답 시간 계산
    # 3. 진행 상황 반환
    pass
```

### 4. escalation-handler
```python
# POST /api/inquiries/{id}/escalate
def lambda_handler(event, context):
    # 1. 에스컬레이션 요청 처리
    # 2. SES로 관리자 이메일 발송
    # 3. SNS로 푸시 알림
    # 4. 상태 업데이트
    pass
```

---

## 📋 성능 & 가용성 목표

### 성능 목표
- **API 응답 시간**: < 500ms
- **AI 응답 생성**: < 3초
- **동시 처리**: 100 req/sec
- **가용성**: 99.9%

### 모니터링 메트릭
```
CloudWatch 커스텀 메트릭:
- AI 토큰 사용량
- 응답 품질 점수
- 에스컬레이션 비율
- 고객 만족도

알람 설정:
- API 에러율 > 5%
- Lambda 실행 시간 > 10초
- DynamoDB 스로틀링 발생
- Bedrock 비용 > $100/day
```

---

## 🔒 보안 설정

### IAM 역할 (최소 권한)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/CS-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:*:*:model/claude-3-5-sonnet"
    }
  ]
}
```

### WAF 규칙
```
1. Rate Limiting: 1000 req/hour per IP
2. Geo Blocking: 허용 국가 설정
3. SQL Injection 방지
4. XSS 공격 차단
5. 봇 트래픽 필터링
```

이 아키텍처로 **99.9% 가용성**, **자동 확장**, **보안 강화**를 달성하면서 24시간 내 MVP 개발이 가능합니다.