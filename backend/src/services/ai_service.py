import boto3
import json
from typing import Dict, Any
import logging
import sys
import os

# config 모듈 import를 위한 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
from config.ai_models import ai_model_config, analyze_request_complexity, get_request_priority

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class AIService:
    def __init__(self):
        self.bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.config = ai_model_config
    
    def generate_response(self, inquiry_data: Dict[str, Any], company_context: str = None) -> str:
        """AI 응답 생성 - converse API 사용"""
        try:
            logger.info(f"AI 응답 생성 시작: {inquiry_data.get('title', 'Unknown')}")
            
            # Claude 4.1 Opus 모델 사용 (최고 성능)
            model_id = "anthropic.claude-opus-4-1-20250805-v1:0"
            
            logger.info(f"사용할 모델: {model_id}")
            
            return self._call_converse_api_simple(inquiry_data, company_context, model_id)
            
        except Exception as e:
            logger.error(f"AI 응답 생성 중 오류: {str(e)}")
            import traceback
            logger.error(f"상세 오류: {traceback.format_exc()}")
            return self._get_smart_fallback_response(inquiry_data)
    
    def _call_converse_api_simple(self, inquiry_data: Dict[str, Any], company_context: str, model_id: str) -> str:
        """간단한 Converse API 호출"""
        try:
            prompt = self._build_prompt(inquiry_data, company_context)
            logger.info(f"생성된 프롬프트 길이: {len(prompt)}")
            
            conversation = [
                {
                    "role": "user",
                    "content": [{"text": prompt}]
                }
            ]
            
            logger.info(f"Bedrock 호출 시작: {model_id}")
            
            response = self.bedrock.converse(
                modelId=model_id,
                messages=conversation,
                inferenceConfig={
                    "maxTokens": 1000,
                    "temperature": 0.7,
                    "topP": 0.9
                }
            )
            
            logger.info("Bedrock 응답 수신 완료")
            
            ai_response = response["output"]["message"]["content"][0]["text"]
            
            logger.info(f"AI 응답 생성 완료: 길이 {len(ai_response)}")
            return ai_response
            
        except Exception as e:
            logger.error(f"Converse API 호출 실패: {str(e)}")
            import traceback
            logger.error(f"상세 오류: {traceback.format_exc()}")
            raise e
    
    def _invoke_converse_api(self, inquiry_data: Dict[str, Any], company_context: str, model_id: str) -> str:
        """Converse API를 사용한 모델 호출"""
        try:
            return self._call_converse_api(inquiry_data, company_context, model_id)
        except Exception as e:
            logger.warning(f"Primary model {model_id} failed: {str(e)}. Trying fallback model.")
            
            fallback_model = self.config.get_fallback_model()
            try:
                return self._call_converse_api(inquiry_data, company_context, fallback_model)
            except Exception as fallback_error:
                logger.error(f"Fallback model {fallback_model} also failed: {str(fallback_error)}")
                raise fallback_error
    
    def _call_converse_api(self, inquiry_data: Dict[str, Any], company_context: str, model_id: str) -> str:
        """Converse API 호출"""
        prompt = self._build_prompt(inquiry_data, company_context)
        
        conversation = [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ]
        
        model_params = self.config.get_model_parameters(model_id)
        
        response = self.bedrock.converse(
            modelId=model_id,
            messages=conversation,
            inferenceConfig={
                "maxTokens": model_params["body"]["max_tokens"],
                "temperature": model_params["body"]["temperature"],
                "topP": model_params["body"]["top_p"]
            }
        )
        
        ai_response = response["output"]["message"]["content"][0]["text"]
        
        logger.info(f"AI response generated using {model_id} for inquiry: {inquiry_data.get('title', 'Unknown')}")
        return ai_response
    
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
    
    def _get_smart_fallback_response(self, inquiry_data: Dict[str, Any]) -> str:
        """카테고리별 스마트 폴백 응답"""
        category = inquiry_data.get('category', 'general')
        title = inquiry_data.get('title', '문의')
        
        responses = {
            'technical': f"""안녕하세요, {title}에 대해 문의해주셔서 감사합니다.

기술적인 문제의 경우 다음 단계를 먼저 시도해보시기 바랍니다:
1. 브라우저 캐시 및 쿠키 삭제
2. 다른 브라우저나 시크릿 모드에서 재시도
3. 인터넷 연결 상태 확인

문제가 지속되면 담당자가 직접 도움을 드리겠습니다.

감사합니다.""",
            
            'billing': f"""안녕하세요, {title}에 대해 문의해주셔서 감사합니다.

결제 관련 문의는 보안상 담당자가 직접 처리해드립니다.
영업일 기준 24시간 내에 연락드리겠습니다.

긴급한 경우 고객센터로 직접 연락해주세요.

감사합니다.""",
            
            'general': f"""안녕하세요, {title}에 대해 문의해주셔서 감사합니다.

고객님의 문의를 정확히 파악하여 최적의 답변을 드리기 위해
담당자가 직접 검토 후 답변드리겠습니다.

평균 응답 시간은 2-4시간입니다.

감사합니다."""
        }
        
        return responses.get(category, responses['general'])