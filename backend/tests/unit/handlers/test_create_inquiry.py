import json
import pytest
from unittest.mock import patch, MagicMock
from lambda_functions.create_inquiry import lambda_handler


class TestCreateInquiry:
    
    def test_create_inquiry_success(self):
        """문의 생성 성공 테스트"""
        event = {
            'body': json.dumps({
                'companyId': 'test-company',
                'customerEmail': 'test@example.com',
                'title': '테스트 문의',
                'content': '테스트 내용',
                'urgency': 'medium'
            })
        }
        context = {}
        
        with patch('lambda_functions.create_inquiry.create_inquiry') as mock_create, \
             patch('lambda_functions.create_inquiry.generate_ai_response') as mock_ai:
            
            mock_create.return_value = True
            mock_ai.return_value = "AI 응답입니다."
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 200
            body = json.loads(result['body'])
            assert body['success'] is True
            assert 'inquiryId' in body['data']
            assert body['data']['aiResponse'] == "AI 응답입니다."
    
    def test_create_inquiry_validation_error(self):
        """입력 검증 실패 테스트"""
        event = {
            'body': json.dumps({
                'customerEmail': 'invalid-email',
                # companyId, title, content 누락
            })
        }
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400
        body = json.loads(result['body'])
        assert body['success'] is False
        assert 'Validation errors' in body['error']
    
    def test_create_inquiry_missing_body(self):
        """요청 본문 누락 테스트"""
        event = {}
        context = {}
        
        result = lambda_handler(event, context)
        
        assert result['statusCode'] == 400
    
    def test_create_inquiry_db_error(self):
        """데이터베이스 오류 테스트"""
        event = {
            'body': json.dumps({
                'companyId': 'test-company',
                'customerEmail': 'test@example.com',
                'title': '테스트 문의',
                'content': '테스트 내용'
            })
        }
        context = {}
        
        with patch('lambda_functions.create_inquiry.create_inquiry') as mock_create:
            mock_create.side_effect = Exception("DB 연결 오류")
            
            result = lambda_handler(event, context)
            
            assert result['statusCode'] == 500
            body = json.loads(result['body'])
            assert body['success'] is False