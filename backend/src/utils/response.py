import json
from typing import Dict, Any

def success_response(data: Any) -> Dict[str, Any]:
    """성공 응답 생성"""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'data': data})
    }

def error_response(message: str, status_code: int) -> Dict[str, Any]:
    """에러 응답 생성"""
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': False, 'error': message})
    }