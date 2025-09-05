import pytest
import json
from unittest.mock import patch
from lambda_functions.auth import lambda_handler, handle_login, handle_verify

class TestAuthHandler:
    """인증 핸들러 테스트"""
    
    def test_로그인_성공(self):
        """올바른 이메일/비밀번호로 로그인 성공"""
        event = {
            'httpMethod': 'POST',
            'path': '/auth/login',
            'body': json.dumps({
                'email': 'admin@example.com',
                'password': 'admin123'
            })
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'access_token' in body
        assert body['user']['email'] == 'admin@example.com'
    
    def test_로그인_실패_잘못된_비밀번호(self):
        """잘못된 비밀번호로 로그인 실패"""
        event = {
            'httpMethod': 'POST',
            'path': '/auth/login',
            'body': json.dumps({
                'email': 'admin@example.com',
                'password': 'wrongpassword'
            })
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 401
        body = json.loads(response['body'])
        assert 'error' in body
    
    def test_로그인_실패_존재하지_않는_사용자(self):
        """존재하지 않는 사용자로 로그인 실패"""
        event = {
            'httpMethod': 'POST',
            'path': '/auth/login',
            'body': json.dumps({
                'email': 'nonexistent@example.com',
                'password': 'admin123'
            })
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 401
    
    def test_로그인_실패_필수_필드_누락(self):
        """이메일 또는 비밀번호 누락시 실패"""
        event = {
            'httpMethod': 'POST',
            'path': '/auth/login',
            'body': json.dumps({
                'email': 'admin@example.com'
                # password 누락
            })
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert '이메일과 비밀번호를 입력해주세요' in body['error']
    
    @patch('lambda_functions.auth.verify_token')
    def test_토큰_검증_성공(self, mock_verify_token):
        """유효한 토큰으로 검증 성공"""
        mock_verify_token.return_value = {
            'sub': 'admin@example.com',
            'name': '관리자',
            'role': 'admin'
        }
        
        event = {
            'httpMethod': 'POST',
            'path': '/auth/verify',
            'headers': {
                'Authorization': 'Bearer valid_token'
            }
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['valid'] is True
        assert body['user']['email'] == 'admin@example.com'
    
    def test_토큰_검증_실패_토큰_없음(self):
        """토큰 없이 검증 요청시 실패"""
        event = {
            'httpMethod': 'POST',
            'path': '/auth/verify',
            'headers': {}
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 401
        body = json.loads(response['body'])
        assert '토큰이 필요합니다' in body['error']
    
    def test_CORS_OPTIONS_요청_처리(self):
        """CORS preflight 요청 처리"""
        event = {
            'httpMethod': 'OPTIONS',
            'path': '/auth/login'
        }
        
        response = lambda_handler(event, None)
        
        assert response['statusCode'] == 200
        assert 'Access-Control-Allow-Origin' in response['headers']
        assert response['headers']['Access-Control-Allow-Origin'] == '*'