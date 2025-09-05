# Python 백엔드 코딩 규칙

## CORE DEVELOPMENT PRINCIPLES

### Test-Driven Development (TDD) - MANDATORY
- **ALWAYS** follow Red → Green → Refactor cycle
- Write failing test FIRST, then implement minimum code to pass
- **NEVER** write production code without a failing test
- Test names in Korean for business clarity: `test_챗봇_응답_생성시_필수_필드_검증`
- Refactor ONLY when all tests are green
- Run ALL tests before every commit

### Python Best Practices
- **Type hints everywhere** - use `typing` module for all functions
- **Dataclasses/Pydantic** for data structures with validation
- **List/dict comprehensions** over loops when readable
- **Context managers** for resource management
- **Async/await** for I/O operations (AWS calls, DB queries)
- **f-strings** for string formatting
- **Pathlib** over os.path for file operations

### Clean Architecture Principles
- **Business logic in domain layer**, NOT in handlers or repositories
- **Dependency injection** through function parameters
- **Pure functions** whenever possible
- **Separate models**: Domain, API (Pydantic), Database (SQLAlchemy)
- **Single responsibility** - one function, one purpose
- **Fail fast** - validate inputs early

## PYTHON SPECIFIC PITFALLS TO AVOID

### Code Quality
- ❌ **DON'T** write functions longer than 20 lines
- ❌ **DON'T** use magic numbers/strings - use constants or enums
- ❌ **DON'T** ignore type checker warnings (mypy/pyright)
- ❌ **DON'T** use mutable default arguments `def func(items=[]):`
- ❌ **DON'T** use bare `except:` - catch specific exceptions
- ❌ **DON'T** use `import *` - explicit imports only
- ✅ **DO** use type hints for all function signatures
- ✅ **DO** use dataclasses/Pydantic for structured data
- ✅ **DO** use pathlib for file operations
- ✅ **DO** use context managers for resources

### Testing Mistakes
- ❌ **DON'T** test implementation details - test behavior
- ❌ **DON'T** write tests after code is written
- ❌ **DON'T** use real AWS services in unit tests - use moto
- ❌ **DON'T** write tests that depend on each other
- ❌ **DON'T** ignore flaky async tests
- ✅ **DO** use pytest fixtures for test data
- ✅ **DO** test edge cases and error conditions
- ✅ **DO** use descriptive test names in Korean
- ✅ **DO** mock external dependencies (AWS, APIs)

### Architecture Mistakes
- ❌ **DON'T** put business logic in Lambda handlers
- ❌ **DON'T** create circular imports
- ❌ **DON'T** expose internal models in API responses
- ❌ **DON'T** mix AWS SDK calls with business logic
- ✅ **DO** use dependency injection via parameters
- ✅ **DO** separate layers: handler → service → repository
- ✅ **DO** validate input with Pydantic models

### Git/Version Control
- ❌ **DON'T** commit broken code or failing tests
- ❌ **DON'T** commit large changes without breaking them down
- ❌ **DON'T** push directly to main/master branch
- ❌ **DON'T** force push to shared branches
- ✅ **DO** write meaningful commit messages with Gitmoji
- ✅ **DO** commit frequently with small, logical changes
- ✅ **DO** review your own changes before committing

## COMMIT & PR GUIDELINES

### Commit Message Format (Korean with Gitmoji)
```
✅ 챗봇_응답_생성_테스트_추가
✨ 챗봇 응답 생성 API 구현
♻️ 응답 생성 로직 함수 분리
🐛 세션 만료 처리 로직 수정
🎨 코드 포맷팅 개선
```

### Gitmoji Reference
- ✅ `:white_check_mark:` Adding tests
- ✨ `:sparkles:` New features
- 🐛 `:bug:` Bug fixes
- ♻️ `:recycle:` Refactoring
- 🎨 `:art:` Code structure/format
- 🔧 `:wrench:` Configuration
- 📝 `:memo:` Documentation
- 🚀 `:rocket:` Deployment

## PYTHON TECHNOLOGY STACK

### Core Libraries
- **FastAPI/Flask** for API development
- **Pydantic** for data validation and serialization
- **SQLAlchemy** for database ORM (if needed)
- **Boto3** for AWS services
- **Pytest** for testing
- **Asyncio** for concurrent operations

