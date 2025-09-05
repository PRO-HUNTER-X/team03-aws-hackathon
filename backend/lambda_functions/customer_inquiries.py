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
    """고객 문의 조회 Lambda 핸들러"""
    
    # CORS 헤더
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        logger.info(f"Customer inquiries request: {json.dumps(event)}")
        
        # 간단한 이메일 기반 인증
        query_params = event.get('queryStringParameters') or {}
        customer_email = query_params.get('email')
        
        logger.info(f"Query params: {query_params}")
        logger.info(f"Customer email: {customer_email}")
        
        if not customer_email:
            logger.warning("No email parameter provided")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': {'message': '이메일 파라미터가 필요합니다'}
                }, ensure_ascii=False)
            }
        
        # 고객의 문의 목록 조회
        logger.info(f"Fetching inquiries for email: {customer_email}")
        inquiries = db_service.get_inquiries_by_email(customer_email)
        logger.info(f"Retrieved {len(inquiries)} inquiries")
        
        # 비밀번호 필드 제거 (보안)
        for inquiry in inquiries:
            if 'customerPassword' in inquiry:
                del inquiry['customerPassword']
        
        response_data = {
            'success': True,
            'data': {
                'inquiries': inquiries,
                'count': len(inquiries)
            }
        }
        
        logger.info(f"Returning response: {len(inquiries)} inquiries found")
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response_data, ensure_ascii=False)
        }
        
    except Exception as e:
        import traceback
        error_msg = f"고객 문의 조회 오류: {str(e)}"
        logger.error(error_msg)
        logger.error(f"Traceback: {traceback.format_exc()}")
        
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': {'message': '서버 오류가 발생했습니다', 'details': str(e)}
            }, ensure_ascii=False)
        }