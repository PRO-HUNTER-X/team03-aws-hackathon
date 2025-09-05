# CS 챗봇 자동화 플랫폼 - 문서 가이드

## 📁 문서 구조

```
docs/
├── AGENT.md                    # 전체 프로젝트 컨텍스트 (모든 팀원 필수)
├── shared/                     # 공통 참조 문서
│   ├── api-contracts.md        # API 명세서
│   ├── database-schema.md      # DB 스키마
│   └── deployment-guide.md     # 배포 가이드
├── backend/
│   ├── context.md             # 백엔드 전용 컨텍스트
│   └── tasks/sprint-1.md      # 백엔드 태스크
├── frontend/
│   ├── context.md             # 프론트엔드 전용 컨텍스트
│   └── tasks/sprint-1.md      # 프론트엔드 태스크
└── infra/
    ├── context.md             # 인프라 전용 컨텍스트
    └── tasks/sprint-1.md      # 인프라 태스크
```

## 🤖 Q Agent 컨텍스트 설정

각 역할별로 프로젝트 루트에서 실행:

```bash
# 백엔드 개발자
echo "docs/AGENT.md,docs/backend/context.md,docs/shared/" > .q/context

# 프론트엔드 개발자  
echo "docs/AGENT.md,docs/frontend/context.md,docs/shared/" > .q/context

# 인프라 개발자
echo "docs/AGENT.md,docs/infra/context.md,docs/shared/" > .q/context

# 풀스택 개발자 (필요시)
echo "docs/AGENT.md,docs/backend/context.md,docs/frontend/context.md,docs/shared/" > .q/context
```

## 🔄 작업 플로우

### 매일 작업 시작 전
```bash
# 1. docs 최신 변경사항 동기화
git checkout docs
git pull origin docs

# 2. 피쳐 브랜치로 이동 후 docs 변경사항 반영
git checkout feature/your-branch-name
git merge docs

# 3. Q Agent 시작 (컨텍스트 자동 로드됨)
q chat
```

### 작업 중 Q Agent 활용
```bash
# 새로운 기능 개발 시
q chat "현재 태스크 목록에서 다음 구현할 기능 추천해줘"

# 코드 리뷰 요청 시  
q chat "이 코드가 현재 API 명세와 일치하는지 검토해줘" --attach src/api/inquiry.js

# 문제 해결 시
q chat "현재 DB 스키마에서 이 에러가 왜 발생하는지 분석해줘"
```

### docs 문서 업데이트 시
```bash
git checkout docs
# 문서 수정
git add docs/
git commit -m "docs: 업데이트 내용 설명"
git push origin docs
```

### 피쳐 개발 시
```bash
git checkout -b feature/your-feature-name
# 개발 작업
git add .
git commit -m "feat: 기능 설명"
git push origin feature/your-feature-name
```

## 📋 문서 업데이트 규칙

1. **API 변경**: `shared/api-contracts.md` 즉시 업데이트
2. **DB 스키마 변경**: `shared/database-schema.md` 업데이트
3. **진행 상황**: 각 `context.md`의 체크리스트 업데이트
4. **새 태스크**: `tasks/` 폴더에 스프린트별 파일 추가

## 🚀 작업 시작 가이드

### 1. 초기 설정 (최초 1회)
```bash
# 1. 레포지토리 클론
git clone https://github.com/PRO-HUNTER-X/team03-aws-hackathon.git
cd team03-aws-hackathon

# 2. docs 브랜치에서 문서 확인
git checkout docs
git pull origin docs

# 3. 역할별 Q Agent 컨텍스트 설정
mkdir -p .q
# 아래 중 본인 역할에 맞는 명령어 실행
echo "docs/AGENT.md,docs/backend/context.md,docs/shared/" > .q/context     # 백엔드
echo "docs/AGENT.md,docs/frontend/context.md,docs/shared/" > .q/context    # 프론트엔드  
echo "docs/AGENT.md,docs/infra/context.md,docs/shared/" > .q/context       # 인프라

# 4. 피쳐 브랜치 생성
git checkout -b feature/본인이름-기능명
```

### 2. AWS Q Agent와 함께 작업하기

#### Q Agent 컨텍스트 확인
```bash
# 현재 설정된 컨텍스트 확인
cat .q/context

# Q Agent 시작 (프로젝트 루트에서)
q chat
```

#### 효과적인 Q Agent 질문 방법

**✅ 좋은 질문 예시:**
```
# 컨텍스트 기반 구체적 질문
"현재 API 명세서에 맞춰 문의 접수 엔드포인트를 Express로 구현해줘"

# 도메인 특화 질문  
"현재 데이터베이스 스키마에 맞는 Prisma 모델을 생성해줘"

# 크로스 도메인 질문
"백엔드 API 응답 형식에 맞춰 React 컴포넌트에서 데이터를 표시해줘"

# 태스크 기반 질문
"Sprint 1 백엔드 태스크 중 AWS Bedrock 연동 부분을 구현해줘"
```

**❌ 피해야 할 질문:**
```
"웹사이트 만들어줘" (너무 추상적)
"React 사용법 알려줘" (컨텍스트 무시)
```

#### 문서 참조가 필요한 경우
```bash
# 특정 문서 내용을 Q Agent에게 직접 제공
q chat --attach docs/shared/api-contracts.md

# 또는 질문에서 명시적으로 참조
"docs/backend/context.md에 있는 보안 요구사항을 반영해서 JWT 미들웨어 구현해줘"
```

## 🎯 Q Agent 활용 팁

- **컨텍스트 우선**: 항상 현재 프로젝트 문서 기반으로 질문
- **구체적 요청**: "구현해줘" 보다는 "현재 스키마에 맞춰 구현해줘"
- **단계별 접근**: 큰 기능을 작은 단위로 나눠서 질문
- **코드 리뷰**: 생성된 코드가 프로젝트 컨벤션에 맞는지 확인

## 👥 팀 역할

- **Backend**: Node.js/Express + AWS Lambda + Bedrock
- **Frontend**: React/Next.js + Tailwind + shadcn/ui  
- **Infrastructure**: AWS CDK + Lambda + RDS + API Gateway
- **Full-stack**: 필요시 여러 영역 지원