### AWS Lambda Patterns
```python
from typing import Dict, Any
import json
import logging
from pydantic import BaseModel, ValidationError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class RequestModel(BaseModel):
    message: str
    user_id: str

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body', '{}'))
        request = RequestModel(**body)
        result = process_chatbot_request(request)
        return success_response(result)
    except ValidationError as e:
        return error_response(f"입력 검증 실패: {e}", 400)
    except Exception as e:
        logger.error(f"처리 중 오류: {str(e)}")
        return error_response("서버 오류가 발생했습니다", 500)
```

### Testing with Pytest
```python
import pytest
from moto import mock_dynamodb
from unittest.mock import AsyncMock

@pytest.fixture
def mock_chatbot_service():
    return AsyncMock()

@pytest.mark.asyncio
async def test_챗봇_응답_생성_성공(mock_chatbot_service):
    # Given
    request = ChatRequest(message="안녕하세요", user_id="user123")
    mock_chatbot_service.generate_response.return_value = "안녕하세요! 무엇을 도와드릴까요?"
    
    # When
    response = await chatbot_handler(request, mock_chatbot_service)
    
    # Then
    assert response.success is True
    assert "안녕하세요" in response.message
```

## ERROR HANDLING STRATEGY

### Input Validation
- **Pydantic models** for automatic validation at boundaries
- **Custom validators** for business rules
- **Early validation** - fail fast principle
- **Meaningful Korean error messages** for users

```python
from pydantic import BaseModel, validator
from typing import Optional

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: Optional[str] = None
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('메시지는 비어있을 수 없습니다')
        return v.strip()
```

### Exception Handling
```python
class ChatbotError(Exception):
    """챗봇 관련 비즈니스 예외"""
    pass

class InvalidInputError(ChatbotError):
    """잘못된 입력 예외"""
    pass

def error_response(message: str, status_code: int) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': False,
            'error': {'message': message, 'code': status_code}
        }, ensure_ascii=False)
    }
```

### Structured Logging
```python
import structlog

logger = structlog.get_logger()

# 비즈니스 이벤트 로깅
logger.info("챗봇 응답 생성 완료", 
           user_id=user_id, 
           session_id=session_id,
           response_time_ms=elapsed_time)
```

## PERFORMANCE CONSIDERATIONS

### AWS Lambda Optimization
- **Cold start 최소화** - 글로벌 변수로 연결 재사용
- **메모리 설정** - CPU 성능과 비례, 적절한 메모리 할당
- **동시성 제어** - reserved concurrency 설정
- **패키지 크기** 최소화 - 필요한 라이브러리만 포함

```python
# ✅ 글로벌 변수로 연결 재사용
import boto3

# Lambda 컨테이너 재사용시 연결 유지
dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')

def lambda_handler(event, context):
    # 핸들러에서는 재사용
    pass
```

### Async Programming
```python
import asyncio
import aiohttp
from typing import List

async def fetch_multiple_responses(requests: List[str]) -> List[str]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_ai_response(session, req) for req in requests]
        return await asyncio.gather(*tasks)
```

### Caching Strategy
- **DynamoDB** for session data caching
- **ElastiCache** for frequently accessed data
- **Lambda memory** for request-scoped caching
- **TTL 설정** for automatic cleanup

## SECURITY CHECKLIST

- [ ] **Input validation** with Pydantic models
- [ ] **SQL injection** prevention (SQLAlchemy ORM)
- [ ] **AWS IAM** roles with least privilege
- [ ] **API Gateway** authentication/authorization
- [ ] **Secrets Manager** for sensitive data
- [ ] **Environment variables** for configuration
- [ ] **CORS** properly configured
- [ ] **Rate limiting** on API Gateway
- [ ] **Input sanitization** for AI prompts
- [ ] **Dependency scanning** with safety/bandit

```python
# ✅ 환경변수 사용
import os
from typing import Optional

def get_secret(key: str) -> Optional[str]:
    return os.environ.get(key)

# ✅ AI 프롬프트 sanitization
def sanitize_user_input(message: str) -> str:
    # 악성 프롬프트 패턴 제거
    forbidden_patterns = ['ignore previous', 'system:', 'assistant:']
    cleaned = message
    for pattern in forbidden_patterns:
        cleaned = cleaned.replace(pattern, '')
    return cleaned.strip()
```

## MONITORING & OBSERVABILITY

