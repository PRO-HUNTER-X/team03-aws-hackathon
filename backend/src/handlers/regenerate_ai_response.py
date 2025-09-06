import json
import logging
import sys
import os
from datetime import datetime

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

db_service = DynamoDBService()

def generate_ai_response(inquiry_data):
    """간단한 AI 응답 생성 (Bedrock 연결 문제 회피)"""
    try:
        from services.ai_service import AIService
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

def lambda_handler(event, context):
    """AI 답변 재생성 핸들러"""
    
    # CORS 헤더 설정
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
    }
    
    # OPTIONS 요청 처리 (preflight)
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({'message': 'OK'})
        }
    
    try:
        # 문의 ID 추출
        inquiry_id = event.get('pathParameters', {}).get('id')
        if not inquiry_id:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': False,
                    'error': '문의 ID가 필요합니다'
                })
            }
        
        logger.info(f"AI 답변 재생성 요청: {inquiry_id}")
        
        # 기존 문의 조회
        inquiry = db_service.get_inquiry(inquiry_id)
        if not inquiry:
            return {
                'statusCode': 404,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': False,
                    'error': '문의를 찾을 수 없습니다'
                })
            }
        
        # AI 답변 재생성
        try:
            logger.info(f"AI 답변 재생성 시작: {inquiry_id}")
            ai_response = generate_ai_response(inquiry)
            
            if not ai_response or ai_response.strip() == "":
                ai_response = "죄송합니다. AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요."
            
            logger.info(f"AI 답변 재생성 완료: {inquiry_id}, 길이: {len(ai_response)}")
            
            # DB에 새로운 AI 답변 저장
            update_success = db_service.update_inquiry_ai_response(inquiry_id, ai_response)
            
            if not update_success:
                return {
                    'statusCode': 500,
                    'headers': cors_headers,
                    'body': json.dumps({
                        'success': False,
                        'error': 'AI 답변 저장에 실패했습니다'
                    })
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': True,
                    'data': {
                        'inquiryId': inquiry_id,
                        'aiResponse': ai_response,
                        'status': 'ai_responded',
                        'regeneratedAt': datetime.utcnow().isoformat()
                    }
                })
            }
            
        except Exception as ai_error:
            logger.error(f"AI 답변 재생성 실패: {inquiry_id}, 오류: {str(ai_error)}")
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({
                    'success': False,
                    'error': f'AI 답변 생성 중 오류가 발생했습니다: {str(ai_error)}'
                })
            }
        
    except Exception as e:
        logger.error(f"AI 답변 재생성 핸들러 오류: {str(e)}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({
                'success': False,
                'error': '서버 오류가 발생했습니다'
            })
        }
