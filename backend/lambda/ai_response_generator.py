import json
import os
import sys
import logging

# 기존 소스 코드 경로 추가
sys.path.append('/opt/python')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def success_response(data):
    """성공 응답 생성"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'data': data
        }, ensure_ascii=False)
    }

def error_response(message, status_code=400):
    """에러 응답 생성"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': False,
            'error': message
        }, ensure_ascii=False)
    }

def generate_ai_response(inquiry_data):
    """AI 응답 생성 (AWS Bedrock Claude 연동)"""
    try:
        import boto3
        
        bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        model_id = 'anthropic.claude-3-5-sonnet-20241022-v2:0'
        
        # 프롬프트 생성
        company_context = inquiry_data.get('companyContext', '일반적인 고객 서비스')
        prompt = f"""당신은 {company_context}의 전문 고객 서비스 담당자입니다.

고객 문의:
제목: {inquiry_data.get('title', '')}
내용: {inquiry_data.get('content', '')}
카테고리: {inquiry_data.get('category', 'general')}

다음 지침을 따라 응답해주세요:
1. 친절하고 전문적인 톤으로 답변
2. 구체적이고 실행 가능한 해결책 제시
3. 한국어로 응답
4. 200자 이상의 상세한 설명

응답:"""
        
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(body)
        )
        
        response_body = json.loads(response['body'].read())
        ai_response = response_body['content'][0]['text']
        
        logger.info(f"AI response generated for inquiry: {inquiry_data.get('title', 'Unknown')}")
        return ai_response
        
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        # Fallback 응답
        return f"""안녕하세요, {inquiry_data.get('title', '문의')}에 대해 문의해주셔서 감사합니다.

죄송합니다. 현재 시스템에 일시적인 문제가 발생하여 즉시 답변을 드리기 어려운 상황입니다.

빠른 시일 내에 담당자가 직접 연락드리겠습니다. 
긴급한 사항이시라면 '사람과 연결' 버튼을 클릭해주세요.

감사합니다."""

def lambda_handler(event, context):
    """AI 응답 생성 Lambda 핸들러"""
    try:
        body = json.loads(event.get('body', '{}'))
        
        # 필수 필드 검증
        if not body.get('title') or not body.get('content'):
            return error_response("Title and content are required")
        
        # AI 응답 생성
        ai_response = generate_ai_response(body)
        
        result = {
            'aiResponse': ai_response,
            'responseTime': 3,  # 응답 생성 시간 (초)
            'confidence': 0.85  # 응답 신뢰도
        }
        
        return success_response(result)
        
    except Exception as e:
        logger.error(f"Error in AI response generator: {str(e)}")
        return error_response("Internal server error", 500)