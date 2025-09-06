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
        
        # AI 응답 생성
        logger.info(f"AI 응답 생성 시작: {inquiry_id}")
        
        try:
            # 실제 AI 응답 생성
            ai_response = generate_ai_response(inquiry_data)
            
            if not ai_response or ai_response.strip() == "":
                logger.warning(f"AI 응답이 비어있음, 기본 응답 사용: {inquiry_id}")
                ai_response = f"안녕하세요! '{inquiry_data.get('title', '문의')}'에 대해 문의해주셔서 감사합니다. 담당자가 검토 후 24시간 내에 상세한 답변을 드리겠습니다."
            
            logger.info(f"AI 응답 생성 완료: {inquiry_id}, 길이: {len(ai_response)}")
            
        except Exception as e:
            logger.error(f"AI 응답 생성 중 오류: {inquiry_id}, 오류: {str(e)}")
            # AI 생성 실패 시 기본 응답 사용
            ai_response = f"안녕하세요! '{inquiry_data.get('title', '문의')}'에 대해 문의해주셔서 감사합니다. 현재 AI 서비스에 일시적인 문제가 발생하여 담당자가 직접 검토 후 답변드리겠습니다."
        
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