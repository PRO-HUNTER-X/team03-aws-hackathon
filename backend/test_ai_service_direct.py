#!/usr/bin/env python3
"""AI 서비스 직접 테스트"""

import json
import sys
import os
from unittest.mock import patch, Mock

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(__file__))

def test_ai_service_mock():
    """Mock을 사용한 AI 서비스 테스트"""
    
    print("=== Mock AI 서비스 테스트 ===")
    
    # AI 서비스 Mock 테스트
    from src.handlers.create_inquiry import generate_ai_response
    
    test_inquiry = {
        'title': 'AI 서비스 테스트',
        'content': '이것은 AI 서비스가 정상적으로 작동하는지 확인하는 테스트입니다.',
        'category': 'general',
        'urgency': 'medium'
    }
    
    # Mock AI 응답
    mock_response = "안녕하세요! 문의해주셔서 감사합니다. 테스트 문의에 대해 답변드립니다."
    
    with patch('src.handlers.create_inquiry.generate_ai_response', return_value=mock_response):
        try:
            response = generate_ai_response(test_inquiry)
            print(f"✅ AI 응답 생성 성공: {response[:50]}...")
            return True
        except Exception as e:
            print(f"❌ AI 응답 생성 실패: {str(e)}")
            return False

def test_bedrock_connection():
    """Bedrock 연결 테스트"""
    
    print("\n=== Bedrock 연결 테스트 ===")
    
    try:
        import boto3
        
        # Bedrock 클라이언트 생성
        bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
        
        # 간단한 텍스트 생성 요청
        test_prompt = "안녕하세요"
        
        # Claude 3.5 Sonnet 모델 사용
        model_id = "anthropic.claude-3-5-sonnet-20241022-v2:0"
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100,
            "messages": [
                {
                    "role": "user",
                    "content": test_prompt
                }
            ]
        }
        
        print(f"모델 ID: {model_id}")
        print(f"요청 내용: {test_prompt}")
        
        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        ai_response = response_body['content'][0]['text']
        
        print(f"✅ Bedrock 연결 성공")
        print(f"AI 응답: {ai_response}")
        return True
        
    except Exception as e:
        print(f"❌ Bedrock 연결 실패: {str(e)}")
        print("   - AWS 자격 증명 확인 필요")
        print("   - Bedrock 서비스 권한 확인 필요")
        print("   - 모델 액세스 권한 확인 필요")
        return False

def test_lambda_ai_service():
    """Lambda 환경에서 AI 서비스 테스트 시뮬레이션"""
    
    print("\n=== Lambda AI 서비스 시뮬레이션 ===")
    
    # Lambda 환경변수 시뮬레이션
    os.environ['AWS_REGION'] = 'us-east-1'
    os.environ['BEDROCK_DEFAULT_MODEL'] = 'anthropic.claude-3-5-sonnet-20241022-v2:0'
    
    try:
        # AI 서비스 import 시도
        from src.services.ai_service import AIService
        
        ai_service = AIService()
        
        test_inquiry = {
            'title': 'Lambda 테스트',
            'content': 'Lambda 환경에서 AI 서비스가 정상 작동하는지 테스트',
            'category': 'general',
            'urgency': 'medium'
        }
        
        # Mock Bedrock 응답
        mock_bedrock_response = {
            'body': Mock()
        }
        mock_bedrock_response['body'].read.return_value = json.dumps({
            'content': [{'text': 'Lambda 환경에서 AI 서비스가 정상적으로 작동합니다.'}]
        }).encode()
        
        with patch.object(ai_service.bedrock, 'invoke_model', return_value=mock_bedrock_response):
            response = ai_service.generate_response(test_inquiry)
            print(f"✅ Lambda AI 서비스 시뮬레이션 성공")
            print(f"응답: {response}")
            return True
            
    except ImportError as e:
        print(f"❌ AI 서비스 import 실패: {str(e)}")
        print("   - config.ai_models 모듈 문제")
        return False
    except Exception as e:
        print(f"❌ Lambda AI 서비스 시뮬레이션 실패: {str(e)}")
        return False

if __name__ == '__main__':
    print("🧪 AI 서비스 종합 테스트 시작\n")
    
    results = []
    
    # 1. Mock 테스트
    results.append(test_ai_service_mock())
    
    # 2. Bedrock 연결 테스트 (실제 AWS 호출)
    results.append(test_bedrock_connection())
    
    # 3. Lambda 시뮬레이션 테스트
    results.append(test_lambda_ai_service())
    
    # 결과 요약
    print(f"\n📊 테스트 결과 요약")
    print(f"성공: {sum(results)}/{len(results)}")
    
    if all(results):
        print("✅ 모든 테스트 통과 - AI 서비스 정상")
    else:
        print("❌ 일부 테스트 실패 - AI 서비스 문제 있음")
        print("\n🔧 문제 해결 방법:")
        print("1. AWS 자격 증명 설정 확인")
        print("2. Bedrock 서비스 권한 확인")
        print("3. 모델 액세스 권한 확인")
        print("4. Lambda 함수 환경변수 확인")
