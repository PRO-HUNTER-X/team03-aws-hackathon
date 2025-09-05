import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# 테스트 경로 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from handlers.escalate_inquiry import lambda_handler

class TestEscalateInquiry:
    """에스컬레이션 API 테스트"""
    
    @patch('handlers.escalate_inquiry.db_service')
    @patch('handlers.escalate_inquiry.email_service')
    def test_에스컬레이션_성공(self, mock_email, mock_db):
        # Given
        inquiry_id = "test-inquiry-123"
        mock_db.get_inquiry.return_value = {
            'inquiry_id': inquiry_id,
            'status': 'pending',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의'
        }
        mock_db.update_inquiry_status.return_value = True
        mock_email.send_escalation_notification.return_value = True
        
        event = {
            'httpMethod': 'POST',
            'pathParameters': {'id': inquiry_id},
            'body': json.dumps({'reason': '답변이 만족스럽지 않음'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert body['data']['status'] == 'escalated'
        
        # 상태 업데이트 호출 확인
        mock_db.update_inquiry_status.assert_called_once_with(
            inquiry_id, 'escalated'
        )
        
        # 이메일 발송 확인
        mock_email.send_escalation_notification.assert_called_once()
    
    @patch('handlers.escalate_inquiry.db_service')
    def test_존재하지_않는_문의_에스컬레이션_실패(self, mock_db):
        # Given
        inquiry_id = "nonexistent-inquiry"
        mock_db.get_inquiry.return_value = None
        
        event = {
            'httpMethod': 'POST',
            'pathParameters': {'id': inquiry_id},
            'body': json.dumps({'reason': '테스트'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert body['success'] is False
        assert 'not found' in body['error'].lower()
    
    @patch('handlers.escalate_inquiry.db_service')
    def test_이미_에스컬레이션된_문의_처리(self, mock_db):
        # Given
        inquiry_id = "escalated-inquiry"
        mock_db.get_inquiry.return_value = {
            'inquiry_id': inquiry_id,
            'status': 'escalated'
        }
        
        event = {
            'httpMethod': 'POST',
            'pathParameters': {'id': inquiry_id},
            'body': json.dumps({'reason': '테스트'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert body['success'] is False
        assert 'already escalated' in body['error'].lower()