#!/usr/bin/env python3
"""
Lambda 함수 테스트 스크립트
각 Lambda 함수가 올바르게 작동하는지 확인
"""

import json
import sys
import os

# 현재 디렉토리를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_create_inquiry():
    """문의 생성 Lambda 테스트"""
    from lambda_functions.create_inquiry import lambda_handler
    
    event = {
        'httpMethod': 'POST',
        'body': json.dumps({
            'companyId': 'test-company',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의',
            'content': '테스트 내용입니다',
            'category': 'general',
            'urgency': 'medium'
        })
    }
    
    response = lambda_handler(event, None)
    print("✅ create_inquiry 테스트:")
    print(f"   상태코드: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        print(f"   성공: {body.get('success')}")
        print(f"   문의 ID: {body.get('data', {}).get('inquiryId')}")
    else:
        print(f"   에러: {response['body']}")

def test_auth_login():
    """로그인 Lambda 테스트"""
    from lambda_functions.auth import lambda_handler
    
    event = {
        'httpMethod': 'POST',
        'path': '/auth/login',
        'body': json.dumps({
            'email': 'admin@example.com',
            'password': 'admin123'
        })
    }
    
    response = lambda_handler(event, None)
    print("✅ auth 로그인 테스트:")
    print(f"   상태코드: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        print(f"   토큰 타입: {body.get('token_type')}")
        print(f"   사용자: {body.get('user', {}).get('name')}")
    else:
        print(f"   에러: {response['body']}")

def test_get_inquiry():
    """문의 조회 Lambda 테스트"""
    from lambda_functions.get_inquiry import lambda_handler
    
    event = {
        'httpMethod': 'GET',
        'pathParameters': {'id': 'test-inquiry-id'}
    }
    
    response = lambda_handler(event, None)
    print("✅ get_inquiry 테스트:")
    print(f"   상태코드: {response['statusCode']}")
    
    # 404는 정상 (테스트 데이터가 없으므로)
    if response['statusCode'] in [200, 404]:
        print("   정상 작동")
    else:
        print(f"   에러: {response['body']}")

def test_admin_dashboard():
    """관리자 대시보드 Lambda 테스트"""
    from lambda_functions.admin import lambda_handler
    
    # 임시로 인증 우회 (테스트용)
    event = {
        'httpMethod': 'GET',
        'path': '/admin/dashboard',
        'headers': {
            'Authorization': 'Bearer test-token'
        }
    }
    
    # admin_required 데코레이터를 우회하기 위해 직접 함수 호출
    from lambda_functions.admin import handle_dashboard
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
    
    response = handle_dashboard(headers)
    print("✅ admin 대시보드 테스트:")
    print(f"   상태코드: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        stats = body.get('stats', {})
        print(f"   총 문의: {stats.get('total_inquiries')}")
        print(f"   대기 중: {stats.get('pending_count')}")
    else:
        print(f"   에러: {response['body']}")

def main():
    """모든 테스트 실행"""
    print("🧪 Lambda 함수 테스트 시작...\n")
    
    try:
        test_create_inquiry()
        print()
        
        test_auth_login()
        print()
        
        test_get_inquiry()
        print()
        
        test_admin_dashboard()
        print()
        
        print("✅ 모든 테스트 완료!")
        
    except Exception as e:
        print(f"❌ 테스트 중 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()