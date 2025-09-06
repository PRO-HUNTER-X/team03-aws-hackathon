import pytest
from unittest.mock import patch, Mock
from src.services.dynamodb_service import DynamoDBService
import json

@pytest.fixture
def dynamodb_service():
    return DynamoDBService()

def test_AI_응답_저장_및_조회_통합_테스트():
    """AI 응답 저장 후 조회하는 통합 테스트"""
    # Given
    inquiry_id = "test-inquiry-123"
    ai_response = "안녕하세요! 테스트 AI 응답입니다."
    
    # Mock DynamoDB 테이블
    mock_table = Mock()
    
    with patch('boto3.resource') as mock_resource:
        mock_resource.return_value.Table.return_value = mock_table
        
        # DynamoDB 서비스 인스턴스 생성
        db_service = DynamoDBService()
        
        # When - AI 응답 저장
        mock_table.update_item.return_value = {}
        result = db_service.update_inquiry_ai_response(inquiry_id, ai_response)
        
        # Then - 저장 성공 확인
        assert result is True
        mock_table.update_item.assert_called_once()
        
        # 호출된 파라미터 확인
        call_args = mock_table.update_item.call_args
        assert call_args[1]['Key']['inquiry_id'] == inquiry_id
        assert ai_response in str(call_args[1]['ExpressionAttributeValues'])
        assert 'ai_responded' in str(call_args[1]['ExpressionAttributeValues'])

def test_문의_조회시_AI_응답_포함_확인():
    """문의 조회 시 AI 응답이 포함되는지 확인"""
    # Given
    inquiry_id = "test-inquiry-456"
    expected_data = {
        'inquiry_id': inquiry_id,
        'title': '테스트 문의',
        'content': '테스트 내용',
        'aiResponse': '저장된 AI 응답입니다',
        'status': 'ai_responded'
    }
    
    # Mock DynamoDB 테이블
    mock_table = Mock()
    
    with patch('boto3.resource') as mock_resource:
        mock_resource.return_value.Table.return_value = mock_table
        
        # DynamoDB 서비스 인스턴스 생성
        db_service = DynamoDBService()
        
        # When - 문의 조회
        mock_table.get_item.return_value = {'Item': expected_data}
        result = db_service.get_inquiry(inquiry_id)
        
        # Then - AI 응답이 포함된 데이터 반환 확인
        assert result is not None
        assert result['aiResponse'] == '저장된 AI 응답입니다'
        assert result['status'] == 'ai_responded'
        mock_table.get_item.assert_called_once_with(Key={'inquiry_id': inquiry_id})
