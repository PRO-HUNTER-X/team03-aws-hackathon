# 공통 코딩 규칙

## Git 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
refactor: 코드 리팩토링
```

## 에러 응답 형식
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 메시지"
  }
}
```

## 환경변수 네이밍
- `UPPER_CASE_WITH_UNDERSCORES`
- 예: `DATABASE_URL`, `JWT_SECRET`

## 로깅 레벨
- INFO: 정상 플로우
- WARN: 예상 가능한 에러
- ERROR: 시스템 에러

## 보안 규칙
- 민감 정보는 환경변수 사용
- API 키는 코드에 하드코딩 금지
- 입력 데이터 검증 필수
