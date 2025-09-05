import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# 테스트 환경 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_고객_로그인_성공():
    """고객 로그인 성공 테스트"""
    # Given: 유효한 이메일/비밀번호
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': json.dumps({
            'email': 'test@example.com',
            'password': 'password123'
        }),
        'headers': {}
    }
    
    # Mock DynamoDB 응답
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
        
        # Then: 성공 응답
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert 'data' in body
        assert body['data']['user']['email'] == 'test@example.com'

def test_고객_로그인_실패_잘못된_비밀번호():
    """잘못된 비밀번호로 로그인 실패 테스트"""
    # Given: 잘못된 비밀번호
    event = {
        'httpMethod': 'POST',
        'path': '/auth/customer/login',
        'body': json.dumps({
            'email': 'test@example.com',
            'password': 'wrong_password'
        }),
        'headers': {}
    }
    
    # Mock DynamoDB 응답
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
        
        # Then: 실패 응답
        assert response['statusCode'] == 401
        body = json.loads(response['body'])
        assert body['success'] is False

def test_고객_문의_목록_조회_성공():
    """고객 문의 목록 조회 성공 테스트"""
    # Given: 유효한 고객 이메일
    event = {
        'httpMethod': 'GET',
        'path': '/my-inquiries',
        'headers': {},
        'queryStringParameters': {'email': 'test@example.com'}
    }
    
    # Mock DynamoDB 응답
    mock_inquiries = [
        {
            'inquiry_id': '123',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의 1',
            'status': 'pending'
        },
        {
            'inquiry_id': '456',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의 2',
            'status': 'ai_responded'
        }
    ]
    
    with patch('lambda_functions.customer_inquiries.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = mock_inquiries
        
        # When: 문의 목록 조회 API 호출
        from lambda_functions.customer_inquiries import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: 성공 응답
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert len(body['data']['inquiries']) == 2
        assert body['data']['count'] == 2

if __name__ == '__main__':
    pytest.main([__file__, '-v'])