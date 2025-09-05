import json
import os
import sys
import uuid
from datetime import datetime
import logging

# src 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.utils.response import success_response, error_response
from src.utils.validation import validate_inquiry_data
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def lambda_handler(event, context):
    """통합 문의 처리 Lambda 핸들러"""
    try:
        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters') or {}
        
        if http_method == 'POST':
            # 문의 생성
            body = json.loads(event.get('body', '{}'))
            
            # 입력 검증
            validation_errors = validate_inquiry_data(body)
            if validation_errors:
                return error_response(f"Validation errors: {', '.join(validation_errors)}")
            
            # 문의 ID 생성
            inquiry_id = str(uuid.uuid4())
            
            # 문의 데이터 준비
            inquiry_data = {
                'inquiry_id': inquiry_id,
                'companyId': body['companyId'],
                'customerEmail': body['customerEmail'],
                'category': body.get('category', 'general'),
                'title': body['title'],
                'content': body['content'],
                'urgency': body.get('urgency', 'medium'),
                'status': 'pending',
                'created_at': datetime.utcnow().isoformat(),
                'estimatedResponseTime': 15
            }
            
            # DynamoDB에 저장
            db_service.create_inquiry(inquiry_data)
            
            result = {
                'inquiryId': inquiry_id,
                'status': 'pending',
                'estimatedResponseTime': 15,
                'createdAt': inquiry_data['created_at']
            }
            
            return success_response(result)
            
        elif http_method == 'GET':
            # 문의 조회
            inquiry_id = path_parameters.get('id')
            if not inquiry_id:
                return error_response("Inquiry ID is required")
            
            inquiry = db_service.get_inquiry(inquiry_id)
            if not inquiry:
                return error_response("Inquiry not found", 404)
            
            return success_response(inquiry)
        
        else:
            return error_response(f"Method {http_method} not allowed", 405)
            
    except Exception as e:
        logger.error(f"Error in inquiry handler: {str(e)}")
        return error_response("Internal server error", 500)