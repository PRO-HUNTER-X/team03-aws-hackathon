import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# 테스트 경로 설정
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from handlers.update_status import lambda_handler

class TestUpdateStatus:
    """상태 업데이트 API 테스트"""
    
    @patch('handlers.update_status.db_service')
    def test_상태_업데이트_성공(self, mock_db):
        # Given
        inquiry_id = "test-inquiry-123"
        mock_db.get_inquiry.return_value = {
            'inquiry_id': inquiry_id,
            'status': 'pending'
        }
        mock_db.update_inquiry_status.return_value = True
        
        event = {
            'httpMethod': 'PUT',
            'pathParameters': {'id': inquiry_id},
            'body': json.dumps({'status': 'in_progress'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert body['success'] is True
        assert body['data']['status'] == 'in_progress'
        
        # 상태 업데이트 호출 확인
        mock_db.update_inquiry_status.assert_called_once_with(
            inquiry_id, 'in_progress'
        )
    
    @patch('handlers.update_status.db_service')
    def test_잘못된_상태값_검증(self, mock_db):
        # Given
        inquiry_id = "test-inquiry-123"
        mock_db.get_inquiry.return_value = {
            'inquiry_id': inquiry_id,
            'status': 'pending'
        }
        
        event = {
            'httpMethod': 'PUT',
            'pathParameters': {'id': inquiry_id},
            'body': json.dumps({'status': 'invalid_status'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert body['success'] is False
        assert 'invalid status' in body['error'].lower()
    
    @patch('handlers.update_status.db_service')
    def test_존재하지_않는_문의_상태_업데이트_실패(self, mock_db):
        # Given
        inquiry_id = "nonexistent-inquiry"
        mock_db.get_inquiry.return_value = None
        
        event = {
            'httpMethod': 'PUT',
            'pathParameters': {'id': inquiry_id},
            'body': json.dumps({'status': 'resolved'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert body['success'] is False
        assert 'not found' in body['error'].lower()
    
    def test_잘못된_HTTP_메서드(self):
        # Given
        event = {
            'httpMethod': 'GET',
            'pathParameters': {'id': 'test-id'},
            'body': json.dumps({'status': 'resolved'})
        }
        
        # When
        response = lambda_handler(event, None)
        
        # Then
        assert response['statusCode'] == 405
        body = json.loads(response['body'])
        assert body['success'] is False
        assert 'not allowed' in body['error'].lower()