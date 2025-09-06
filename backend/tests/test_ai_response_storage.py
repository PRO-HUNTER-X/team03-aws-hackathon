import pytest
from unittest.mock import Mock, patch
from src.handlers.create_inquiry import lambda_handler
from src.services.dynamodb_service import DynamoDBService
import json

@pytest.fixture
def mock_dynamodb_service():
    return Mock(spec=DynamoDBService)

@pytest.fixture
def sample_inquiry_event():
    return {
        'body': json.dumps({
            'companyId': 'test-company',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의',
            'content': '테스트 내용입니다',
            'category': 'general',
            'urgency': 'medium'
        })
    }

def test_AI_응답_생성시_DB에_저장됨(mock_dynamodb_service, sample_inquiry_event):
    """AI 응답 생성 시 DB에 저장되는지 테스트"""
    # Given
    mock_ai_response = "안녕하세요! 문의해주셔서 감사합니다."
    mock_dynamodb_service.create_inquiry.return_value = True
    mock_dynamodb_service.update_inquiry_ai_response.return_value = True
    
    # When
    with patch('src.handlers.create_inquiry.db_service', mock_dynamodb_service), \
         patch('src.handlers.create_inquiry.generate_ai_response', return_value=mock_ai_response):
        
        response = lambda_handler(sample_inquiry_event, None)
    
    # Then
    assert response['statusCode'] == 200
    response_body = json.loads(response['body'])
    assert response_body['success'] is True
    assert response_body['data']['aiResponse'] == mock_ai_response
    
    # AI 응답이 DB에 저장되었는지 확인
    mock_dynamodb_service.update_inquiry_ai_response.assert_called_once()

def test_AI_응답_저장_실패시_에러_처리(mock_dynamodb_service, sample_inquiry_event):
    """AI 응답 저장 실패 시 에러 처리 테스트"""
    # Given
    mock_ai_response = "테스트 응답"
    mock_dynamodb_service.create_inquiry.return_value = True
    mock_dynamodb_service.update_inquiry_ai_response.return_value = False
    
    # When
    with patch('src.handlers.create_inquiry.db_service', mock_dynamodb_service), \
         patch('src.handlers.create_inquiry.generate_ai_response', return_value=mock_ai_response):
        
        response = lambda_handler(sample_inquiry_event, None)
    
    # Then
    assert response['statusCode'] == 500
    response_body = json.loads(response['body'])
    assert response_body['success'] is False
