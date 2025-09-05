import json
from typing import Dict, Any
import logging

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def get_inquiry(inquiry_id: str):
    """문의 조회 (DI를 위한 래퍼 함수)"""
    return db_service.get_inquiry(inquiry_id)

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """문의 조회 Lambda 핸들러"""
    
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
        path_params = event.get('pathParameters', {}) or {}
        inquiry_id = path_params.get('id')
        
        if not inquiry_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': {'message': '문의 ID가 필요합니다'}
                }, ensure_ascii=False)
            }
        
        inquiry = get_inquiry(inquiry_id)
        
        if not inquiry:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': {'message': '문의를 찾을 수 없습니다'}
                }, ensure_ascii=False)
            }
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'success': True,
                'data': inquiry
            }, ensure_ascii=False)
        }
        
    except Exception as e:
        logger.error(f"문의 조회 중 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': {'message': '서버 오류가 발생했습니다'}
            }, ensure_ascii=False)
        }