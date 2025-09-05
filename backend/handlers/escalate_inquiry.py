import json
import os
import sys
import logging
from datetime import datetime

# src 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService
from src.services.email_service import EmailService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()
email_service = EmailService()

def lambda_handler(event, context):
    """문의 에스컬레이션 Lambda 핸들러"""
    try:
        # HTTP 메서드 확인
        if event.get('httpMethod') != 'POST':
            return error_response("Method not allowed", 405)
        
        # 경로 파라미터에서 문의 ID 추출
        path_parameters = event.get('pathParameters') or {}
        inquiry_id = path_parameters.get('id')
        
        if not inquiry_id:
            return error_response("Inquiry ID is required")
        
        # 요청 본문 파싱
        body = json.loads(event.get('body', '{}'))
        reason = body.get('reason', '고객이 에스컬레이션을 요청했습니다')
        
        # 문의 존재 확인
        inquiry = db_service.get_inquiry(inquiry_id)
        if not inquiry:
            return error_response("Inquiry not found", 404)
        
        # 이미 에스컬레이션된 문의 확인
        if inquiry.get('status') == 'escalated':
            return error_response("Inquiry is already escalated", 400)
        
        # 상태를 'escalated'로 업데이트
        success = db_service.update_inquiry_status(inquiry_id, 'escalated')
        if not success:
            return error_response("Failed to update inquiry status", 500)
        
        # 관리자에게 이메일 알림 발송
        try:
            email_service.send_escalation_notification(inquiry, reason)
        except Exception as e:
            logger.warning(f"Failed to send escalation email: {str(e)}")
            # 이메일 실패해도 에스컬레이션은 성공으로 처리
        
        # 성공 응답
        result = {
            'inquiryId': inquiry_id,
            'status': 'escalated',
            'escalatedAt': datetime.utcnow().isoformat(),
            'reason': reason
        }
        
        logger.info(f"문의 에스컬레이션 완료: {inquiry_id}")
        return success_response(result)
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body")
    except Exception as e:
        logger.error(f"Error in escalate inquiry: {str(e)}")
        return error_response("Internal server error", 500)