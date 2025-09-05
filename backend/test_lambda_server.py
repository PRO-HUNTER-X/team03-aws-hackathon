#!/usr/bin/env python3
"""Lambda 서버 테스트"""

import requests
import json
import time

BASE_URL = "http://localhost:3002"

def test_auth():
    """인증 테스트"""
    print("=== 인증 테스트 ===")
    
    # 1. 로그인
    login_data = {"email": "admin@example.com", "password": "admin123"}
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"로그인: {response.status_code}")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"토큰 발급 성공: {token[:50]}...")
        return token
    else:
        print(f"로그인 실패: {response.text}")
        return None

def test_admin_apis(token):
    """관리자 API 테스트"""
    print("\n=== 관리자 API 테스트 ===")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # 1. 대시보드
    response = requests.get(f"{BASE_URL}/admin/dashboard", headers=headers)
    print(f"대시보드: {response.status_code}")
    if response.status_code == 200:
        print(f"  데이터: {response.json()}")
    
    # 2. 문의 목록
    response = requests.get(f"{BASE_URL}/admin/inquiries", headers=headers)
    print(f"문의 목록: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"  총 {data.get('total', 0)}개 문의")
    
    # 3. 문의 상세
    response = requests.get(f"{BASE_URL}/admin/inquiries/1", headers=headers)
    print(f"문의 상세: {response.status_code}")
    if response.status_code == 200:
        inquiry = response.json().get('inquiry', {})
        print(f"  제목: {inquiry.get('title', 'N/A')}")
    else:
        print(f"  에러: {response.text}")

def test_without_auth():
    """인증 없이 테스트"""
    print("\n=== 인증 없이 테스트 ===")
    
    response = requests.get(f"{BASE_URL}/admin/inquiries")
    print(f"문의 목록 (인증 없음): {response.status_code}")
    
    response = requests.get(f"{BASE_URL}/admin/inquiries/1")
    print(f"문의 상세 (인증 없음): {response.status_code}")

def main():
    print("Lambda 서버 테스트 시작...")
    
    # 서버 연결 확인
    try:
        response = requests.get(f"{BASE_URL}/admin/dashboard", timeout=5)
        print("서버 연결 확인됨")
    except requests.exceptions.ConnectionError:
        print("서버가 실행되지 않았습니다. lambda_server.py를 먼저 실행하세요.")
        return
    
    # 테스트 실행
    token = test_auth()
    test_admin_apis(token)
    test_without_auth()
    
    print("\n테스트 완료!")

if __name__ == "__main__":
    main()