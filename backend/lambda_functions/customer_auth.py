import json
import os
import sys
from typing import Dict, Any
import logging

# src 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """고객 인증 Lambda 핸들러"""
    
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
        
        # POST /auth/customer/login
        if method == 'POST' and '/login' in path:
            return handle_customer_login(event, headers)
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'})
            }
            
    except Exception as e:
        logger.error(f"고객 인증 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': '서버 오류가 발생했습니다'}, ensure_ascii=False)
        }

def handle_customer_login(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """고객 로그인 처리"""
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': {'message': '이메일과 비밀번호를 입력해주세요'}
                }, ensure_ascii=False)
            }
        
        # 고객 인증 (문의 작성 시 사용한 이메일/비밀번호 확인)
        customer = verify_customer_credentials(email, password)
        
        if not customer:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': {'message': '이메일 또는 비밀번호가 잘못되었습니다'}
                }, ensure_ascii=False)
            }
        
        # 간단한 인증 성공 응답
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'data': {
                    'user': {
                        'email': email,
                        'role': 'customer'
                    }
                }
            }, ensure_ascii=False)
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': {'message': '잘못된 JSON 형식입니다'}
            }, ensure_ascii=False)
        }

def verify_customer_credentials(email: str, password: str) -> bool:
    """고객 인증 정보 확인 (문의 작성 시 사용한 이메일/비밀번호)"""
    try:
        # DynamoDB에서 해당 이메일로 작성된 문의 중 비밀번호가 일치하는 것이 있는지 확인
        inquiries = db_service.get_inquiries_by_email(email)
        
        if not inquiries:
            return False
        
        # 첫 번째 문의의 비밀번호와 비교 (간단한 구현)
        # 실제로는 해시된 비밀번호 비교해야 함
        for inquiry in inquiries:
            if inquiry.get('customerPassword') == password:
                return True
        
        return False
        
    except Exception as e:
        logger.error(f"고객 인증 확인 오류: {str(e)}")
        return False