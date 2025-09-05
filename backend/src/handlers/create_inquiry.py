import json
import uuid
from datetime import datetime
from typing import Dict, Any
import logging

from src.utils.response import success_response, error_response
from src.utils.validation import validate_inquiry_data
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def create_inquiry(inquiry_data: Dict[str, Any]) -> bool:
    """문의 생성 (DI를 위한 래퍼 함수)"""
    return db_service.create_inquiry(inquiry_data)

def generate_ai_response(inquiry_data: Dict[str, Any]) -> str:
    """AI 응답 생성"""
    from src.services.ai_service import AIService
    ai_service = AIService()
    return ai_service.generate_response(inquiry_data)

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body', '{}'))
        
        # 입력 검증
        validation_errors = validate_inquiry_data(body)
        if validation_errors:
            return error_response(f"Validation errors: {', '.join(validation_errors)}", 400)
        
        # 문의 ID 생성
        inquiry_id = str(uuid.uuid4())
        
        # 문의 데이터 준비
        inquiry_data = {
            'inquiry_id': inquiry_id,
            'companyId': body['companyId'],
            'customerEmail': body['customerEmail'],
            'customerPassword': body.get('customerPassword'),  # 고객 인증용 비밀번호 저장
            'category': body.get('category', 'general'),
            'title': body['title'],
            'content': body['content'],
            'urgency': body.get('urgency', 'medium'),
            'status': 'pending',
            'created_at': datetime.utcnow().isoformat(),
            'estimatedResponseTime': 15
        }
        
        # DynamoDB에 저장
        create_inquiry(inquiry_data)
        
        # AI 응답 생성
        ai_response = generate_ai_response(inquiry_data)
        
        result = {
            'inquiryId': inquiry_id,
            'aiResponse': ai_response,
            'estimatedResponseTime': inquiry_data['estimatedResponseTime'],
            'status': 'ai_responded'
        }
        
        return success_response(result)
        
    except Exception as e:
        logger.error(f"Error creating inquiry: {str(e)}")
        return error_response(str(e), 500)