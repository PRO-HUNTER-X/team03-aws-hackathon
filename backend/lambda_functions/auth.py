import json
from typing import Dict, Any
from src.utils.auth import verify_password, create_access_token, verify_token

# 임시 관리자 계정 (실제로는 DynamoDB에서 관리)
ADMIN_USERS = {
    "admin@example.com": {
        "password": "$2b$12$tJjoyiaGUZsYKOLxCg0vi.uLfB3NjqkRyjGxybaFDgIgIb28oGxhi",  # "admin123"
        "name": "관리자",
        "role": "admin"
    }
}

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """인증 Lambda 핸들러"""
    
    # CORS 헤더
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    
    # OPTIONS 요청 처리
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': ''
        }
    
    try:
        path = event.get('path', '')
        method = event.get('httpMethod')
        
        # POST /auth/login
        if method == 'POST' and '/login' in path:
            return handle_login(event, headers)
        
        # POST /auth/verify
        elif method == 'POST' and '/verify' in path:
            return handle_verify(event, headers)
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def handle_login(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """로그인 처리"""
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '이메일과 비밀번호를 입력해주세요'}, ensure_ascii=False)
            }
        
        # 사용자 확인
        user = ADMIN_USERS.get(email)
        if not user or not verify_password(password, user['password']):
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': '이메일 또는 비밀번호가 잘못되었습니다'}, ensure_ascii=False)
            }
        
        # JWT 토큰 생성
        token_data = {
            "sub": email,
            "name": user['name'],
            "role": user['role']
        }
        access_token = create_access_token(token_data)
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'access_token': access_token,
                'token_type': 'bearer',
                'user': {
                    'email': email,
                    'name': user['name'],
                    'role': user['role']
                }
            }, ensure_ascii=False)
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': '잘못된 JSON 형식입니다'}, ensure_ascii=False)
        }

def handle_verify(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """토큰 검증"""
    try:
        # Authorization 헤더에서 토큰 추출
        auth_header = event.get('headers', {}).get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': '토큰이 필요합니다'}, ensure_ascii=False)
            }
        
        token = auth_header.split(' ')[1]
        payload = verify_token(token)
        
        if not payload:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': '유효하지 않은 토큰입니다'}, ensure_ascii=False)
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'valid': True,
                'user': {
                    'email': payload.get('sub'),
                    'name': payload.get('name'),
                    'role': payload.get('role')
                }
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 401,
            'headers': headers,
            'body': json.dumps({'error': '토큰 검증 실패'}, ensure_ascii=False)
        }