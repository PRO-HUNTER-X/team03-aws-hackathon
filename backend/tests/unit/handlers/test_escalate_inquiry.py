import json
import pytest
from unittest.mock import patch
from src.handlers.escalate_inquiry import lambda_handler


class TestEscalateInquiry:
    
    def test_escalate_inquiry_success(self):
        """문의 에스컬레이션 성공 테스트"""
        event = {
            'pathParameters': {'id': 'test-inquiry-id'},
            'body': json.dumps({
                'reason': '고객이 AI 응답에 만족하지 않음'
            })
        }
        context = {}
        
        mock_inquiry = {
            'id': 'test-inquiry-id',
            'title': '테스트 문의',
            'customerEmail': 'customer@example.com'
        }
        
        mock_updated = {
            'id': 'test-inquiry-id',
            'status': 'escalated'
        }
        
        with patch('src.handlers.escalate_inquiry.get_inquiry') as mock_get, \
             patch('src.handlers.escalate_inquiry.update_inquiry_status') as mock_update, \
             patch('src.handlers.escalate_inquiry.send_escalation_email') as mock_email:
            
            mock_get.return_value = mock_inquiry
            mock_update.return_value = mock_updated
            mock_email.return_value = True
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert body['success'] is True
            assert body['data']['status'] == 'escalated'
            assert body['data']['emailSent'] is True
    
    def test_escalate_inquiry_default_reason(self):
        """기본 에스컬레이션 사유 테스트"""
        event = {
            'pathParameters': {'id': 'test-inquiry-id'},
            'body': json.dumps({})
        }
        context = {}
        
        mock_inquiry = {'id': 'test-inquiry-id'}
        mock_updated = {'id': 'test-inquiry-id', 'status': 'escalated'}
        
        with patch('src.handlers.escalate_inquiry.get_inquiry') as mock_get, \
             patch('src.handlers.escalate_inquiry.update_inquiry_status') as mock_update, \
             patch('src.handlers.escalate_inquiry.send_escalation_email') as mock_email:
            
            mock_get.return_value = mock_inquiry
            mock_update.return_value = mock_updated
            mock_email.return_value = True
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert 'Customer requested human assistance' in body['data']['reason']
    
    def test_escalate_inquiry_not_found(self):
        """존재하지 않는 문의 에스컬레이션 테스트"""
        event = {
            'pathParameters': {'id': 'non-existent-id'},
            'body': json.dumps({'reason': '테스트'})
        }
        context = {}
        
        with patch('src.handlers.escalate_inquiry.get_inquiry') as mock_get:
            mock_get.return_value = None
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 404
            body = json.loads(result['body'])
            assert body['success'] is False
    
    def test_escalate_inquiry_missing_id(self):
        """ID 누락 테스트"""
        event = {
            'pathParameters': {},
            'body': json.dumps({'reason': '테스트'})
        }
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400