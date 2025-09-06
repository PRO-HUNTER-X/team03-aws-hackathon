#!/usr/bin/env python3
"""
DynamoDB AI 응답 저장 테스트 스크립트
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from services.dynamodb_service import DynamoDBService
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_ai_response_update():
    """AI 응답 업데이트 테스트"""
    
    # 테스트할 문의 ID (실제 존재하는 ID 사용)
    test_inquiry_id = "3d1e1dc2-b8a8-455c-9669-ee746b9013ea"
    test_ai_response = "테스트 AI 응답입니다. 이 응답이 정상적으로 저장되는지 확인합니다."
    
    try:
        # DynamoDB 서비스 초기화
        db_service = DynamoDBService()
        
        # 1. 기존 문의 조회
        logger.info(f"1. 기존 문의 조회: {test_inquiry_id}")
        existing_inquiry = db_service.get_inquiry(test_inquiry_id)
        
        if not existing_inquiry:
            logger.error("문의를 찾을 수 없습니다!")
            return False
            
        logger.info(f"기존 상태: {existing_inquiry.get('status')}")
        logger.info(f"기존 AI 응답 존재: {bool(existing_inquiry.get('aiResponse'))}")
        
        # 2. AI 응답 업데이트
        logger.info("2. AI 응답 업데이트 시도")
        success = db_service.update_inquiry_ai_response(test_inquiry_id, test_ai_response)
        
        if not success:
            logger.error("AI 응답 업데이트 실패!")
            return False
            
        # 3. 업데이트 후 확인
        logger.info("3. 업데이트 후 확인")
        updated_inquiry = db_service.get_inquiry(test_inquiry_id)
        
        if updated_inquiry:
            logger.info(f"업데이트 후 상태: {updated_inquiry.get('status')}")
            logger.info(f"AI 응답 존재: {bool(updated_inquiry.get('aiResponse'))}")
            logger.info(f"AI 응답 길이: {len(updated_inquiry.get('aiResponse', ''))}")
            logger.info(f"AI 응답 내용 (처음 100자): {updated_inquiry.get('aiResponse', '')[:100]}...")
            
            # 성공 조건 확인
            if (updated_inquiry.get('status') == 'ai_responded' and 
                updated_inquiry.get('aiResponse') and
                len(updated_inquiry.get('aiResponse', '')) > 0):
                logger.info("✅ AI 응답 저장 성공!")
                return True
            else:
                logger.error("❌ AI 응답 저장 실패 - 데이터가 올바르지 않음")
                return False
        else:
            logger.error("업데이트 후 문의 조회 실패!")
            return False
            
    except Exception as e:
        logger.error(f"테스트 중 오류 발생: {str(e)}")
        import traceback
        logger.error(f"상세 오류: {traceback.format_exc()}")
        return False

if __name__ == "__main__":
    print("DynamoDB AI 응답 저장 테스트 시작...")
    success = test_ai_response_update()
    
    if success:
        print("✅ 테스트 성공!")
        sys.exit(0)
    else:
        print("❌ 테스트 실패!")
        sys.exit(1)
