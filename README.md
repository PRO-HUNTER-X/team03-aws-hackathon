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

## 🔄 배포 환경 선택

### 📦 프로덕션 환경 (공용)
**전체 배포 (60-90초)**
```bash
./deploy.sh
# 또는
./deploy.sh all
```

**개별 스택 배포 (10-20초) ⚡**
```bash
# 데이터베이스만 (~10초)
./deploy.sh data

# API만 (~15초) 
./deploy.sh api

# 프론트엔드만 (~20초)
./deploy.sh frontend

# 관리자 페이지만 (~30초)
./deploy.sh admin
```

**빠른 배포 (의존성 설치 스킵) 🚀**
```bash
# 개발 중 빠른 재배포용
./deploy.sh api --fast
./deploy.sh frontend --fast
./deploy.sh admin --fast
```

### 🧪 개발 환경 (개인별 독립)
**feat 브랜치에서 개인 dev 환경에 배포**

#### 🔄 개발 환경 배포 순서
```bash
# 1. API 먼저 배포 (프론트엔드가 API URL 필요)
./deploy-dev.sh [개발자명] api

# 2. 프론트엔드 배포 (API URL 자동 연결)
./deploy-dev.sh [개발자명] frontend

# 또는 전체 배포 (자동으로 순서 처리)
./deploy-dev.sh [개발자명]
```

#### 📦 개별 스택 배포
```bash
# 데이터베이스만
./deploy-dev.sh [개발자명] data

# API만 (빠른 배포)
./deploy-dev.sh [개발자명] api --fast

# 프론트엔드만 (API URL 자동 설정)
./deploy-dev.sh [개발자명] frontend
```

**실제 사용 예시**
```bash
# 다혜의 개발 워크플로우
./deploy-dev.sh dahye api          # API 변경사항 배포
./deploy-dev.sh dahye frontend     # 프론트엔드 배포 (API URL 자동 연결)

# 정민의 빠른 개발
./deploy-dev.sh jeongmin api --fast      # API 빠른 배포
./deploy-dev.sh jeongmin frontend --fast # 프론트엔드 빠른 배포
```

**dev 환경 정리**
```bash
# 개인 dev 환경 완전 삭제
./destroy-dev.sh [개발자명]

# 강제 삭제 (확인 없이)
./destroy-dev.sh [개발자명] --force
```

**도움말**
```bash
./deploy.sh --help
./deploy-dev.sh --help
./destroy-dev.sh --help
```

### 🌐 배포된 서비스 접속

배포 완료 후 다음 URL들이 출력됩니다:

#### 📱 프론트엔드 (사용자 접속)
- **CloudFront URL**: `https://d2mksyj4now3a0.cloudfront.net/`
- CS 챗봇 웹 인터페이스

#### 👑 관리자 페이지 (관리자 접속)
- **Admin CloudFront URL**: `https://d1czy2j4qpa1wq.cloudfront.net`
- CS 챗봇 관리자 대시보드

#### 🔗 백엔드 API (개발자용)
- **API Gateway URL**: `https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/`
- **Admin API URL**: `https://3tbdb8uvll.execute-api.us-east-1.amazonaws.com/prod/admin/`
- REST API 엔드포인트

#### 📊 AWS 리소스 확인
```bash
# 배포된 스택 목록
cdk list

# 프로덕션 환경 확인
aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name cs-chatbot-api --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name cs-chatbot-admin-frontend --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name cs-chatbot-admin-api --query 'Stacks[0].Outputs'

# 개발 환경 확인 (개발자명 대체)
aws cloudformation describe-stacks --stack-name cs-chatbot-dev-dahye-frontend --query 'Stacks[0].Outputs'
aws cloudformation describe-stacks --stack-name cs-chatbot-dev-dahye-api --query 'Stacks[0].Outputs'
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
5. **관리자 대시보드**: 문의 관리 및 통계 확인

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
├── backend/          # Lambda 함수 (사용자용)
├── frontend/         # React 앱 (사용자용)
├── admin-backend/    # Lambda 함수 (관리자용)
├── admin-frontend/   # React 앱 (관리자용)
├── infra/           # AWS CDK 스택
└── docs/            # 개발 문서
```

### 🚀 개발 워크플로우
1. **피쳐 브랜치**: `feat/backend-api`, `feat/frontend-ui`
2. **빠른 배포**: 변경된 스택만 개별 배포로 시간 단축
3. **PR 리뷰**: 2시간 내 리뷰 및 머지
4. **실시간 소통**: 중요 변경사항 팀 채팅 공지

### ⚡ 개발 중 빠른 배포 팁

#### 프로덕션 환경 (공용)
```bash
# 첫 배포 (전체 설치)
./deploy.sh frontend

# 개발 중 빠른 재배포
./deploy.sh frontend --fast
./deploy.sh api --fast
./deploy.sh admin --fast

# 데이터베이스 스키마 변경
./deploy.sh data
```

#### 개발 환경 (개인별)
```bash
# feat 브랜치에서 개인 dev 환경에 배포
./deploy-dev.sh dahye api --fast
./deploy-dev.sh jeongmin frontend --fast

# 개발 완료 후 dev 환경 정리
./destroy-dev.sh dahye
```

### 🔧 배포 모드 차이점
- **기본 모드**: pip install + CDK bootstrap + npm install 포함
- **빠른 모드 (--fast)**: 의존성 설치 스킵하여 5-10초 단축

### 🌍 환경별 리소스 분리
- **프로덕션**: `cs-chatbot-*` (공용, 안정적)
- **개발**: `cs-chatbot-dev-[개발자명]-*` (개인별, 독립적)

각 개발자는 자신만의 독립적인 AWS 리소스를 가지므로 서로 간섭하지 않습니다.

## 🎯 개발 환경 사용 가이드

### 📋 개발 워크플로우
```bash
# 1. feat 브랜치 생성
git checkout -b feat/backend-api

# 2. 개인 dev 환경에 배포
cd infra
./deploy-dev.sh [내이름] api      # API 변경사항 배포
./deploy-dev.sh [내이름] frontend  # 프론트엔드 배포 (API URL 자동 연결)

# 3. 개인 CloudFront URL에서 테스트
# 출력된 프론트엔드 URL로 접속하여 테스트

# 4. 개발 완료 후 PR 생성
git add .
git commit -m "feat: 새 기능 구현"
git push origin feat/backend-api

# 5. dev 환경 정리 (선택사항)
./destroy-dev.sh [내이름]
```

### ⚡ 빠른 개발 팁
```bash
# API 변경 후 빠른 재배포
./deploy-dev.sh dahye api --fast

# 프론트엔드 변경 후 빠른 재배포 
./deploy-dev.sh dahye frontend --fast

# 전체 환경 재배포
./deploy-dev.sh dahye
```

### 🔗 API URL 자동 연결
- **dev 환경**: 프론트엔드 배포 시 해당 개발자의 API URL 자동 설정
- **prod 환경**: 수동으로 `.env.local` 파일에 API URL 설정 필요
- **로컬 개발**: `npm run dev`로 localhost:3000에서 개발