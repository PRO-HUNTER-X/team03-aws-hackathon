# CS 챗봇 인프라 배포

## 🚀 원클릭 배포 시스템

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
> 자동으로 CDK CLI, 가상환경, Python 의존성을 설치합니다.

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
> 가상환경 활성화 → CDK 부트스트랩 → 전체 스택 배포

### ✅ 배포 완료 확인
배포 성공 시 다음 정보가 출력됩니다:
- **API Gateway URL**: 백엔드 API 엔드포인트
- **CloudFront URL**: 프론트엔드 배포 주소
- **DynamoDB Table**: 데이터 저장소

### 🗑️ 리소스 정리
```bash
cdk destroy --all
```

---

## 🔧 개발자용 수동 배포

또는 개별 스택 배포:
```bash
cdk deploy cs-chatbot-data
cdk deploy cs-chatbot-api
cdk deploy cs-chatbot-frontend
```

## 스택 구성
- **cs-chatbot-data**: DynamoDB 테이블
- **cs-chatbot-api**: Lambda + API Gateway
- **cs-chatbot-frontend**: S3 + CloudFront

## 환경 변수
CDK 컨텍스트에서 설정:
- `account`: AWS 계정 ID
- `region`: 배포 리전 (기본값: us-east-1)