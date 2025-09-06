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
        if not create_inquiry(inquiry_data):
            return error_response("문의 생성에 실패했습니다", 500)
        
        # AI 응답 생성 (임시로 기본 응답 사용)
        logger.info(f"AI 응답 생성 시작: {inquiry_id}")
        
        # 임시로 AI 생성을 우회하고 기본 응답 사용
        ai_response = f"안녕하세요! '{inquiry_data.get('title', '문의')}'에 대해 문의해주셔서 감사합니다. 담당자가 검토 후 24시간 내에 상세한 답변을 드리겠습니다. 추가 문의사항이 있으시면 언제든 연락해주세요."
        
        logger.info(f"기본 AI 응답 생성 완료: {inquiry_id}, 길이: {len(ai_response)}")
        
        # AI 응답을 DB에 저장
        logger.info(f"AI 응답 DB 저장 시도: {inquiry_id}")
        update_success = db_service.update_inquiry_ai_response(inquiry_id, ai_response)
        
        if not update_success:
            logger.error(f"AI 응답 저장 실패: {inquiry_id}")
            return success_response({
                'inquiryId': inquiry_id,
                'status': 'pending',
                'estimatedResponseTime': inquiry_data['estimatedResponseTime'],
                'message': '문의가 접수되었습니다. AI 응답 저장 중 오류가 발생하여 상담사가 직접 답변드리겠습니다.'
            })
        
        logger.info(f"AI 응답 DB 저장 완료, 상태를 ai_responded로 변경: {inquiry_id}")
        
        result = {
            'inquiryId': inquiry_id,
            'aiResponse': ai_response,
            'estimatedResponseTime': inquiry_data['estimatedResponseTime'],
            'status': 'ai_responded'
        }
        
        logger.info(f"문의 생성 및 AI 응답 완료: {inquiry_id}, status: ai_responded")
        
        return success_response(result)
        
    except Exception as e:
        logger.error(f"Error creating inquiry: {str(e)}")
        return error_response(str(e), 500)