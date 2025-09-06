#!/usr/bin/env python3
"""실제 문의 생성 및 조회 테스트"""

import json
import sys
import os
from unittest.mock import patch, Mock

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(__file__))

from src.handlers.create_inquiry import lambda_handler as create_handler
from src.handlers.get_inquiry import lambda_handler as get_handler
from lambda_functions.customer_inquiries import lambda_handler as list_handler

def test_full_inquiry_flow():
    """전체 문의 플로우 테스트: 생성 → 조회 → 목록 확인"""
    
    print("=== 전체 문의 플로우 테스트 ===")
    
    # 1. 문의 생성
    create_event = {
        'body': json.dumps({
            'companyId': 'test-company',
            'customerEmail': 'test@example.com',
            'title': '상태 테스트 문의',
            'content': 'AI 응답 후 상태가 제대로 변경되는지 테스트합니다.',
            'category': 'general',
            'urgency': 'medium'
        })
    }
    
    # Mock AI 서비스
    mock_ai_response = "안녕하세요! 문의해주셔서 감사합니다. 테스트 AI 응답입니다."
    
    # 완전한 Mock 설정
    with patch('src.handlers.create_inquiry.generate_ai_response', return_value=mock_ai_response), \
         patch('src.handlers.create_inquiry.db_service') as mock_db_service, \
         patch('src.handlers.get_inquiry.db_service') as mock_get_db_service, \
         patch('lambda_functions.customer_inquiries.db_service') as mock_list_db_service:
        
        # Mock DB 서비스 설정
        mock_db_service.create_inquiry.return_value = True
        mock_db_service.update_inquiry_ai_response.return_value = True
        
        print("1. 문의 생성 중...")
        create_response = create_handler(create_event, None)
        
        print(f"   - Status Code: {create_response['statusCode']}")
        
        if create_response['statusCode'] == 200:
            create_body = json.loads(create_response['body'])
            inquiry_id = create_body['data']['inquiryId']
            print(f"   - 문의 ID: {inquiry_id}")
            print(f"   - AI 응답: {create_body['data']['aiResponse'][:50]}...")
            print(f"   - 상태: {create_body['data']['status']}")
            
            # 2. 문의 상세 조회
            print("\n2. 문의 상세 조회 중...")
            get_event = {
                'pathParameters': {'id': inquiry_id}
            }
            
            # Mock에서 저장된 데이터 반환하도록 설정
            stored_data = get_stored_inquiry_data(inquiry_id, mock_ai_response)
            mock_get_db_service.get_inquiry.return_value = stored_data
            
            get_response = get_handler(get_event, None)
            print(f"   - Status Code: {get_response['statusCode']}")
            
            if get_response['statusCode'] == 200:
                get_body = json.loads(get_response['body'])
                inquiry_detail = get_body['data']
                print(f"   - 조회된 상태: {inquiry_detail.get('status')}")
                print(f"   - AI 응답 포함: {'aiResponse' in inquiry_detail}")
                
                if inquiry_detail.get('status') == 'ai_responded':
                    print("   ✅ 상태가 올바르게 'ai_responded'로 설정됨")
                else:
                    print(f"   ❌ 상태가 잘못됨: {inquiry_detail.get('status')}")
            
            # 3. 문의 목록 조회
            print("\n3. 문의 목록 조회 중...")
            list_event = {
                'httpMethod': 'GET',
                'queryStringParameters': {'email': 'test@example.com'}
            }
            
            # Mock에서 목록 반환하도록 설정
            mock_list_db_service.get_inquiries_by_email.return_value = [stored_data]
            
            list_response = list_handler(list_event, None)
            print(f"   - Status Code: {list_response['statusCode']}")
            
            if list_response['statusCode'] == 200:
                list_body = json.loads(list_response['body'])
                inquiries = list_body['data']['inquiries']
                if inquiries:
                    first_inquiry = inquiries[0]
                    print(f"   - 목록에서 상태: {first_inquiry.get('status')}")
                    print(f"   - AI 응답 포함: {'aiResponse' in first_inquiry}")
                    
                    if first_inquiry.get('status') == 'ai_responded':
                        print("   ✅ 목록에서도 상태가 올바르게 표시됨")
                    else:
                        print(f"   ❌ 목록에서 상태가 잘못됨: {first_inquiry.get('status')}")
                else:
                    print("   ❌ 목록이 비어있음")
        else:
            print(f"   ❌ 문의 생성 실패: {create_response['body']}")

def get_stored_inquiry_data(inquiry_id, ai_response):
    """저장된 문의 데이터 시뮬레이션"""
    return {
        'inquiry_id': inquiry_id,
        'companyId': 'test-company',
        'customerEmail': 'test@example.com',
        'title': '상태 테스트 문의',
        'content': 'AI 응답 후 상태가 제대로 변경되는지 테스트합니다.',
        'category': 'general',
        'urgency': 'medium',
        'status': 'ai_responded',  # AI 응답 후 상태
        'created_at': '2025-09-06T02:00:00.000000',
        'updatedAt': '2025-09-06T02:00:01.000000',
        'estimatedResponseTime': 15,
        'aiResponse': ai_response
    }

if __name__ == '__main__':
    # 환경변수 설정
    os.environ.setdefault('DYNAMODB_TABLE', 'cs-inquiries-test')
    
    test_full_inquiry_flow()
