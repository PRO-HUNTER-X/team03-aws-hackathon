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
git checkout docs
git pull origin docs
git checkout feature/your-branch-name
git merge docs
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

## 🎯 Q Agent 활용 팁

- **도메인 특화 질문**: "현재 API 명세에 맞춰 사용자 인증 구현해줘"
- **크로스 도메인**: "프론트에서 이 백엔드 API 어떻게 호출하지?"
- **컨텍스트 기반**: "현재 DB 스키마에 맞는 Prisma 모델 만들어줘"

## 👥 팀 역할

- **Backend**: Node.js/Express + AWS Lambda + Bedrock
- **Frontend**: React/Next.js + Tailwind + shadcn/ui  
- **Infrastructure**: AWS CDK + Lambda + RDS + API Gateway
- **Full-stack**: 필요시 여러 영역 지원
