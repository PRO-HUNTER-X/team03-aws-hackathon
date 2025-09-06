#!/usr/bin/env python3
"""DB에 AI 응답 직접 저장 후 조회 API 테스트"""

import json
import sys
import os
import uuid
from datetime import datetime
import requests

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(__file__))

def create_inquiry_with_ai_response():
    """AI 응답이 포함된 문의를 직접 DB에 생성"""
    
    print("=== AI 응답 포함 문의 직접 생성 ===")
    
    try:
        import boto3
        
        # DynamoDB 클라이언트 생성
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table('cs-inquiries')
        
        # 테스트용 문의 데이터 (AI 응답 포함)
        inquiry_id = str(uuid.uuid4())
        
        inquiry_data = {
            'inquiry_id': inquiry_id,
            'companyId': 'test-company',
            'customerEmail': 'db-test@example.com',
            'title': 'DB 직접 저장 AI 응답 테스트',
            'content': 'DB에 직접 저장된 AI 응답이 조회 API를 통해 제대로 조회되는지 테스트합니다.',
            'category': 'general',
            'urgency': 'medium',
            'status': 'ai_responded',  # AI 응답 완료 상태
            'created_at': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            'estimatedResponseTime': 15,
            'aiResponse': '''안녕하세요! 문의해주셔서 감사합니다.

DB 직접 저장 AI 응답 테스트에 대해 답변드립니다.

귀하의 문의는 다음과 같이 처리되었습니다:
1. 문의 내용을 정확히 파악했습니다
2. AI 응답이 성공적으로 생성되었습니다  
3. 데이터베이스에 정상적으로 저장되었습니다
4. 조회 API를 통해 확인 가능합니다

추가 문의사항이 있으시면 언제든지 연락주세요.
감사합니다.'''
        }
        
        # DynamoDB에 직접 저장
        table.put_item(Item=inquiry_data)
        
        print(f"✅ 문의 생성 완료")
        print(f"   - 문의 ID: {inquiry_id}")
        print(f"   - 이메일: {inquiry_data['customerEmail']}")
        print(f"   - 상태: {inquiry_data['status']}")
        print(f"   - AI 응답 길이: {len(inquiry_data['aiResponse'])}자")
        
        return inquiry_id, inquiry_data['customerEmail']
        
    except Exception as e:
        print(f"❌ DB 저장 실패: {str(e)}")
        return None, None

def test_inquiry_detail_api(inquiry_id):
    """문의 상세 조회 API 테스트"""
    
    print(f"\n=== 문의 상세 조회 API 테스트 ===")
    
    api_url = f"https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/api/inquiries/{inquiry_id}"
    
    try:
        response = requests.get(api_url, timeout=10)
        print(f"응답 코드: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            inquiry = result['data']
            
            print(f"✅ 상세 조회 성공")
            print(f"   - 문의 ID: {inquiry.get('inquiry_id')}")
            print(f"   - 제목: {inquiry.get('title')}")
            print(f"   - 상태: {inquiry.get('status')}")
            print(f"   - AI 응답 포함: {'aiResponse' in inquiry}")
            
            if 'aiResponse' in inquiry:
                ai_response = inquiry['aiResponse']
                print(f"   - AI 응답 길이: {len(ai_response)}자")
                print(f"   - AI 응답 미리보기:")
                print(f"     {ai_response[:100]}...")
                return True
            else:
                print("   ❌ AI 응답이 조회되지 않음")
                return False
        else:
            print(f"❌ 조회 실패: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API 호출 실패: {str(e)}")
        return False

def test_inquiry_list_api(email):
    """문의 목록 조회 API 테스트"""
    
    print(f"\n=== 문의 목록 조회 API 테스트 ===")
    
    api_url = f"https://n0e8yoz90k.execute-api.us-east-1.amazonaws.com/prod/api/inquiries?email={email}"
    
    try:
        response = requests.get(api_url, timeout=10)
        print(f"응답 코드: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            inquiries = result['data']['inquiries']
            
            print(f"✅ 목록 조회 성공")
            print(f"   - 조회된 문의 수: {len(inquiries)}")
            
            if inquiries:
                # AI 응답이 포함된 문의 찾기
                ai_responded_inquiries = [inq for inq in inquiries if inq.get('status') == 'ai_responded']
                
                print(f"   - AI 응답 완료 문의: {len(ai_responded_inquiries)}개")
                
                if ai_responded_inquiries:
                    first_ai_inquiry = ai_responded_inquiries[0]
                    print(f"   - 첫 번째 AI 응답 문의:")
                    print(f"     제목: {first_ai_inquiry.get('title')}")
                    print(f"     상태: {first_ai_inquiry.get('status')}")
                    print(f"     AI 응답 포함: {'aiResponse' in first_ai_inquiry}")
                    
                    if 'aiResponse' in first_ai_inquiry:
                        print(f"     AI 응답 길이: {len(first_ai_inquiry['aiResponse'])}자")
                        return True
                    else:
                        print("     ❌ AI 응답이 목록에서 조회되지 않음")
                        return False
                else:
                    print("   ⚠️ AI 응답 완료된 문의가 없음")
                    return False
            else:
                print("   ⚠️ 조회된 문의가 없음")
                return False
        else:
            print(f"❌ 목록 조회 실패: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API 호출 실패: {str(e)}")
        return False

if __name__ == '__main__':
    print("🧪 DB 저장된 AI 응답 조회 API 테스트\n")
    
    # 1. AI 응답 포함 문의 직접 생성
    inquiry_id, email = create_inquiry_with_ai_response()
    
    if inquiry_id and email:
        # 2. 문의 상세 조회 API 테스트
        detail_success = test_inquiry_detail_api(inquiry_id)
        
        # 3. 문의 목록 조회 API 테스트  
        list_success = test_inquiry_list_api(email)
        
        # 결과 요약
        print(f"\n📊 테스트 결과")
        print(f"문의 상세 조회: {'✅ 성공' if detail_success else '❌ 실패'}")
        print(f"문의 목록 조회: {'✅ 성공' if list_success else '❌ 실패'}")
        
        if detail_success and list_success:
            print("\n🎉 AI 응답 조회 API가 정상적으로 작동합니다!")
        else:
            print("\n⚠️ 일부 API에서 문제가 발생했습니다.")
    else:
        print("\n❌ 테스트용 데이터 생성에 실패했습니다.")
