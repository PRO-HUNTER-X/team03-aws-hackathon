import json
from typing import Dict, Any
import logging

from src.utils.middleware import admin_required
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

@admin_required
def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """문의 상태 업데이트 Lambda 핸들러"""
    
    # CORS 헤더
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PUT, OPTIONS",
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
        
        body = json.loads(event.get('body', '{}'))
        new_status = body.get('status')
        
        if not new_status:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'success': False,
                    'error': {'message': '상태값이 필요합니다'}
                }, ensure_ascii=False)
            }
        
        # 상태 업데이트
        success = db_service.update_inquiry_status(inquiry_id, new_status)
        
        if not success:
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
                'message': '상태가 업데이트되었습니다'
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
    except Exception as e:
        logger.error(f"상태 업데이트 중 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'success': False,
                'error': {'message': '서버 오류가 발생했습니다'}
            }, ensure_ascii=False)
        }