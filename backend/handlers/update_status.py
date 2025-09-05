import json
import os
import sys
import logging
from datetime import datetime

# src 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

# 허용된 상태값
VALID_STATUSES = ['pending', 'in_progress', 'resolved', 'escalated']

def lambda_handler(event, context):
    """문의 상태 업데이트 Lambda 핸들러 (관리자용)"""
    try:
        # HTTP 메서드 확인
        if event.get('httpMethod') != 'PUT':
            return error_response("Method not allowed", 405)
        
        # 경로 파라미터에서 문의 ID 추출
        path_parameters = event.get('pathParameters') or {}
        inquiry_id = path_parameters.get('id')
        
        if not inquiry_id:
            return error_response("Inquiry ID is required")
        
        # 요청 본문 파싱
        body = json.loads(event.get('body', '{}'))
        new_status = body.get('status')
        
        if not new_status:
            return error_response("Status is required")
        
        # 상태값 검증
        if new_status not in VALID_STATUSES:
            return error_response(
                f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}"
            )
        
        # 문의 존재 확인
        inquiry = db_service.get_inquiry(inquiry_id)
        if not inquiry:
            return error_response("Inquiry not found", 404)
        
        # 상태 업데이트
        success = db_service.update_inquiry_status(inquiry_id, new_status)
        if not success:
            return error_response("Failed to update inquiry status", 500)
        
        # 성공 응답
        result = {
            'inquiryId': inquiry_id,
            'status': new_status,
            'updatedAt': datetime.utcnow().isoformat(),
            'previousStatus': inquiry.get('status')
        }
        
        logger.info(f"문의 상태 업데이트 완료: {inquiry_id} -> {new_status}")
        return success_response(result)
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON in request body")
    except Exception as e:
        logger.error(f"Error in update status: {str(e)}")
        return error_response("Internal server error", 500)