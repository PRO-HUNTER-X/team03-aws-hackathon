# CS 챗봇 자동화 플랫폼 - 해커톤 가이드

## 📁 문서 구조

### `docs/` - 개발 문서 (사람이 읽는 상세 구현 가이드)
```
docs/
├── backend/                    # 백엔드 개발 문서
│   ├── context.md             # 현재 구현 상태, 아키텍처 세부사항
│   ├── api-spec.md            # REST API 엔드포인트 상세 명세
│   ├── database-schema.md     # DynamoDB 테이블 구조, 인덱스
│   └── deployment.md          # 백엔드 배포 가이드
├── frontend/                   # 프론트엔드 개발 문서  
│   ├── context.md             # 컴포넌트 구조, 상태 관리 현황
│   ├── ui-components.md       # 재사용 컴포넌트 상세 가이드
│   └── routing.md             # 페이지 라우팅 구조
├── infra/                      # 인프라 문서
│   ├── architecture.md        # AWS 인프라 다이어그램, 리소스 현황
│   └── cdk-guide.md           # CDK 스택 구조, 배포 방법
└── shared/                     # 공통 개발 문서
    ├── coding-standards.md    # 팀 코딩 컨벤션
    └── testing-guide.md       # 테스트 전략, 도구
```

### `.amazonq/rules/` - AI 컨텍스트 (AI가 참고하는 코드 생성 규칙)
```
.amazonq/rules/
├── project-context.md         # 프로젝트 비즈니스 컨텍스트
├── backend-rules.md           # 백엔드 코딩 패턴, 규칙
├── frontend-rules.md          # 프론트엔드 컴포넌트 패턴
├── common-rules.md            # 공통 네이밍, 에러 처리 규칙
├── security-rules.md          # 보안 가이드라인
└── performance-rules.md       # 성능 최적화 규칙
```

**핵심 차이점**:
- `docs/`: "현재 무엇을 구현했고 어떻게 작동하는가" (상세 구현 문서)
- `.amazonq/rules/`: "코드를 이렇게 작성해라" (AI 코드 생성 규칙)

## 🚀 해커톤 워크플로우 (27시간 몰입)

### 1. 팀원 시작 가이드 (최초 1회)
```bash
# 1. 레포지토리 클론
git clone https://github.com/PRO-HUNTER-X/team03-aws-hackathon.git
cd team03-aws-hackathon

# 2. Q Agent 컨텍스트 설정 (모든 팀원 동일)
mkdir -p .q
echo "docs/shared/,docs/backend/context.md,docs/frontend/context.md,docs/infra/context.md" > .q/context

# 3. 본인 역할 확인 및 태스크 파악
cat docs/README.md  # 전체 가이드 확인
cat docs/backend/tasks/sprint-1.md    # 백엔드 개발자
cat docs/frontend/tasks/sprint-1.md   # 프론트엔드 개발자  
cat docs/infra/tasks/sprint-1.md      # 인프라 개발자

# 4. Q Agent 시작
q chat
```

### 2. 코드 개발 워크플로우 (피쳐 브랜치)

#### 새 기능 개발 시
```bash
# 1. 최신 main 동기화
git checkout main
git pull origin main

# 2. 피쳐 브랜치 생성 (역할별 명명 규칙)
git checkout -b feat/backend-inquiry-api      # 백엔드
git checkout -b feat/frontend-inquiry-form    # 프론트엔드  
git checkout -b feat/infra-lambda-setup       # 인프라

# 3. 코드 개발
# Q Agent 활용하여 개발
q chat "현재 API 명세에 맞춰 문의 접수 엔드포인트 구현해줘"

# 4. 개발 완료 후 커밋
git add .
git commit -m "feat: 구현한 기능 설명"
git push origin feat/your-branch-name

# 5. PR 생성 및 머지
# GitHub에서 PR 생성 → 팀원 리뷰 → 머지 → 브랜치 삭제
```

#### 다른 팀원 작업 반영
```bash
# 정기적으로 main 최신 변경사항 반영
git checkout main
git pull origin main
git checkout feat/your-branch
git rebase main  # 또는 git merge main
```

### 3. 문서 업데이트 워크플로우 (피쳐 브랜치)

#### 문서 수정이 필요한 경우
```bash
# 1. 피쳐 브랜치 생성 (역할별 명명 규칙)
git checkout -b docs/backend-update-api     # 백엔드 개발자
git checkout -b docs/frontend-update-ui     # 프론트엔드 개발자
git checkout -b docs/infra-update-deploy    # 인프라 개발자

# 2. 본인 담당 문서만 수정
# 백엔드: docs/backend/, docs/shared/api-contracts.md, docs/shared/database-schema.md
# 프론트엔드: docs/frontend/, docs/shared/api-contracts.md (읽기 전용)
# 인프라: docs/infra/, docs/shared/deployment-guide.md

# 3. 문서 커밋 & 푸시
git add docs/
git commit -m "docs: 업데이트 내용 설명"
git push origin docs/your-branch-name

# 4. PR 생성 후 즉시 머지 (리뷰 없이)
# GitHub에서 PR 생성 → 즉시 머지 → 브랜치 삭제
```

