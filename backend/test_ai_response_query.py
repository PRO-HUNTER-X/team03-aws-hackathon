#!/usr/bin/env python3
"""AI 응답 조회 테스트"""

import json
import sys
import os
import uuid
from datetime import datetime
from unittest.mock import patch, Mock

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(__file__))

from src.services.dynamodb_service import DynamoDBService
from src.handlers.get_inquiry import lambda_handler as get_handler
from lambda_functions.customer_inquiries import lambda_handler as list_handler

def test_ai_response_query():
    """AI 응답이 포함된 문의 조회 테스트"""
    
    print("=== AI 응답 조회 테스트 ===")
    
    # 테스트용 문의 데이터 (AI 응답 포함)
    inquiry_id = str(uuid.uuid4())
    test_inquiry = {
        'inquiry_id': inquiry_id,
        'companyId': 'test-company',
        'customerEmail': 'test@example.com',
        'title': 'AI 응답 조회 테스트',
        'content': '이 문의에 대한 AI 응답이 제대로 조회되는지 확인합니다.',
        'category': 'general',
        'urgency': 'medium',
        'status': 'ai_responded',  # AI 응답 완료 상태
        'created_at': datetime.utcnow().isoformat(),
        'updatedAt': datetime.utcnow().isoformat(),
        'estimatedResponseTime': 15,
        'aiResponse': '안녕하세요! 문의해주셔서 감사합니다. 귀하의 문의에 대해 다음과 같이 답변드립니다. AI 응답 조회 기능이 정상적으로 작동하고 있습니다. 추가 문의사항이 있으시면 언제든지 연락주세요.'
    }
    
    # Mock DynamoDB 설정
    with patch('src.handlers.get_inquiry.db_service') as mock_get_db, \
         patch('lambda_functions.customer_inquiries.db_service') as mock_list_db:
        
        # 1. 문의 상세 조회 테스트
        print("1. 문의 상세 조회 테스트")
        mock_get_db.get_inquiry.return_value = test_inquiry
        
        get_event = {
            'pathParameters': {'id': inquiry_id}
        }
        
        response = get_handler(get_event, None)
        print(f"   - Status Code: {response['statusCode']}")
        
        if response['statusCode'] == 200:
            body = json.loads(response['body'])
            inquiry_data = body['data']
            
            print(f"   - 문의 ID: {inquiry_data.get('inquiry_id')}")
            print(f"   - 제목: {inquiry_data.get('title')}")
            print(f"   - 상태: {inquiry_data.get('status')}")
            print(f"   - AI 응답 포함: {'aiResponse' in inquiry_data}")
            
            if 'aiResponse' in inquiry_data:
                ai_response = inquiry_data['aiResponse']
                print(f"   - AI 응답 길이: {len(ai_response)}자")
                print(f"   - AI 응답 미리보기: {ai_response[:50]}...")
                print("   ✅ AI 응답이 정상적으로 조회됨")
            else:
                print("   ❌ AI 응답이 조회되지 않음")
        else:
            print(f"   ❌ 조회 실패: {response['body']}")
        
        # 2. 문의 목록 조회 테스트
        print("\n2. 문의 목록 조회 테스트")
        mock_list_db.get_inquiries_by_email.return_value = [test_inquiry]
        
        list_event = {
            'httpMethod': 'GET',
            'queryStringParameters': {'email': 'test@example.com'}
        }
        
        response = list_handler(list_event, None)
        print(f"   - Status Code: {response['statusCode']}")
        
        if response['statusCode'] == 200:
            body = json.loads(response['body'])
            inquiries = body['data']['inquiries']
            
            if inquiries:
                first_inquiry = inquiries[0]
                print(f"   - 조회된 문의 수: {len(inquiries)}")
                print(f"   - 첫 번째 문의 상태: {first_inquiry.get('status')}")
                print(f"   - AI 응답 포함: {'aiResponse' in first_inquiry}")
                
                if 'aiResponse' in first_inquiry:
                    print("   ✅ 목록에서도 AI 응답이 정상적으로 조회됨")
                else:
                    print("   ❌ 목록에서 AI 응답이 조회되지 않음")
            else:
                print("   ❌ 조회된 문의가 없음")
        else:
            print(f"   ❌ 목록 조회 실패: {response['body']}")

