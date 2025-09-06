#!/usr/bin/env python3
"""AI 응답 저장 후 상태 업데이트 테스트"""

import json
import sys
import os
from unittest.mock import Mock, patch

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(__file__))

from src.handlers.create_inquiry import lambda_handler
from src.services.dynamodb_service import DynamoDBService

def test_ai_response_status_update():
    """AI 응답 생성 후 상태가 ai_responded로 변경되는지 테스트"""
    
    # 테스트 데이터
    event = {
        'body': json.dumps({
            'companyId': 'test-company',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의',
            'content': '테스트 내용입니다',
            'category': 'general',
            'urgency': 'medium'
        })
    }
    
    # Mock 설정
    mock_db_service = Mock(spec=DynamoDBService)
    mock_db_service.create_inquiry.return_value = True
    mock_db_service.update_inquiry_ai_response.return_value = True
    
    mock_ai_response = "안녕하세요! AI 응답입니다."
    
    # 테스트 실행
    with patch('src.handlers.create_inquiry.db_service', mock_db_service), \
         patch('src.handlers.create_inquiry.generate_ai_response', return_value=mock_ai_response):
        
        response = lambda_handler(event, None)
    
    # 결과 확인
    print("=== 테스트 결과 ===")
    print(f"Status Code: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        print(f"Success: {body['success']}")
        print(f"AI Response: {body['data']['aiResponse']}")
        print(f"Status: {body['data']['status']}")
        
        # AI 응답 저장 메서드가 호출되었는지 확인
        if mock_db_service.update_inquiry_ai_response.called:
            print("✅ AI 응답 저장 메서드 호출됨")
            call_args = mock_db_service.update_inquiry_ai_response.call_args
            print(f"   - 문의 ID: {call_args[0][0]}")
            print(f"   - AI 응답: {call_args[0][1]}")
        else:
            print("❌ AI 응답 저장 메서드 호출되지 않음")
        
        # 응답 상태 확인
        if body['data']['status'] == 'ai_responded':
            print("✅ 응답 상태가 'ai_responded'로 설정됨")
        else:
            print(f"❌ 응답 상태가 잘못됨: {body['data']['status']}")
    else:
        print(f"❌ 요청 실패: {response['body']}")

def test_dynamodb_update_method():
    """DynamoDB 업데이트 메서드 직접 테스트"""
    
    print("\n=== DynamoDB 업데이트 메서드 테스트 ===")
    
    # Mock 테이블 설정
    mock_table = Mock()
    mock_table.update_item.return_value = {}
    
    with patch('boto3.resource') as mock_resource:
        mock_resource.return_value.Table.return_value = mock_table
        
        # DynamoDB 서비스 인스턴스 생성
        db_service = DynamoDBService()
        
        # AI 응답 저장 테스트
        result = db_service.update_inquiry_ai_response("test-123", "테스트 AI 응답")
        
        print(f"저장 결과: {result}")
        
        if mock_table.update_item.called:
            print("✅ update_item 메서드 호출됨")
            call_args = mock_table.update_item.call_args
            print(f"   - Key: {call_args[1]['Key']}")
            print(f"   - UpdateExpression: {call_args[1]['UpdateExpression']}")
            print(f"   - ExpressionAttributeValues: {call_args[1]['ExpressionAttributeValues']}")
            
            # 상태가 ai_responded로 설정되었는지 확인
            values = call_args[1]['ExpressionAttributeValues']
            if values.get(':status') == 'ai_responded':
                print("✅ 상태가 'ai_responded'로 설정됨")
            else:
                print(f"❌ 상태가 잘못됨: {values.get(':status')}")
        else:
            print("❌ update_item 메서드 호출되지 않음")

if __name__ == '__main__':
    # 환경변수 설정
    os.environ.setdefault('DYNAMODB_TABLE', 'cs-inquiries-test')
    
    test_ai_response_status_update()
    test_dynamodb_update_method()
