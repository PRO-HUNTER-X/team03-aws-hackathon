# 백엔드 코딩 규칙

## Lambda 함수 패턴
```python
import json
from typing import Dict, Any
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body', '{}'))
        result = process_request(body)
        return success_response(result)
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return error_response(str(e), 500)

def success_response(data: Any) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'data': data})
    }

def error_response(message: str, status_code: int) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': False, 'error': message})
    }
```

## DynamoDB 패턴
```python
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('table-name')

# 아이템 생성
def create_item(data: dict):
    table.put_item(Item=data)

# 아이템 조회
def get_item(pk: str):
    response = table.get_item(Key={'pk': pk})
    return response.get('Item')

# 쿼리
def query_items(pk: str):
    response = table.query(KeyConditionExpression=Key('pk').eq(pk))
    return response['Items']
```

## 네이밍 규칙
- 함수: `snake_case`
- 클래스: `PascalCase`
- 상수: `UPPER_CASE`
- 파일: `{action}_{resource}.py`

## 필수 에러 처리
- 모든 Lambda에 try-catch 적용
- 입력 검증 필수
- 로깅 포함
