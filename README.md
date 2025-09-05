# CS 챗봇 자동화 플랫폼

## 🚀 원클릭 배포 & 접속

### 📋 사전 요구사항
- **Python 3.8+** ([다운로드](https://www.python.org/downloads/))
- **Node.js 18+** ([다운로드](https://nodejs.org/))
- **AWS CLI** ([설치 가이드](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))

### ⚡ 3단계 배포

#### 1️⃣ 환경 설정 (최초 1회만)
```bash
cd infra
python3 setup.py
```

#### 2️⃣ AWS 인증 설정
```bash
aws configure --profile aws-hackathon
```
입력 항목:
- AWS Access Key ID: `[발급받은 키]`
- AWS Secret Access Key: `[발급받은 시크릿]`
- Default region name: `us-east-1`
- Default output format: `json`

#### 3️⃣ 인프라 배포
```bash
./deploy.sh
```

### 🌐 배포된 서비스 접속

배포 완료 후 다음 URL들이 출력됩니다:

#### 📱 프론트엔드 (사용자 접속)
- **CloudFront URL**: `https://d1234567890.cloudfront.net`
- CS 챗봇 웹 인터페이스

#### 🔗 백엔드 API (개발자용)
- **API Gateway URL**: `https://abcd1234.execute-api.us-east-1.amazonaws.com/prod/`
- REST API 엔드포인트

#### 📊 AWS 리소스 확인
```bash
# 배포된 스택 목록
cdk list

# 상세 출력 정보 확인
aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name cs-chatbot-api --query 'Stacks[0].Outputs'
```

### 🗑️ 리소스 정리
```bash
cd infra
cdk destroy --all
```

---

## 📖 프로젝트 개요

소규모 회사의 CS 인력 부족 문제를 해결하는 AI 기반 챗봇 자동화 플랫폼

### 🎯 핵심 기능
1. **1차 AI 응답**: 폼 기반 문의 → AI 답변 생성
2. **2차 인간 연결**: AI 답변 불만족 시 원클릭 메일 문의
3. **데이터 학습**: 인간 답변을 AI 학습 데이터로 활용
4. **진행 현황**: 예상 응답 시간 및 처리 상태 UI

### 🛠️ 기술 스택
- **Backend**: Python Lambda + AWS Bedrock (Claude 3.5)
- **Frontend**: React/Next.js + Tailwind CSS
- **Database**: DynamoDB
- **Infrastructure**: AWS CDK + API Gateway + CloudFront

---

## 👥 개발팀 가이드

상세한 개발 문서는 [`docs/README.md`](docs/README.md)를 참고하세요.

### 🔧 개발 환경 설정
```bash
git clone https://github.com/PRO-HUNTER-X/team03-aws-hackathon.git
cd team03-aws-hackathon
```

### 📁 프로젝트 구조
```
├── backend/          # Lambda 함수
├── frontend/         # React 앱
├── infra/           # AWS CDK 스택
└── docs/            # 개발 문서
```

### 🚀 개발 워크플로우
1. **피쳐 브랜치**: `feat/backend-api`, `feat/frontend-ui`
2. **문서 브랜치**: `docs/update-api`
3. **PR 리뷰**: 2시간 내 리뷰 및 머지
4. **실시간 소통**: 중요 변경사항 팀 채팅 공지