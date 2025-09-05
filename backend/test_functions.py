#!/usr/bin/env python3
# 개별 함수 테스트

from lambda_functions.admin import handle_get_inquiry, handle_get_inquiries, handle_dashboard

print("=== 문의 상세 조회 테스트 ===")
headers = {"Content-Type": "application/json"}
response = handle_get_inquiry("1", headers)
print(f"Status: {response['statusCode']}")
print(f"Body: {response['body']}")

print("\n=== 문의 목록 조회 테스트 ===")
event = {'queryStringParameters': None}
response = handle_get_inquiries(event, headers)
print(f"Status: {response['statusCode']}")
print(f"Body: {response['body']}")

print("\n=== 대시보드 테스트 ===")
response = handle_dashboard(headers)
print(f"Status: {response['statusCode']}")
print(f"Body: {response['body']}")

print("\n=== 존재하지 않는 문의 테스트 ===")
response = handle_get_inquiry("999", headers)
print(f"Status: {response['statusCode']}")
print(f"Body: {response['body']}")