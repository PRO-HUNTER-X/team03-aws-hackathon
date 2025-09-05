import pytest
import json
from unittest.mock import Mock, patch, MagicMock
import sys
import os

# 테스트 대상 모듈 import를 위한 경로 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '../lambda'))
sys.path.append(os.path.join(os.path.dirname(__file__), '../src/services'))
sys.path.append(os.path.join(os.path.dirname(__file__), '../config'))

from ai_response_generator import generate_ai_response, lambda_handler

class TestAIServiceIntegration:
    """AI 서비스 연동 테스트"""
    
    def test_AI_서비스_정상_응답_생성(self):
        """AI 서비스가 정상적으로 응답을 생성하는지 테스트"""
        # Given
        inquiry_data = {
            'title': '로그인 문제',
            'content': '로그인이 안됩니다',
            'category': 'technical',
            'urgency': 'medium'
        }
        
        expected_response = "안녕하세요, 로그인 문제에 대해 도움을 드리겠습니다..."
        
        # Mock AI 서비스
        with patch('ai_service.AIService') as mock_ai_service:
            mock_instance = Mock()
            mock_instance.generate_response.return_value = expected_response
            mock_ai_service.return_value = mock_instance
            
            # When
            result = generate_ai_response(inquiry_data)
            
            # Then
            assert result == expected_response
            mock_instance.generate_response.assert_called_once_with(inquiry_data)
    
    def test_AI_서비스_오류시_폴백_응답(self):
        """AI 서비스 오류 시 폴백 응답을 반환하는지 테스트"""
        # Given
        inquiry_data = {
            'title': '테스트 문의',
            'content': '테스트 내용',
            'category': 'general'
        }
        
        # Mock AI 서비스가 예외 발생
        with patch('ai_service.AIService') as mock_ai_service:
            mock_ai_service.side_effect = Exception("Bedrock 연결 실패")
            
            # When
            result = generate_ai_response(inquiry_data)
            
            # Then
            assert "안녕하세요, 테스트 문의에 대해 문의해주셔서 감사합니다" in result
            assert "일시적인 문제가 발생하여" in result
    
    def test_Lambda_핸들러_AI_응답_생성_성공(self):
        """Lambda 핸들러가 AI 응답을 성공적으로 생성하는지 테스트"""
        # Given
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({
                'title': 'API 테스트',
                'content': 'AI 응답 테스트입니다',
                'category': 'technical'
            })
        }
        context = {}
        
        expected_ai_response = "테스트 응답입니다."
        
        # Mock generate_ai_response
        with patch('ai_response_generator.generate_ai_response') as mock_generate:
            mock_generate.return_value = expected_ai_response
            
            # When
            response = lambda_handler(event, context)
            
            # Then
            assert response['statusCode'] == 200
            
            body = json.loads(response['body'])
            assert body['success'] is True
            assert body['data']['aiResponse'] == expected_ai_response
            assert 'responseTime' in body['data']
            assert 'confidence' in body['data']
    
    def test_Lambda_핸들러_필수_필드_검증(self):
        """Lambda 핸들러가 필수 필드를 검증하는지 테스트"""
        # Given - title 누락
        event = {
            'httpMethod': 'POST',
            'body': json.dumps({
                'content': '내용만 있음',
                'category': 'technical'
            })
        }
        context = {}
        
        # When
        response = lambda_handler(event, context)
        
        # Then
        assert response['statusCode'] == 400
        
        body = json.loads(response['body'])
        assert body['success'] is False
        assert "Title and content are required" in body['error']
    
    def test_Lambda_핸들러_CORS_헤더_포함(self):
        """Lambda 핸들러 응답에 CORS 헤더가 포함되는지 테스트"""
        # Given
        event = {
            'httpMethod': 'OPTIONS'
        }
        context = {}
        
        # When
        response = lambda_handler(event, context)
        
        # Then
        assert response['statusCode'] == 200
        assert 'Access-Control-Allow-Origin' in response['headers']
        assert response['headers']['Access-Control-Allow-Origin'] == '*'
        assert 'Access-Control-Allow-Methods' in response['headers']

if __name__ == '__main__':
    pytest.main([__file__])