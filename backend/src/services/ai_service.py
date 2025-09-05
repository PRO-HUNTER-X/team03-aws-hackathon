import boto3
import json
from typing import Dict, Any
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class AIService:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.model_id = 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    
    def generate_response(self, inquiry_data: Dict[str, Any], company_context: str = None) -> str:
        """AI 응답 생성"""
        try:
            prompt = self._build_prompt(inquiry_data, company_context)
            
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
            
            response = self.bedrock.invoke_model(
                modelId=self.model_id,
                body=json.dumps(body)
            )
            
            response_body = json.loads(response['body'].read())
            ai_response = response_body['content'][0]['text']
            
            logger.info(f"AI response generated for inquiry: {inquiry_data.get('title', 'Unknown')}")
            return ai_response
            
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            return self._get_fallback_response(inquiry_data)
    
    def _build_prompt(self, inquiry_data: Dict[str, Any], company_context: str = None) -> str:
        """프롬프트 생성"""
        context = company_context or "일반적인 고객 서비스"
        
        prompt = f"""당신은 {context}의 전문 고객 서비스 담당자입니다.

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
        
        return prompt
    
    def _get_fallback_response(self, inquiry_data: Dict[str, Any]) -> str:
        """기본 응답 (AI 오류 시)"""
        return f"""안녕하세요, {inquiry_data.get('title', '문의')}에 대해 문의해주셔서 감사합니다.

죄송합니다. 현재 시스템에 일시적인 문제가 발생하여 즉시 답변을 드리기 어려운 상황입니다.

빠른 시일 내에 담당자가 직접 연락드리겠습니다. 
긴급한 사항이시라면 '사람과 연결' 버튼을 클릭해주세요.

감사합니다."""