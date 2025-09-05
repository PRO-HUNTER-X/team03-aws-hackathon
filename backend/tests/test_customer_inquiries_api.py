import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# 테스트 환경 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_고객_문의_조회_성공_빈_목록():
    """고객 문의 조회 성공 - 빈 목록 테스트"""
    # Given: 문의가 없는 고객 이메일
    event = {
        'httpMethod': 'GET',
        'path': '/my-inquiries',
        'headers': {},
        'queryStringParameters': {'email': 'new@example.com'}
    }
    
    with patch('lambda_functions.customer_inquiries.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = []
        
        # When: 문의 목록 조회 API 호출
        from lambda_functions.customer_inquiries import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: 성공 응답 (빈 목록)
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert len(body['data']['inquiries']) == 0
        assert body['data']['count'] == 0

def test_고객_문의_조회_이메일_파라미터_누락():
    """고객 문의 조회 실패 - 이메일 파라미터 누락 테스트"""
    # Given: 이메일 파라미터가 없는 요청
    event = {
        'httpMethod': 'GET',
        'path': '/my-inquiries',
        'headers': {},
        'queryStringParameters': None
    }
    
    # When: 문의 목록 조회 API 호출
    from lambda_functions.customer_inquiries import lambda_handler
    response = lambda_handler(event, None)
    
    # Then: 400 에러 응답
    assert response['statusCode'] == 400
    body = json.loads(response['body'])
    assert body['success'] is False
    assert '이메일 파라미터가 필요합니다' in body['error']['message']

def test_고객_문의_조회_비밀번호_필드_제거():
    """고객 문의 조회 시 비밀번호 필드 제거 테스트"""
    # Given: 비밀번호 필드가 포함된 문의 데이터
    event = {
        'httpMethod': 'GET',
        'path': '/my-inquiries',
        'headers': {},
        'queryStringParameters': {'email': 'test@example.com'}
    }
    
    mock_inquiries = [
        {
            'inquiry_id': '123',
            'customerEmail': 'test@example.com',
            'customerPassword': 'secret123',  # 이 필드가 제거되어야 함
            'title': '테스트 문의',
            'status': 'pending'
        }
    ]
    
    with patch('lambda_functions.customer_inquiries.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = mock_inquiries
        
        # When: 문의 목록 조회 API 호출
        from lambda_functions.customer_inquiries import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: 비밀번호 필드가 제거된 응답
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert 'customerPassword' not in body['data']['inquiries'][0]
        assert body['data']['inquiries'][0]['customerEmail'] == 'test@example.com'

def test_고객_문의_조회_CORS_헤더():
    """고객 문의 조회 응답에 CORS 헤더 포함 테스트"""
    # Given: 정상적인 요청
    event = {
        'httpMethod': 'GET',
        'path': '/my-inquiries',
        'headers': {},
        'queryStringParameters': {'email': 'test@example.com'}
    }
    
    with patch('lambda_functions.customer_inquiries.db_service') as mock_db:
        mock_db.get_inquiries_by_email.return_value = []
        
        # When: 문의 목록 조회 API 호출
        from lambda_functions.customer_inquiries import lambda_handler
        response = lambda_handler(event, None)
        
        # Then: CORS 헤더 포함
        assert 'Access-Control-Allow-Origin' in response['headers']
        assert response['headers']['Access-Control-Allow-Origin'] == '*'
        assert 'Access-Control-Allow-Methods' in response['headers']

def test_고객_문의_조회_OPTIONS_요청():
    """OPTIONS 요청 처리 테스트"""
    # Given: OPTIONS 요청
    event = {
        'httpMethod': 'OPTIONS',
        'path': '/my-inquiries',
        'headers': {}
    }
    
    # When: OPTIONS 요청 처리
    from lambda_functions.customer_inquiries import lambda_handler
    response = lambda_handler(event, None)
    
    # Then: 200 응답과 빈 body
    assert response['statusCode'] == 200
    assert response['body'] == ''
    assert 'Access-Control-Allow-Origin' in response['headers']

def test_DynamoDB_서비스_이메일별_조회_로깅():
    """DynamoDB 서비스 이메일별 조회 로깅 테스트"""
    # Given: DynamoDB 서비스
    from src.services.dynamodb_service import DynamoDBService
    
    mock_response = {
        'Items': [
            {
                'inquiry_id': '123',
                'customerEmail': 'test@example.com',
                'title': '테스트 문의'
            }
        ]
    }
    
    with patch('boto3.resource') as mock_boto3, \
         patch('src.services.dynamodb_service.logger') as mock_logger:
        
        mock_table = Mock()
        mock_table.scan.return_value = mock_response
        mock_boto3.return_value.Table.return_value = mock_table
        
        # When: 이메일별 문의 조회
        db_service = DynamoDBService()
        result = db_service.get_inquiries_by_email('test@example.com')
        
        # Then: 로깅 호출 확인
        mock_logger.info.assert_called()
        assert len(result) == 1

def test_DynamoDB_서비스_예외_처리():
    """DynamoDB 서비스 예외 처리 테스트"""
    # Given: DynamoDB 서비스와 예외 발생 상황
    from src.services.dynamodb_service import DynamoDBService
    
    with patch('boto3.resource') as mock_boto3, \
         patch('src.services.dynamodb_service.logger') as mock_logger:
        
        mock_table = Mock()
        mock_table.scan.side_effect = Exception("DynamoDB 연결 실패")
        mock_boto3.return_value.Table.return_value = mock_table
        
        # When: 이메일별 문의 조회 (예외 발생)
        db_service = DynamoDBService()
        result = db_service.get_inquiries_by_email('test@example.com')
        
        # Then: 빈 목록 반환 및 에러 로깅
        assert result == []
        mock_logger.error.assert_called()

if __name__ == '__main__':
    pytest.main([__file__, '-v'])