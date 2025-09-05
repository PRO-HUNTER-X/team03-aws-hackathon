import json
from typing import Dict, Any, Callable
from .auth import verify_token

def require_auth(handler: Callable) -> Callable:
    """인증이 필요한 엔드포인트를 위한 데코레이터"""
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
        
        # OPTIONS 요청 처리
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': headers,
                'body': ''
            }
        
        # Authorization 헤더 확인 (대소문자 구분 없이)
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization', '')
        if not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': '인증이 필요합니다'})
            }
        
        # 토큰 검증
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': '유효하지 않은 토큰입니다'})
            }
        
        # 사용자 정보를 event에 추가
        event['user'] = {
            'email': payload.get('sub'),
            'name': payload.get('name'),
            'role': payload.get('role')
        }
        
        return handler(event, context)
    
    return wrapper

def admin_required(handler: Callable) -> Callable:
    """관리자 권한이 필요한 엔드포인트를 위한 데코레이터"""
    @require_auth
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
        
        user = event.get('user', {})
        if user.get('role') != 'admin':
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': '관리자 권한이 필요합니다'})
            }
        
        return handler(event, context)
    
    return wrapper