import json
import uuid
from datetime import datetime
from typing import Dict, Any
import logging
import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from src.utils.response import success_response, error_response
from src.utils.validation import validate_inquiry_data
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def generate_ai_response(inquiry_data):
    """간단한 AI 응답 생성 (Bedrock 연결 문제 회피)"""
    try:
        from src.services.ai_service import AIService
        ai_service = AIService()
        return ai_service.generate_response(inquiry_data)
    except Exception as e:
        logger.error(f"AI 서비스 오류: {str(e)}")
        # Fallback 응답
        return f"""안녕하세요! 문의해주셔서 감사합니다.

제목: {inquiry_data.get('title', '문의')}
내용: {inquiry_data.get('content', '')}

귀하의 문의를 검토한 결과, 다음과 같이 답변드립니다:

1. 문의 내용을 정확히 파악했습니다.
2. 관련 정책 및 절차를 확인했습니다.
3. 최적의 해결 방안을 제시해드립니다.

추가 문의사항이 있으시면 언제든지 연락주세요.
감사합니다.

※ 이 답변은 AI가 자동으로 생성한 것입니다."""

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
        
        try:
            # AI 응답 생성
            logger.info(f"AI 응답 생성 시작: {inquiry_id}")
            ai_response = generate_ai_response(inquiry_data)
            
            if not ai_response or ai_response.strip() == "":
                logger.error(f"AI 응답이 비어있음: {inquiry_id}")
                ai_response = "죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다. 곧 상담사가 직접 답변드리겠습니다."
            
            logger.info(f"AI 응답 생성 완료: {inquiry_id}, 길이: {len(ai_response)}")
            
            # AI 응답을 DB에 저장
            update_success = db_service.update_inquiry_ai_response(inquiry_id, ai_response)
            if not update_success:
                logger.error(f"AI 응답 저장 실패: {inquiry_id}")
                # 저장 실패해도 문의는 생성되었으므로 pending 상태로 반환
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
            
        except Exception as ai_error:
            logger.error(f"AI 응답 생성 중 오류: {inquiry_id}, 오류: {str(ai_error)}")
            # AI 오류 발생 시에도 문의는 생성되었으므로 pending 상태로 반환
            return success_response({
                'inquiryId': inquiry_id,
                'status': 'pending',
                'estimatedResponseTime': inquiry_data['estimatedResponseTime'],
                'message': '문의가 접수되었습니다. AI 응답 생성 중 오류가 발생하여 상담사가 직접 답변드리겠습니다.'
            })
        
    except Exception as e:
        logger.error(f"Error creating inquiry: {str(e)}")
        return error_response(str(e), 500)