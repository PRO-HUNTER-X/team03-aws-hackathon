# Pull Request 정보

## 제목
feat: API 문서 및 테스트 도구 추가 - 백엔드 개발 완료

## 내용

### 🎯 백엔드 개발 완료 - API 문서 및 테스트 도구

#### ✅ 추가된 기능
- **완전한 API 명세서** (`docs/backend/api-spec.md`)
- **자동화된 API 테스트 스크립트** (`backend/test_api.py`)
- **DynamoDB 서비스 완성** (누락된 `list_inquiries` 메서드 추가)

#### 📋 API 명세서 (`docs/backend/api-spec.md`)
- 5개 엔드포인트 상세 문서화
- 요청/응답 예시 및 에러 코드
- 테스트 방법 가이드
- 배포 후 실제 테스트 방법

#### 🧪 API 테스트 스크립트 (`backend/test_api.py`)
- 모든 Lambda 함수 자동 테스트
- 에러 케이스 검증 포함
- 서버 없이도 로컬에서 테스트 가능
- 예쁜 출력 형식으로 결과 확인

#### 🔧 DynamoDB 서비스 개선
- `list_inquiries` 메서드 구현 완료
- 회사별 문의 목록 조회 기능
- 상태별 필터링 지원

#### 🧪 테스트 결과
```bash
cd backend
source venv/bin/activate
python test_api.py
```
- ✅ 문의 생성: 200 OK (AI 응답 포함)
- ✅ 문의 목록: 200 OK 
- ✅ 입력 검증: 400 Bad Request (적절한 에러 메시지)
- ✅ 존재하지 않는 리소스: 404 Not Found

#### 📊 백엔드 완료 현황
- [x] 모든 API 엔드포인트 (5/5)
- [x] AWS Bedrock Claude 연동
- [x] 완전한 TDD 구현 (36개 테스트 통과)
- [x] 에러 핸들링 및 Fallback 응답
- [x] API 문서화 및 테스트 도구

#### 🚀 팀 협업 준비 완료
**정민(프론트엔드)**: API 명세서로 연동 시작 가능  
**다나(풀스택)**: API 엔드포인트 테스트 및 관리자 UI 연동 가능  
**다혜(인프라)**: Lambda 함수 AWS 배포 준비 완료

#### 📝 사용 방법
1. **API 문서 확인**: `docs/backend/api-spec.md`
2. **로컬 테스트**: `python backend/test_api.py`
3. **단위 테스트**: `pytest backend/tests/ -v`

---
**리뷰어**: @정민 @다나 @다혜  
**우선순위**: High (팀 전체 작업 블로커 해제)  
**브랜치**: `feat/api-docs-and-testing`

## 라벨
- backend
- documentation
- testing
- ready-for-review
- high-priority

## PR 링크
https://github.com/PRO-HUNTER-X/team03-aws-hackathon/pull/new/feat/api-docs-and-testing