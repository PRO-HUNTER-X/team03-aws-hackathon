import json
import pytest
from unittest.mock import patch
from src.handlers.list_inquiries import lambda_handler


class TestListInquiries:
    
    def test_list_inquiries_success(self):
        """문의 목록 조회 성공 테스트"""
        event = {
            'queryStringParameters': {
                'companyId': 'test-company',
                'limit': '10'
            }
        }
        context = {}
        
        mock_inquiries = [
            {'id': 'inquiry-1', 'title': '첫 번째 문의', 'status': 'pending'},
            {'id': 'inquiry-2', 'title': '두 번째 문의', 'status': 'resolved'}
        ]
        
        with patch('src.handlers.list_inquiries.list_inquiries') as mock_list:
            mock_list.return_value = mock_inquiries
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert body['success'] is True
            assert len(body['data']['inquiries']) == 2
            assert body['data']['count'] == 2
    
    def test_list_inquiries_with_status_filter(self):
        """상태별 필터링 테스트"""
        event = {
            'queryStringParameters': {
                'companyId': 'test-company',
                'status': 'pending',
                'limit': '5'
            }
        }
        context = {}
        
        mock_inquiries = [
            {'id': 'inquiry-1', 'title': '대기 중인 문의', 'status': 'pending'}
        ]
        
        with patch('src.handlers.list_inquiries.list_inquiries') as mock_list:
            mock_list.return_value = mock_inquiries
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert body['success'] is True
            assert len(body['data']['inquiries']) == 1
    
    def test_list_inquiries_missing_company_id(self):
        """회사 ID 누락 테스트"""
        event = {
            'queryStringParameters': {}
        }
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400
        body = json.loads(result['body'])
        assert body['success'] is False
        assert 'companyId is required' in body['error']
    
    def test_list_inquiries_no_query_params(self):
        """쿼리 파라미터 없음 테스트"""
        event = {}
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400