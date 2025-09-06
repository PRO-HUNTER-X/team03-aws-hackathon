import json
import logging
from datetime import datetime
from src.services.dynamodb_service import DynamoDBService
from src.services.ai_service import generate_ai_response
from src.utils.response import success_response, error_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

db_service = DynamoDBService()

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
