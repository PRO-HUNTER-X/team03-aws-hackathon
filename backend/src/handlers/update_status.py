import json
from typing import Dict, Any
import logging

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def update_inquiry_status(inquiry_id: str, status: str, human_response: str = None):
    """문의 상태 업데이트 (DI를 위한 래퍼 함수)"""
    return db_service.update_inquiry_status(inquiry_id, status, human_response)

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        path_params = event.get('pathParameters', {}) or {}
        inquiry_id = path_params.get('id')
        body = json.loads(event.get('body', '{}'))
        
        new_status = body.get('status')
        human_response = body.get('humanResponse')
        
        if not inquiry_id:
            return error_response("Inquiry ID is required", 400)
        
        if not new_status:
            return error_response("Status is required", 400)
        
        valid_statuses = ['pending', 'ai_responded', 'escalated', 'resolved']
        if new_status not in valid_statuses:
            return error_response(f"Invalid status. Must be one of: {', '.join(valid_statuses)}", 400)
        
        updated_inquiry = update_inquiry_status(inquiry_id, new_status, human_response)
        
        if not updated_inquiry:
            return error_response("Inquiry not found", 404)
        
        return success_response(updated_inquiry)
        
    except Exception as e:
        logger.error(f"Error updating inquiry status: {str(e)}")
        return error_response(str(e), 500)