def test_real_api_query():
    """실제 배포된 API로 조회 테스트"""
    
    print("\n=== 실제 API 조회 테스트 ===")
    
    import requests
    
    api_base = "https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod"
    
    # 1. 새로운 문의 생성 (AI 응답 포함)
    print("1. 새로운 문의 생성")
    
    create_data = {
        "companyId": "test-company",
        "customerEmail": "ai-test@example.com",
        "title": "실제 API AI 응답 테스트",
        "content": "실제 배포된 API에서 AI 응답이 제대로 저장되고 조회되는지 테스트합니다.",
        "category": "general",
        "urgency": "medium"
    }
    
    try:
        response = requests.post(f"{api_base}/api/inquiries", json=create_data, timeout=30)
        print(f"   - 생성 응답 코드: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            inquiry_id = result['data']['inquiryId']
            print(f"   - 생성된 문의 ID: {inquiry_id}")
            print(f"   - 응답 상태: {result['data'].get('status')}")
            
            # AI 응답이 포함되어 있는지 확인
            if 'aiResponse' in result['data']:
                print(f"   - AI 응답 포함: 예 ({len(result['data']['aiResponse'])}자)")
                print("   ✅ 문의 생성 시 AI 응답 포함됨")
            else:
                print("   - AI 응답 포함: 아니오")
                print("   ⚠️ 문의 생성 시 AI 응답이 포함되지 않음")
            
            # 2. 생성된 문의 상세 조회
            print(f"\n2. 문의 상세 조회 (ID: {inquiry_id})")
            
            detail_response = requests.get(f"{api_base}/api/inquiries/{inquiry_id}", timeout=10)
            print(f"   - 조회 응답 코드: {detail_response.status_code}")
            
            if detail_response.status_code == 200:
                detail_result = detail_response.json()
                inquiry_detail = detail_result['data']
                
                print(f"   - 상태: {inquiry_detail.get('status')}")
                print(f"   - AI 응답 포함: {'aiResponse' in inquiry_detail}")
                
                if 'aiResponse' in inquiry_detail:
                    ai_response = inquiry_detail['aiResponse']
                    print(f"   - AI 응답 길이: {len(ai_response)}자")
                    print(f"   - AI 응답 미리보기: {ai_response[:100]}...")
                    print("   ✅ 상세 조회에서 AI 응답 정상 확인")
                else:
                    print("   ❌ 상세 조회에서 AI 응답 없음")
            else:
                print(f"   ❌ 상세 조회 실패: {detail_response.text}")
            
            # 3. 이메일로 문의 목록 조회
            print(f"\n3. 이메일별 문의 목록 조회")
            
            list_response = requests.get(f"{api_base}/api/inquiries?email=ai-test@example.com", timeout=10)
            print(f"   - 목록 조회 응답 코드: {list_response.status_code}")
            
            if list_response.status_code == 200:
                list_result = list_response.json()
                inquiries = list_result['data']['inquiries']
                
                print(f"   - 조회된 문의 수: {len(inquiries)}")
                
                if inquiries:
                    # 방금 생성한 문의 찾기
                    target_inquiry = None
                    for inq in inquiries:
                        if inq.get('inquiry_id') == inquiry_id:
                            target_inquiry = inq
                            break
                    
                    if target_inquiry:
                        print(f"   - 대상 문의 상태: {target_inquiry.get('status')}")
                        print(f"   - AI 응답 포함: {'aiResponse' in target_inquiry}")
                        
                        if 'aiResponse' in target_inquiry:
                            print("   ✅ 목록 조회에서도 AI 응답 정상 확인")
                        else:
                            print("   ❌ 목록 조회에서 AI 응답 없음")
                    else:
                        print("   ⚠️ 생성한 문의를 목록에서 찾을 수 없음")
            else:
                print(f"   ❌ 목록 조회 실패: {list_response.text}")
                
        else:
            print(f"   ❌ 문의 생성 실패: {response.text}")
            
    except Exception as e:
        print(f"   ❌ API 테스트 중 오류: {str(e)}")

if __name__ == '__main__':
    # 환경변수 설정
    os.environ.setdefault('DYNAMODB_TABLE', 'cs-inquiries')
    
    # Mock 테스트 실행
    test_ai_response_query()
    
    # 실제 API 테스트 실행
    test_real_api_query()
