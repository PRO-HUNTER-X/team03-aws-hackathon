import json
from typing import Dict, Any
import logging

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService
from src.services.email_service import EmailService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()
email_service = EmailService()

def get_inquiry(inquiry_id: str):
    """문의 조회 (DI를 위한 래퍼 함수)"""
    return db_service.get_inquiry(inquiry_id)

def update_inquiry_status(inquiry_id: str, status: str, human_response: str = None):
    """문의 상태 업데이트 (DI를 위한 래퍼 함수)"""
    return db_service.update_inquiry_status(inquiry_id, status, human_response)

def send_escalation_email(inquiry: Dict[str, Any], reason: str) -> bool:
    """에스컬레이션 이메일 발송 (DI를 위한 래퍼 함수)"""
    return email_service.send_escalation_email(inquiry, reason)

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        path_params = event.get('pathParameters', {}) or {}
        inquiry_id = path_params.get('id')
        body = json.loads(event.get('body', '{}'))
        
        reason = body.get('reason', 'Customer requested human assistance')
        
        if not inquiry_id:
            return error_response("Inquiry ID is required", 400)
        
        # 문의 정보 조회
        inquiry = get_inquiry(inquiry_id)
        if not inquiry:
            return error_response("Inquiry not found", 404)
        
        # 상태를 escalated로 업데이트
        updated_inquiry = update_inquiry_status(inquiry_id, 'escalated', None)
        
        # 에스컬레이션 이메일 발송
        email_sent = send_escalation_email(inquiry, reason)
        
        result = {
            'inquiryId': inquiry_id,
            'status': 'escalated',
            'reason': reason,
            'emailSent': email_sent,
            'estimatedResponseTime': 120  # 2시간으로 업데이트
        }
        
        return success_response(result)
        
    except Exception as e:
        logger.error(f"Error escalating inquiry: {str(e)}")
        return error_response(str(e), 500)