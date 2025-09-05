#!/usr/bin/env python3
"""
🔍 Bedrock 연동 디버깅 스크립트
실제 모델 ID와 권한 문제 확인
"""
import boto3
import json
import sys
import os

# config 모듈 import
sys.path.append('.')
from config.ai_models import ai_model_config

def check_bedrock_models():
    """사용 가능한 Bedrock 모델 확인"""
    print("🔍 Bedrock 모델 확인")
    print("=" * 50)
    
    try:
        bedrock = boto3.client('bedrock', region_name='us-east-1')
        
        # 사용 가능한 모델 목록 조회
        response = bedrock.list_foundation_models()
        
        print("✅ 사용 가능한 Claude 모델:")
        claude_models = []
        for model in response['modelSummaries']:
            if 'claude' in model['modelId'].lower():
                claude_models.append(model)
                print(f"  - {model['modelId']} ({model['modelName']})")
        
        return claude_models
        
    except Exception as e:
        print(f"❌ Bedrock 모델 조회 실패: {str(e)}")
        return []

def test_bedrock_invoke():
    """실제 Bedrock 모델 호출 테스트"""
    print("\n🧪 Bedrock 모델 호출 테스트")
    print("=" * 50)
    
    # 실제 사용 가능한 Claude 모델 ID들
    test_models = [
        "anthropic.claude-3-5-sonnet-20241022-v2:0",
        "anthropic.claude-3-sonnet-20240229-v1:0", 
        "anthropic.claude-3-haiku-20240307-v1:0",
        "anthropic.claude-3-opus-20240229-v1:0"
    ]
    
    bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
    
    for model_id in test_models:
        print(f"\n테스트 모델: {model_id}")
        try:
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 100,
                "temperature": 0.7,
                "messages": [
                    {
                        "role": "user",
                        "content": "안녕하세요. 간단한 테스트입니다."
                    }
                ]
            }
            
            response = bedrock_runtime.invoke_model(
                modelId=model_id,
                body=json.dumps(body)
            )
            
            response_body = json.loads(response['body'].read())
            ai_response = response_body['content'][0]['text']
            
            print(f"✅ 성공: {ai_response[:50]}...")
            
        except Exception as e:
            print(f"❌ 실패: {str(e)}")

def check_current_config():
    """현재 AI 모델 설정 확인"""
    print("\n⚙️ 현재 AI 모델 설정")
    print("=" * 50)
    
    config = ai_model_config.config
    
    for key, value in config.items():
        print(f"{key}: {value}")
    
    print(f"\n🎯 선택된 모델 예시:")
    print(f"간단한 요청: {ai_model_config.get_model_for_request('simple', 'normal')}")
    print(f"복잡한 요청: {ai_model_config.get_model_for_request('complex', 'normal')}")
    print(f"높은 우선순위: {ai_model_config.get_model_for_request('medium', 'high')}")

def suggest_fixes():
    """문제 해결 방안 제시"""
    print("\n🔧 문제 해결 방안")
    print("=" * 50)
    print("""
1. 모델 ID 수정이 필요한 경우:
   - config/ai_models.py에서 실제 사용 가능한 모델 ID로 변경
   - CDK 스택의 환경변수도 함께 업데이트

2. 권한 문제인 경우:
   - AWS Console → Bedrock → Model access 확인
   - 필요한 Claude 모델들이 활성화되어 있는지 확인
   - IAM 역할에 bedrock:InvokeModel 권한 확인

3. 환경변수 업데이트 방법:
   - infra/stacks/api_stack.py 수정
   - ./deploy.sh api 재배포

4. 실시간 테스트 방법:
   - python3 debug_bedrock.py 실행
   - CloudWatch 로그 확인
""")

if __name__ == "__main__":
    print("🔍 Bedrock 연동 디버깅")
    print("=" * 50)
    
    # 1. 사용 가능한 모델 확인
    available_models = check_bedrock_models()
    
    # 2. 현재 설정 확인
    check_current_config()
    
    # 3. 실제 모델 호출 테스트
    test_bedrock_invoke()
    
    # 4. 해결 방안 제시
    suggest_fixes()