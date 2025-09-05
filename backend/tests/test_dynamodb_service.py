import pytest
from unittest.mock import Mock, patch
import sys
import os

# 테스트 환경 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def test_이메일별_문의_조회_성공():
    """이메일별 문의 조회 성공 테스트"""
    # Given: DynamoDB 서비스와 Mock 응답
    from src.services.dynamodb_service import DynamoDBService
    
    mock_response = {
        'Items': [
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
    }
    
    with patch('boto3.resource') as mock_boto3:
        mock_table = Mock()
        mock_table.scan.return_value = mock_response
        mock_boto3.return_value.Table.return_value = mock_table
        
        # When: 이메일별 문의 조회
        db_service = DynamoDBService()
        result = db_service.get_inquiries_by_email('test@example.com')
        
        # Then: 올바른 결과 반환
        assert len(result) == 2
        assert result[0]['customerEmail'] == 'test@example.com'
        assert result[1]['customerEmail'] == 'test@example.com'

def test_문의_생성_성공():
    """문의 생성 성공 테스트"""
    # Given: DynamoDB 서비스와 문의 데이터
    from src.services.dynamodb_service import DynamoDBService
    
    inquiry_data = {
        'inquiry_id': '123',
        'customerEmail': 'test@example.com',
        'customerPassword': 'password123',
        'title': '테스트 문의',
        'content': '테스트 내용',
        'status': 'pending'
    }
    
    with patch('boto3.resource') as mock_boto3:
        mock_table = Mock()
        mock_table.put_item.return_value = {}
        mock_boto3.return_value.Table.return_value = mock_table
        
        # When: 문의 생성
        db_service = DynamoDBService()
        result = db_service.create_inquiry(inquiry_data)
        
        # Then: 성공 반환
        assert result is True
        mock_table.put_item.assert_called_once_with(Item=inquiry_data)

def test_문의_조회_성공():
    """문의 조회 성공 테스트"""
    # Given: DynamoDB 서비스와 Mock 응답
    from src.services.dynamodb_service import DynamoDBService
    
    mock_response = {
        'Item': {
            'inquiry_id': '123',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의',
            'status': 'pending'
        }
    }
    
    with patch('boto3.resource') as mock_boto3:
        mock_table = Mock()
        mock_table.get_item.return_value = mock_response
        mock_boto3.return_value.Table.return_value = mock_table
        
        # When: 문의 조회
        db_service = DynamoDBService()
        result = db_service.get_inquiry('123')
        
        # Then: 올바른 결과 반환
        assert result is not None
        assert result['inquiry_id'] == '123'
        assert result['customerEmail'] == 'test@example.com'

if __name__ == '__main__':
    pytest.main([__file__, '-v'])