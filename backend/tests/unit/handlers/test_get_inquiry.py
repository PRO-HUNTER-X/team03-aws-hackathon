import json
import pytest
from unittest.mock import patch
from src.handlers.get_inquiry import lambda_handler


class TestGetInquiry:
    
    def test_get_inquiry_success(self):
        """문의 조회 성공 테스트"""
        event = {
            'pathParameters': {'id': 'test-inquiry-id'}
        }
        context = {}
        
        mock_inquiry = {
            'id': 'test-inquiry-id',
            'title': '테스트 문의',
            'status': 'pending'
        }
        
        with patch('src.handlers.get_inquiry.get_inquiry') as mock_get:
            mock_get.return_value = mock_inquiry
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert body['success'] is True
            assert body['data']['id'] == 'test-inquiry-id'
    
    def test_get_inquiry_not_found(self):
        """문의 없음 테스트"""
        event = {
            'pathParameters': {'id': 'non-existent-id'}
        }
        context = {}
        
        with patch('src.handlers.get_inquiry.get_inquiry') as mock_get:
            mock_get.return_value = None
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 404
            body = json.loads(result['body'])
            assert body['success'] is False
    
    def test_get_inquiry_missing_id(self):
        """ID 누락 테스트"""
        event = {
            'pathParameters': {}
        }
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400