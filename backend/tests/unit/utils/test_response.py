import json
import pytest
from src.utils.response import success_response, error_response


class TestResponseUtils:
    
    def test_success_response_with_data(self):
        """성공 응답이 올바른 형식으로 반환되는지 테스트"""
        data = {"message": "테스트 성공"}
        result = success_response(data)
        
        assert result['statusCode'] == 200
        assert result['headers']['Content-Type'] == 'application/json'
        
        body = json.loads(result['body'])
        assert body['success'] is True
        assert body['data'] == data
    
    def test_success_response_with_none(self):
        """None 데이터로 성공 응답 테스트"""
        result = success_response(None)
        
        assert result['statusCode'] == 200
        body = json.loads(result['body'])
        assert body['success'] is True
        assert body['data'] is None
    
    def test_error_response_with_message(self):
        """에러 응답이 올바른 형식으로 반환되는지 테스트"""
        message = "테스트 에러"
        status_code = 400
        result = error_response(message, status_code)
        
        assert result['statusCode'] == status_code
        assert result['headers']['Content-Type'] == 'application/json'
        
        body = json.loads(result['body'])
        assert body['success'] is False
        assert body['error'] == message
    
    def test_error_response_500(self):
        """500 에러 응답 테스트"""
        message = "서버 내부 오류"
        result = error_response(message, 500)
        
        assert result['statusCode'] == 500
        body = json.loads(result['body'])
        assert body['success'] is False
        assert body['error'] == message