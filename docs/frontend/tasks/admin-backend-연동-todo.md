# 프론트엔드 TODO - Admin Backend 연동

## 🎯 현재 상황
- ✅ admin-backend가 로컬에서 정상 작동 중 (포트 3001)
- ✅ DynamoDB 연동 완료 및 API 테스트 성공
- ✅ 환경변수 설정 완료 (.env 파일 사용)
- ✅ Amplify 배포 준비 완료
- ✅ 채팅 히스토리 저장됨: `admin-backend-companies`

## 📋 다음 작업자 가이드

### 1. 컨텍스트 로드
Q CLI에서 다음 명령어로 이전 작업 컨텍스트를 불러오세요:
```
/load admin-backend-companies
```

### 2. admin-frontend와 admin-backend 연동 작업 목록
- [ ] admin-frontend에서 admin-backend API 호출 설정
- [ ] API 베이스 URL 환경변수 설정 (`NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001`)
- [ ] 초기 라우팅 로직 구현 (`/auth/initial-route` API 사용)

### 3. API 테스트 방법 및 예상 응답 형태
```bash
# 헬스체크
curl http://localhost:3001/auth/health

# 초기 라우팅 (회사 정보 및 QnA 데이터 확인)
curl "http://localhost:3001/auth/initial-route?companyId=hunters-company"
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "hasQnAData": true,
    "companyInfo": {
      "companyId": "hunters-company",
      "name": "헌터스 컴퍼니",
      "industry": "IT",
      "size": "소규모"
    },
    "redirectTo": "/dashboard",
    "qnaCount": 1
  }
}
```

### 4. 환경변수 설정 방법
admin-frontend/.env.local 파일 생성:
```
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:3001
```

### 5. 구현해야 할 프론트엔드 로직
- [ ] 회사 ID 입력 또는 URL 파라미터로 받기
- [ ] initial-route API 호출
- [ ] 응답에 따른 라우팅 처리:
  - `hasQnAData: true` → 대시보드로 이동
  - `hasQnAData: false` → 초기 설정 페이지로 이동

## 🚀 admin-backend 실행 방법
```bash
cd admin-backend
npm install
PORT=3001 npm run start:dev
```

## 📝 참고사항
- admin-backend는 포트 3001에서 실행
- DynamoDB에 hunters-company 샘플 데이터 존재
- API 문서: http://localhost:3001/api-docs
- 모든 환경변수는 .env 파일에서 자동 로드됨

## 🔗 관련 파일
- `admin-backend/src/auth/auth.controller.ts` - API 엔드포인트
- `admin-backend/src/auth/auth.service.ts` - 비즈니스 로직
- `admin-backend/.env.example` - 환경변수 예시
- `admin-backend/README.md` - 배포 가이드

## 💾 채팅 히스토리 관리
- **채팅 히스토리 저장됨**: `admin-backend-companies`
- **컨텍스트 로드 방법**: Q CLI에서 `/load admin-backend-companies` 명령어 사용
- **새 히스토리 저장**: `/save [이름]` 명령어 사용

**다음 작업자는 Q CLI에서 `/load admin-backend-companies` 명령어를 사용하여 현재까지의 모든 작업 컨텍스트를 불러올 수 있습니다.**
