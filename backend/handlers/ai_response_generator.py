import json
import os
import sys
import logging

# src 모듈 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.utils.response import success_response, error_response
from src.services.ai_service import AIService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
ai_service = AIService()

def lambda_handler(event, context):
    """AI 응답 생성 Lambda 핸들러"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # 필수 필드 검증
        if not body.get('title') or not body.get('content'):
            return error_response("Title and content are required")
        
        # AI 응답 생성
        ai_response = ai_service.generate_response(body)
        
        result = {
            'aiResponse': ai_response,
            'responseTime': 3,
            'confidence': 0.85
        }
        
        return success_response(result)
        
    except Exception as e:
        logger.error(f"Error in AI response generator: {str(e)}")
        return error_response("Internal server error", 500)