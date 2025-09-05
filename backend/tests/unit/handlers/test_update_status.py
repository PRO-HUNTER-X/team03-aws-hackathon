import json
import pytest
from unittest.mock import patch
from src.handlers.update_status import lambda_handler


class TestUpdateStatus:
    
    def test_update_status_success(self):
        """상태 업데이트 성공 테스트"""
        event = {
            'pathParameters': {'id': 'test-inquiry-id'},
            'body': json.dumps({
                'status': 'resolved',
                'humanResponse': '문제가 해결되었습니다.'
            })
        }
        context = {}
        
        mock_updated = {
            'id': 'test-inquiry-id',
            'status': 'resolved',
            'humanResponse': '문제가 해결되었습니다.'
        }
        
        with patch('src.handlers.update_status.update_inquiry_status') as mock_update:
            mock_update.return_value = mock_updated
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert body['success'] is True
            assert body['data']['status'] == 'resolved'
    
    def test_update_status_invalid_status(self):
        """유효하지 않은 상태 테스트"""
        event = {
            'pathParameters': {'id': 'test-inquiry-id'},
            'body': json.dumps({
                'status': 'invalid_status'
            })
        }
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400
        body = json.loads(result['body'])
        assert 'Invalid status' in body['error']
    
    def test_update_status_not_found(self):
        """존재하지 않는 문의 테스트"""
        event = {
            'pathParameters': {'id': 'non-existent-id'},
            'body': json.dumps({
                'status': 'resolved'
            })
        }
        context = {}
        
        with patch('src.handlers.update_status.update_inquiry_status') as mock_update:
            mock_update.return_value = None
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 404