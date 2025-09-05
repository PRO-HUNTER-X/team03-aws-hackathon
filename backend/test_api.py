#!/usr/bin/env python3
"""
CS 챗봇 플랫폼 API 테스트 스크립트
실제 Lambda 함수들을 직접 호출하여 테스트합니다.
"""

import json
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.handlers.create_inquiry import lambda_handler as create_inquiry
from src.handlers.get_inquiry import lambda_handler as get_inquiry
from src.handlers.list_inquiries import lambda_handler as list_inquiries
from src.handlers.update_status import lambda_handler as update_status
from src.handlers.escalate_inquiry import lambda_handler as escalate_inquiry

def print_result(title, result):
    """결과를 예쁘게 출력"""
    print(f"\n{'='*50}")
    print(f"🧪 {title}")
    print('='*50)
    print(json.dumps(result, indent=2, ensure_ascii=False))

def test_create_inquiry():
    """문의 생성 테스트"""
    event = {
        'body': json.dumps({
            'companyId': 'test-company',
            'customerEmail': 'test@example.com',
            'category': 'technical',
            'title': '로그인 문제 해결 요청',
            'content': '로그인 페이지에서 계속 오류가 발생합니다. 도움이 필요합니다.',
            'urgency': 'high'
        })
    }
    
    result = create_inquiry(event, {})
    print_result("문의 생성 (Create Inquiry)", result)
    
    # 생성된 문의 ID 반환
    if result['statusCode'] == 200:
        body = json.loads(result['body'])
        return body['data']['inquiryId']
    return None

def test_get_inquiry(inquiry_id):
    """문의 조회 테스트"""
    event = {
        'pathParameters': {'id': inquiry_id}
    }
    
    result = get_inquiry(event, {})
    print_result(f"문의 조회 (Get Inquiry) - ID: {inquiry_id}", result)

def test_list_inquiries():
    """문의 목록 조회 테스트"""
    event = {
        'queryStringParameters': {
            'companyId': 'test-company',
            'limit': '5'
        }
    }
    
    result = list_inquiries(event, {})
    print_result("문의 목록 조회 (List Inquiries)", result)

def test_update_status(inquiry_id):
    """문의 상태 업데이트 테스트"""
    event = {
        'pathParameters': {'id': inquiry_id},
        'body': json.dumps({
            'status': 'resolved',
            'humanResponse': '로그인 문제가 해결되었습니다. 브라우저 캐시를 삭제하시면 정상적으로 로그인하실 수 있습니다.'
        })
    }
    
    result = update_status(event, {})
    print_result(f"상태 업데이트 (Update Status) - ID: {inquiry_id}", result)

def test_escalate_inquiry(inquiry_id):
    """문의 에스컬레이션 테스트"""
    event = {
        'pathParameters': {'id': inquiry_id},
        'body': json.dumps({
            'reason': '고객이 AI 응답에 만족하지 않아 담당자 연결을 요청했습니다.'
        })
    }
    
    result = escalate_inquiry(event, {})
    print_result(f"문의 에스컬레이션 (Escalate Inquiry) - ID: {inquiry_id}", result)

def test_error_cases():
    """에러 케이스 테스트"""
    print(f"\n{'='*50}")
    print("🚨 에러 케이스 테스트")
    print('='*50)
    
    # 1. 잘못된 입력으로 문의 생성
    event = {
        'body': json.dumps({
            'companyId': '',  # 빈 값
            'customerEmail': 'invalid-email',  # 잘못된 이메일
            'title': '',  # 빈 제목
        })
    }
    result = create_inquiry(event, {})
    print("\n❌ 잘못된 입력 테스트:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 2. 존재하지 않는 문의 조회
    event = {'pathParameters': {'id': 'non-existent-id'}}
    result = get_inquiry(event, {})
    print("\n❌ 존재하지 않는 문의 조회:")
    print(json.dumps(result, indent=2, ensure_ascii=False))

def main():
    """메인 테스트 실행"""
    print("🚀 CS 챗봇 플랫폼 API 테스트 시작")
    print("=" * 60)
    
    try:
        # 1. 문의 생성
        inquiry_id = test_create_inquiry()
        
        if inquiry_id:
            # 2. 문의 조회
            test_get_inquiry(inquiry_id)
            
            # 3. 문의 목록 조회
            test_list_inquiries()
            
            # 4. 문의 에스컬레이션
            test_escalate_inquiry(inquiry_id)
            
            # 5. 상태 업데이트
            test_update_status(inquiry_id)
        
        # 6. 에러 케이스 테스트
        test_error_cases()
        
        print(f"\n{'='*60}")
        print("✅ 모든 API 테스트 완료!")
        print("📋 위 결과를 확인하여 API가 정상 작동하는지 검증하세요.")
        print("🔗 실제 배포 후에는 API Gateway URL로 테스트하세요.")
        
    except Exception as e:
        print(f"\n❌ 테스트 중 오류 발생: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()