### AWS CloudWatch Integration
```python
import boto3
from datetime import datetime

cloudwatch = boto3.client('cloudwatch')

def put_custom_metric(metric_name: str, value: float, unit: str = 'Count'):
    cloudwatch.put_metric_data(
        Namespace='ChatbotPlatform',
        MetricData=[
            {
                'MetricName': metric_name,
                'Value': value,
                'Unit': unit,
                'Timestamp': datetime.utcnow()
            }
        ]
    )

# 비즈니스 메트릭 추적
put_custom_metric('ChatbotResponses', 1)
put_custom_metric('ResponseTime', response_time_ms, 'Milliseconds')
```

### Structured Logging
- **CloudWatch Logs** for centralized logging
- **X-Ray** for distributed tracing
- **Custom metrics** for business KPIs
- **Alarms** for error rates and latency

## DEVELOPMENT WORKFLOW

### 빠른 개발을 위한 패턴
```python
# ✅ 템플릿 기반 빠른 개발
from dataclasses import dataclass
from typing import Optional, Dict, Any
import json

@dataclass
class LambdaResponse:
    status_code: int
    body: Dict[str, Any]
    headers: Optional[Dict[str, str]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'statusCode': self.status_code,
            'headers': self.headers or {'Content-Type': 'application/json'},
            'body': json.dumps(self.body, ensure_ascii=False)
        }

def quick_success(data: Any) -> LambdaResponse:
    return LambdaResponse(200, {'success': True, 'data': data})

def quick_error(message: str, code: int = 400) -> LambdaResponse:
    return LambdaResponse(code, {'success': False, 'error': message})
```

### 코드 생성 도구 활용
- **Pydantic** 모델 자동 생성
- **AWS CDK** 인프라 코드 생성
- **pytest** 테스트 템플릿 활용
- **Black/isort** 자동 포맷팅

## AI AGENT WORKFLOW REQUIREMENTS

### 필수 작업 순서
1. **TDD 최우선**: 모든 코드 변경은 테스트 작성 후 진행
2. **최소 구현**: 요구사항을 만족하는 최소한의 코드만 작성
3. **테스트 통과 확인**: 변경사항 관련 모든 테스트가 통과해야 함
4. **커밋 전 승인 요청**: 반드시 작업자에게 커밋 여부를 확인 후 진행

### 커밋 메시지 규칙
**형식**: `{gitmoji} {기능}: {구체적 내용}`

**예시**:
```
✨ 챗봇: AI 응답 생성 API 구현
✅ 챗봇: 입력 검증 테스트 추가
🐛 챗봇: 세션 만료 처리 로직 수정
♻️ 챗봇: 응답 생성 로직 함수 분리
```

### 빠른 개발 체크리스트
- [ ] Pydantic 모델로 입력 검증
- [ ] 타입 힌트 모든 함수에 적용
- [ ] 비즈니스 로직과 AWS 코드 분리
- [ ] 에러 처리 및 로깅 포함
- [ ] 테스트 커버리지 80% 이상
- [ ] 환경변수로 설정 관리

## REMEMBER: PYTHON SPECIFIC INSTRUCTIONS

빠르고 효율적인 개발을 위해:
1. **Pydantic 적극 활용** - 입력 검증과 직렬화 자동화
2. **타입 힌트 필수** - IDE 지원과 버그 예방
3. **함수형 접근** - 순수 함수로 테스트 용이성 확보
4. **AWS 서비스 추상화** - 비즈니스 로직과 인프라 분리
5. **최소 구현 원칙** - 과도한 추상화 지양
6. **테스트 우선** - 실패하는 테스트부터 작성
7. **한국어 비즈니스 용어** - 도메인 전문가와 소통 개선

## 코드 품질 규칙
- **EOF (End of File)**: 모든 파일은 마지막에 빈 줄로 끝나야 함
- **불필요한 import 제거**: 사용하지 않는 import문은 반드시 제거
- **불필요한 코드 제거**: 주석 처리된 코드, 사용하지 않는 함수/변수 제거
- **불필요한 파일 제거**: 더 이상 사용하지 않는 파일은 삭제
- **작업 파일만 적용**: 수정하는 파일에만 위 규칙을 적용하여 불필요한 변경 최소화

CS 챗봇 플랫폼의 핵심 가치인 **빠른 도입**과 **간편한 사용**을 코드에서도 구현하자.
