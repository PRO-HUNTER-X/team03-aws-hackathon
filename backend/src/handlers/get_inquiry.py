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
    try:
        path_params = event.get('pathParameters', {}) or {}
        inquiry_id = path_params.get('id')
        
        if not inquiry_id:
            return error_response("Inquiry ID is required", 400)
        
        inquiry = get_inquiry(inquiry_id)
        
        if not inquiry:
            return error_response("Inquiry not found", 404)
        
        return success_response(inquiry)
        
    except Exception as e:
        logger.error(f"Error getting inquiry: {str(e)}")
        return error_response(str(e), 500)