import json
from typing import Dict, Any
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    """DynamoDB Decimal 타입을 JSON 직렬화하기 위한 커스텀 인코더"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def success_response(data: Any) -> Dict[str, Any]:
    """성공 응답 생성"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({'success': True, 'data': data}, cls=DecimalEncoder, ensure_ascii=False)
    }

def error_response(message: str, status_code: int = 400) -> Dict[str, Any]:
    """에러 응답 생성"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({'success': False, 'error': message}, ensure_ascii=False)
    }