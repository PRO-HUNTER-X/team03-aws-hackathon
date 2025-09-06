import json
from typing import Dict, Any
import logging

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    """수동으로 AI 응답 업데이트 (테스트용)"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        inquiry_id = body.get('inquiry_id')
        ai_response = body.get('ai_response', '테스트 AI 응답입니다. 문의해주셔서 감사합니다.')
        
        if not inquiry_id:
            return error_response("inquiry_id is required", 400)
        
        logger.info(f"수동 AI 응답 업데이트 시작: {inquiry_id}")
        
        # 기존 문의 확인
        existing_inquiry = db_service.get_inquiry(inquiry_id)
        if not existing_inquiry:
            return error_response("문의를 찾을 수 없습니다", 404)
        
        logger.info(f"기존 문의 상태: {existing_inquiry.get('status')}")
        
        # AI 응답 업데이트
        success = db_service.update_inquiry_ai_response(inquiry_id, ai_response)
        
        if not success:
            return error_response("AI 응답 업데이트 실패", 500)
        
        # 업데이트 후 확인
        updated_inquiry = db_service.get_inquiry(inquiry_id)
        
        return success_response({
            'inquiry_id': inquiry_id,
            'updated': True,
            'new_status': updated_inquiry.get('status'),
            'has_ai_response': bool(updated_inquiry.get('aiResponse')),
            'ai_response_length': len(updated_inquiry.get('aiResponse', ''))
        })
        
    except Exception as e:
        logger.error(f"수동 AI 응답 업데이트 오류: {str(e)}")
        return error_response(str(e), 500)