## 📋 문서 수정 권한 & 충돌 방지 규칙

### 역할별 문서 수정 권한
```
백엔드 개발자:
✅ docs/backend/ (전체)
✅ docs/shared/api-contracts.md
✅ docs/shared/database-schema.md
❌ docs/frontend/, docs/infra/

프론트엔드 개발자:
✅ docs/frontend/ (전체)  
✅ docs/shared/api-contracts.md (API 사용법 추가만)
❌ docs/backend/, docs/infra/, docs/shared/database-schema.md

인프라 개발자:
✅ docs/infra/ (전체)
✅ docs/shared/deployment-guide.md
❌ docs/backend/, docs/frontend/, docs/shared/api-contracts.md

공통:
✅ 본인 역할의 context.md 체크리스트 업데이트
❌ 프로젝트 컨텍스트 파일 (프로젝트 리더만 수정)
```

### 문서 업데이트 우선순위
1. **긴급 (즉시 업데이트)**: API 변경, DB 스키마 변경
2. **중요 (2시간 내)**: 새 기능 완성, 배포 가이드 변경  
3. **일반 (하루 내)**: 진행 상황 체크리스트, 태스크 추가

## 🤖 Q Agent 협업 최적화

### 효과적인 질문 패턴
```bash
# 컨텍스트 기반 구체적 질문
q chat "현재 API 명세서에 맞춰 문의 접수 Lambda 함수를 Python으로 구현해줘"

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

### 충돌 방지 전략
- **코드**: feat/ 브랜치에서 개발 후 PR
- **문서**: docs/ 브랜치에서 수정 후 PR  
- **역할별 영역**: 본인 담당 폴더/파일만 수정
- **실시간 소통**: 중요 변경사항은 팀 채팅에 즉시 공지
- **빠른 리뷰**: PR은 2시간 내 리뷰 및 머지

### 커뮤니케이션 규칙
- **Slack/Discord**: 
  - API 변경 시: "@channel API 변경: 엔드포인트명 - 변경내용"
  - DB 스키마 변경: "@channel DB 변경: 테이블명 - 변경내용"  
  - 문서 수정: "docs 업데이트 중: 파일명 (5분 소요 예정)"
- **화면 공유**: 복잡한 로직은 페어 프로그래밍으로 해결
- **1시간 체크인**: 전체 팀 진행상황 공유

### 충돌 발생 시 해결법
```bash
# 코드 충돌 (feat/ 브랜치)
git checkout main
git pull origin main
git checkout feat/your-branch
git rebase main
# 충돌 해결 후
git add .
git rebase --continue
git push --force-with-lease origin feat/your-branch

# 문서 충돌 (docs/ 브랜치) - 거의 발생하지 않음
git checkout main
git pull origin main  
git checkout docs/your-branch
git rebase main
# 충돌 해결 후 PR 업데이트
```

### Q Agent 활용 극대화
- **컨텍스트 공유**: 모든 팀원이 동일한 프로젝트 이해도 유지
- **코드 리뷰**: Q Agent로 생성한 코드 품질 검토
- **문제 해결**: 에러 발생 시 Q Agent와 함께 디버깅
- **채팅 내역 저장**: 유용한 대화는 `/save` 명령어로 저장하여 팀 공유

### 🎯 채팅 내역 저장 및 공유
```bash
# Q Agent와의 유용한 대화 저장
/save chat-history/backend-lambda-setup
/save chat-history/frontend-component-patterns  
/save chat-history/infra-deployment-guide
/save chat-history/debugging-session-20240905

# 저장된 대화 불러오기
/load chat-history/backend-lambda-setup

# 팀원과 공유할 때
# 1. 저장된 파일을 git에 커밋
git add .amazonq/conversations/
git commit -m "docs: 유용한 Q Agent 대화 내역 추가"
git push origin main

# 2. 팀원이 대화 불러오기
git pull origin main
/load chat-history/backend-lambda-setup
```

**저장 권장 시점**:
- 복잡한 구현 문제 해결 완료 시
- 새로운 패턴이나 베스트 프랙티스 발견 시  
- 디버깅 과정에서 유용한 인사이트 얻었을 때
- 팀원이 참고할 만한 코드 생성 과정

## 👥 팀 역할 & 책임

- **Backend**: Python Lambda + AWS Bedrock + DynamoDB
- **Frontend**: React/Next.js + Tailwind + shadcn/ui  
- **Infrastructure**: AWS CDK + Lambda + RDS + API Gateway
- **Full-stack**: 필요시 여러 영역 지원

## 🎯 27시간 목표
- **6시간**: 기본 인프라 + API 구조
- **12시간**: 핵심 기능 구현 (AI 응답, 문의 관리)
- **6시간**: 프론트엔드 UI/UX 완성
- **3시간**: 통합 테스트 + 배포 + 발표 준비
