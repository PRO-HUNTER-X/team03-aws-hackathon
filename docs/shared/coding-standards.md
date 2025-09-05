# 팀 코딩 컨벤션

## 공통 규칙

### Git 커밋 메시지
```
feat: 새로운 기능 추가
fix: 버그 수정  
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 추가/수정
chore: 빌드 설정 등
```

### 브랜치 네이밍
- `feat/backend-inquiry-api`
- `feat/frontend-inquiry-form`
- `feat/infra-lambda-setup`
- `fix/backend-auth-bug`
- `docs/update-api-spec`

## 백엔드 (Python)

### 네이밍 컨벤션
- **함수**: `snake_case`
- **클래스**: `PascalCase`
- **상수**: `UPPER_CASE`
- **파일**: `snake_case.py`

### 코드 스타일
```python
# Lambda 핸들러 템플릿
def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """Lambda 함수 핸들러"""
    try:
        # 입력 검증
        body = validate_input(event)
        
        # 비즈니스 로직
        result = process_request(body)
        
        # 성공 응답
        return success_response(result)
        
    except ValidationError as e:
        return error_response(str(e), 400)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return error_response("Internal server error", 500)
```

## 프론트엔드 (TypeScript)

### 네이밍 컨벤션
- **컴포넌트**: `PascalCase`
- **함수/변수**: `camelCase`
- **상수**: `UPPER_CASE`
- **파일**: `PascalCase.tsx` (컴포넌트), `camelCase.ts` (유틸)

### 컴포넌트 구조
```typescript
interface Props {
  // props 타입 정의
}

export function ComponentName({ prop1, prop2 }: Props) {
  // 상태 관리
  const [state, setState] = useState()
  
  // 이벤트 핸들러
  const handleClick = () => {
    // 로직
  }
  
  // 렌더링
  return (
    <div className="container">
      {/* JSX */}
    </div>
  )
}
```

## 인프라 (CDK)

### 네이밍 컨벤션
- **스택**: `PascalCase`
- **리소스**: `camelCase`
- **환경변수**: `UPPER_CASE`

### 리소스 네이밍
```typescript
// 일관된 리소스 명명
const inquiryTable = new Table(this, 'InquiryTable', {
  tableName: 'cs-chatbot-inquiries',
  // ...
})

const createInquiryFunction = new Function(this, 'CreateInquiryFunction', {
  functionName: 'cs-chatbot-create-inquiry',
  // ...
})
```

## 공통 에러 처리

### API 응답 형식
```json
// 성공
{
  "success": true,
  "data": { /* 응답 데이터 */ }
}

// 에러  
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "사용자 친화적 메시지"
  }
}
```

### 로깅 규칙
- **INFO**: 정상 플로우 로그
- **WARN**: 예상 가능한 에러 (잘못된 입력 등)
- **ERROR**: 예상치 못한 시스템 에러
- **DEBUG**: 개발 시에만 사용
