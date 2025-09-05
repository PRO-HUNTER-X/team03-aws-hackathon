import pytest
from unittest.mock import patch, MagicMock
from src.services.ai_service import AIService


class TestAIService:
    
    def setup_method(self, method):
        """각 테스트 전에 실행되는 설정"""
        self.ai_service = AIService()
    
    def test_generate_response_success(self):
        """AI 응답 생성 성공 테스트"""
        inquiry_data = {
            'companyId': 'test-company',
            'title': '로그인 문제',
            'content': '로그인이 안됩니다',
            'category': 'technical'
        }
        
        mock_response = {
            'body': MagicMock()
        }
        mock_response['body'].read.return_value = b'{"content": [{"text": "Login issue resolution guide"}]}'
        
        with patch.object(self.ai_service.bedrock, 'invoke_model') as mock_invoke:
            mock_invoke.return_value = mock_response
            
            result = self.ai_service.generate_response(inquiry_data)
            
            assert isinstance(result, str)
            assert len(result) > 0
            assert 'Login' in result or len(result) > 10
    
    def test_generate_response_bedrock_error(self):
        """Bedrock 오류 시 기본 응답 테스트"""
        inquiry_data = {
            'companyId': 'test-company',
            'title': '테스트 문의',
            'content': '테스트 내용'
        }
        
        with patch.object(self.ai_service.bedrock, 'invoke_model') as mock_invoke:
            mock_invoke.side_effect = Exception("Bedrock 연결 오류")
            
            result = self.ai_service.generate_response(inquiry_data)
            
            assert isinstance(result, str)
            assert '죄송합니다' in result
    
    def test_build_prompt_includes_context(self):
        """프롬프트에 컨텍스트 포함 테스트"""
        inquiry_data = {
            'title': '결제 문의',
            'content': '결제가 안됩니다',
            'category': 'payment'
        }
        
        prompt = self.ai_service._build_prompt(inquiry_data, "테스트 회사")
        
        assert '결제 문의' in prompt
        assert '결제가 안됩니다' in prompt
        assert '테스트 회사' in prompt