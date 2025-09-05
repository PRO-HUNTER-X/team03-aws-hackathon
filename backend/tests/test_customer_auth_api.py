import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# 테스트 환경 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_고객_로그인_성공_응답_형식():
    """고객 로그인 성공 시 응답 형식 테스트"""
    # Given: 유효한 로그인 정보
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': json.dumps({
            'email': 'test@example.com',
            'password': 'password123'
        }),
        'headers': {}
    }
    
    mock_inquiries = [
        {
            'inquiry_id': '123',
            'customerEmail': 'test@example.com',
            'customerPassword': 'password123',
            'title': '테스트 문의'
        }
    ]
    
    with patch('lambda_functions.customer_auth.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = mock_inquiries
        
        # When: 로그인 API 호출
        from lambda_functions.customer_auth import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: 올바른 응답 형식
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert 'data' in body
        assert 'user' in body['data']
        assert body['data']['user']['email'] == 'test@example.com'
        assert body['data']['user']['role'] == 'customer'

def test_고객_로그인_실패_존재하지_않는_이메일():
    """존재하지 않는 이메일로 로그인 실패 테스트"""
    # Given: 존재하지 않는 이메일
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': json.dumps({
            'email': 'nonexistent@example.com',
            'password': 'password123'
        }),
        'headers': {}
    }
    
    with patch('lambda_functions.customer_auth.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = []  # 빈 목록
        
        # When: 로그인 API 호출
        from lambda_functions.customer_auth import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: 401 에러 응답
        assert response['statusCode'] == 401
        body = json.loads(response['body'])
        assert body['success'] is False
        assert '이메일 또는 비밀번호가 잘못되었습니다' in body['error']['message']

def test_고객_로그인_잘못된_JSON_형식():
    """잘못된 JSON 형식으로 로그인 실패 테스트"""
    # Given: 잘못된 JSON 형식
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': 'invalid json',
        'headers': {}
    }
    
    # When: 로그인 API 호출
    from lambda_functions.customer_auth import lambda_handler
    response = lambda_handler(event, None)
    
    # Then: 400 에러 응답
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert body['success'] is False
    assert '잘못된 JSON 형식입니다' in body['error']['message']

def test_고객_로그인_필수_필드_누락():
    """필수 필드 누락으로 로그인 실패 테스트"""
    # Given: 이메일 누락
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': json.dumps({
            'password': 'password123'
            # email 필드 누락
        }),
        'headers': {}
    }
    
    # When: 로그인 API 호출
    from lambda_functions.customer_auth import lambda_handler
    response = lambda_handler(event, None)
    
    # Then: 400 에러 응답
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert body['success'] is False
    assert '이메일과 비밀번호를 입력해주세요' in body['error']['message']

def test_고객_로그인_CORS_헤더():
    """고객 로그인 응답에 CORS 헤더 포함 테스트"""
    # Given: 정상적인 로그인 요청
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': json.dumps({
            'email': 'test@example.com',
            'password': 'password123'
        }),
        'headers': {}
    }
    
    mock_inquiries = [
        {
            'customerEmail': 'test@example.com',
            'customerPassword': 'password123'
        }
    ]
    
    with patch('lambda_functions.customer_auth.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = mock_inquiries
        
        # When: 로그인 API 호출
        from lambda_functions.customer_auth import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: CORS 헤더 포함
        assert 'Access-Control-Allow-Origin' in response['headers']
        assert response['headers']['Access-Control-Allow-Origin'] == '*'

def test_고객_인증_verify_credentials_함수():
    """고객 인증 verify_credentials 함수 테스트"""
    # Given: 인증 정보
    email = 'test@example.com'
    password = 'password123'
    
    mock_inquiries = [
        {
            'customerEmail': 'test@example.com',
            'customerPassword': 'password123'
        },
        {
            'customerEmail': 'test@example.com',
            'customerPassword': 'different_password'
        }
    ]
    
    with patch('lambda_functions.customer_auth.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = mock_inquiries
        
        # When: 인증 확인
        from lambda_functions.customer_auth import verify_customer_credentials
        result = verify_customer_credentials(email, password)
        
        # Then: 인증 성공
        assert result is True

def test_고객_인증_verify_credentials_실패():
    """고객 인증 verify_credentials 실패 테스트"""
    # Given: 잘못된 인증 정보
    email = 'test@example.com'
    password = 'wrong_password'
    
    mock_inquiries = [
        {
            'customerEmail': 'test@example.com',
            'customerPassword': 'correct_password'
        }
    ]
    
    with patch('lambda_functions.customer_auth.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = mock_inquiries
        
        # When: 인증 확인
        from lambda_functions.customer_auth import verify_customer_credentials
        result = verify_customer_credentials(email, password)
        
        # Then: 인증 실패
        assert result is False

if __name__ == '__main__':
    pytest.main([__file__, '-v'])