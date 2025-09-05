# CS 챗봇 자동화 플랫폼 - 해커톤 가이드

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

## 🚀 해커톤 워크플로우 (27시간 몰입)

### 1. 초기 설정 (최초 1회)
```bash
# 1. 레포지토리 클론
git clone https://github.com/PRO-HUNTER-X/team03-aws-hackathon.git
cd team03-aws-hackathon

# 2. Q Agent 컨텍스트 설정 (모든 팀원 동일)
mkdir -p .q
echo "docs/AGENT.md,docs/shared/,docs/backend/context.md,docs/frontend/context.md,docs/infra/context.md" > .q/context

# 3. Q Agent 시작
q chat
```

### 2. 실시간 협업 워크플로우

#### 작업 시작 전 (매번)
```bash
# 최신 변경사항 동기화
git pull origin main

# Q Agent 시작 (컨텍스트 자동 로드)
q chat
```

#### 작업 완료 후 (즉시 푸시)
```bash
# 변경사항 커밋 & 푸시
git add .
git commit -m "feat: 구현한 기능 설명"
git push origin main
```

#### 충돌 발생 시
```bash
# 충돌 해결 후 즉시 푸시
git pull origin main
# 충돌 해결
git add .
git commit -m "fix: merge conflict resolved"
git push origin main
```

## 🤖 Q Agent 협업 최적화

### 효과적인 질문 패턴
```bash
# 컨텍스트 기반 구체적 질문
q chat "현재 API 명세서에 맞춰 문의 접수 엔드포인트를 Express로 구현해줘"

# 팀원 작업과 연동
q chat "현재 프론트엔드 컴포넌트 구조에 맞춰 백엔드 응답 형식 조정해줘"

# 실시간 스펙 확인
q chat "현재 데이터베이스 스키마와 API 명세가 일치하는지 검토해줘"
```

### 실시간 문서 업데이트 규칙
1. **API 변경**: `shared/api-contracts.md` 즉시 업데이트 후 팀 공지
2. **DB 스키마 변경**: `shared/database-schema.md` 업데이트 후 팀 공지  
3. **진행 상황**: 각 `context.md`의 체크리스트 실시간 업데이트
4. **새 기능**: 구현 완료 시 관련 문서 즉시 업데이트

## ⚡ 해커톤 협업 팁

### 커뮤니케이션
- **Slack/Discord**: API 변경, 중요 결정사항 즉시 공유
- **화면 공유**: 복잡한 로직은 페어 프로그래밍으로 해결
- **30분 체크인**: 전체 팀 진행상황 공유

### 충돌 최소화
- **작업 영역 분리**: 가능한 다른 파일에서 작업
- **자주 푸시**: 2-3시간마다 중간 커밋
- **즉시 동기화**: 다른 팀원 푸시 시 바로 pull

### Q Agent 활용 극대화
- **컨텍스트 공유**: 모든 팀원이 동일한 프로젝트 이해도 유지
- **코드 리뷰**: Q Agent로 생성한 코드 품질 검토
- **문제 해결**: 에러 발생 시 Q Agent와 함께 디버깅

## 👥 팀 역할 & 책임

- **Backend**: Node.js/Express + AWS Lambda + Bedrock
- **Frontend**: React/Next.js + Tailwind + shadcn/ui  
- **Infrastructure**: AWS CDK + Lambda + RDS + API Gateway
- **Full-stack**: 필요시 여러 영역 지원

## 🎯 27시간 목표
- **6시간**: 기본 인프라 + API 구조
- **12시간**: 핵심 기능 구현 (AI 응답, 문의 관리)
- **6시간**: 프론트엔드 UI/UX 완성
- **3시간**: 통합 테스트 + 배포 + 발표 준비
