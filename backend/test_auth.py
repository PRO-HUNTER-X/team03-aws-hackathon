#!/usr/bin/env python3
"""
인증 API 테스트 스크립트
"""
import json
from src.handlers.auth import lambda_handler as auth_handler
from src.handlers.admin import lambda_handler as admin_handler

def test_login():
    """로그인 테스트"""
    print("=== 로그인 테스트 ===")
    
    # 올바른 로그인
    event = {
        'httpMethod': 'POST',
        'path': '/auth/login',
        'body': json.dumps({
            'email': 'admin@example.com',
            'password': 'admin123'
        })
    }
    
    response = auth_handler(event, None)
    print(f"Status: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        print(f"Token: {body['access_token'][:50]}...")
        print(f"User: {body['user']}")
        return body['access_token']
    else:
        print(f"Error: {response['body']}")
        return None

def test_admin_api(token):
    """관리자 API 테스트"""
    print("\n=== 관리자 API 테스트 ===")
    
    # 대시보드 조회
    event = {
        'httpMethod': 'GET',
        'path': '/admin/dashboard',
        'headers': {
            'Authorization': f'Bearer {token}'
        }
    }
    
    response = admin_handler(event, None)
    print(f"Dashboard Status: {response['statusCode']}")
    
    if response['statusCode'] == 200:
        body = json.loads(response['body'])
        print(f"Stats: {body['stats']}")
    else:
        print(f"Error: {response['body']}")

def test_invalid_token():
    """잘못된 토큰 테스트"""
    print("\n=== 잘못된 토큰 테스트 ===")
    
    event = {
        'httpMethod': 'GET',
        'path': '/admin/dashboard',
        'headers': {
            'Authorization': 'Bearer invalid-token'
        }
    }
    
    response = admin_handler(event, None)
    print(f"Status: {response['statusCode']}")
    print(f"Response: {response['body']}")

if __name__ == "__main__":
    # 로그인 테스트
    token = test_login()
    
    if token:
        # 관리자 API 테스트
        test_admin_api(token)
    
    # 잘못된 토큰 테스트
    test_invalid_token()
    
    print("\n=== 테스트 완료 ===")
    print("로그인 정보:")
    print("Email: admin@example.com")
    print("Password: admin123")