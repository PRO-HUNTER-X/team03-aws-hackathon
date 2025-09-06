#!/usr/bin/env python3
"""
DynamoDB에 직접 AI 응답 추가 테스트
"""
import boto3
from datetime import datetime

def test_direct_update():
    """DynamoDB에 직접 AI 응답 추가"""
    
    # 테스트할 문의 ID
    inquiry_id = "ea97c982-957f-49da-a978-3289dbadfb0c"
    test_ai_response = "안녕하세요! Claude 3.5 Sonnet 모델로 생성된 테스트 AI 응답입니다. 문의해주신 내용에 대해 도움을 드리겠습니다."
    
    try:
        # DynamoDB 클라이언트 생성
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table('cs-inquiries')
        
        print(f"문의 ID: {inquiry_id}")
        print(f"AI 응답: {test_ai_response}")
        
        # 1. 기존 데이터 조회
        print("\n1. 기존 데이터 조회...")
        response = table.get_item(Key={'inquiry_id': inquiry_id})
        
        if 'Item' not in response:
            print("❌ 문의를 찾을 수 없습니다!")
            return False
            
        existing_item = response['Item']
        print(f"기존 상태: {existing_item.get('status')}")
        print(f"기존 AI 응답: {existing_item.get('aiResponse', 'None')}")
        
        # 2. AI 응답 업데이트
        print("\n2. AI 응답 업데이트...")
        table.update_item(
            Key={'inquiry_id': inquiry_id},
            UpdateExpression="SET aiResponse = :ai_response, #status = :status, updatedAt = :updated_at, ai_responded_at = :ai_responded_at",
            ExpressionAttributeValues={
                ':ai_response': test_ai_response,
                ':status': 'ai_responded',
                ':updated_at': datetime.utcnow().isoformat(),
                ':ai_responded_at': datetime.utcnow().isoformat()
            },
            ExpressionAttributeNames={'#status': 'status'}
        )
        
        print("✅ 업데이트 완료!")
        
        # 3. 업데이트 후 확인
        print("\n3. 업데이트 후 확인...")
        response = table.get_item(Key={'inquiry_id': inquiry_id})
        updated_item = response['Item']
        
        print(f"업데이트 후 상태: {updated_item.get('status')}")
        print(f"AI 응답 존재: {bool(updated_item.get('aiResponse'))}")
        print(f"AI 응답 길이: {len(updated_item.get('aiResponse', ''))}")
        print(f"AI 응답 내용: {updated_item.get('aiResponse', '')[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        import traceback
        print(f"상세 오류: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("DynamoDB 직접 업데이트 테스트 시작...")
    success = test_direct_update()
    
    if success:
        print("\n✅ 테스트 성공!")
    else:
        print("\n❌ 테스트 실패!")
