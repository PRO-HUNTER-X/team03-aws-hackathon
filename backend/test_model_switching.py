#!/usr/bin/env python3
"""
🔧 Bedrock 모델 스위칭 테스트 스크립트
배포된 API에서 환경변수 기반 모델 변경이 제대로 작동하는지 확인
"""
import requests
import json
import time
import os

# API Gateway URL (배포 후 실제 URL로 변경 필요)
API_BASE_URL = "https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod"

def test_ai_response_with_different_complexities():
    """다양한 복잡도의 요청으로 모델 선택 테스트"""
    
    test_cases = [
        {
            "name": "간단한 문의 (Claude 4 Sonnet 예상)",
            "data": {
                "title": "인사",
                "content": "안녕하세요",
                "category": "general",
                "urgency": "normal"
            }
        },
        {
            "name": "복잡한 문의 (Claude 4.1 Opus 예상)",
            "data": {
                "title": "복잡한 기술 문의",
                "content": "결제 시스템에 문제가 있어서 상세한 분석과 해결방법이 필요합니다. 여러 단계의 복잡한 프로세스를 거쳐야 할 것 같고, 데이터베이스 연동 이슈도 함께 검토해주세요.",
                "category": "technical",
                "urgency": "normal"
            }
        },
        {
            "name": "높은 우선순위 문의 (Claude 4.1 Opus 예상)",
            "data": {
                "title": "긴급 문의",
                "content": "서비스가 중단되었습니다",
                "category": "urgent",
                "urgency": "high"
            }
        },
        {
            "name": "일반 문의 (Claude 4 Opus 예상)",
            "data": {
                "title": "제품 사용법 문의",
                "content": "제품 사용법에 대해 궁금한 점이 있습니다. 기본적인 설정 방법을 알려주세요.",
                "category": "general",
                "urgency": "normal"
            }
        }
    ]
    
    print("🚀 AI 응답 생성 테스트 시작")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. {test_case['name']}")
        print("-" * 40)
        
        try:
            # AI 응답 생성 API 호출
            response = requests.post(
                f"{API_BASE_URL}/api/ai-response",
                json=test_case["data"],
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ 성공: {response.status_code}")
                print(f"📝 응답: {result.get('response', 'No response')[:100]}...")
                
                # 로그에서 사용된 모델 확인 (CloudWatch 로그 확인 필요)
                print(f"🔍 로그 확인 필요: CloudWatch에서 선택된 모델 확인")
                
            else:
                print(f"❌ 실패: {response.status_code}")
                print(f"📝 에러: {response.text}")
                
        except Exception as e:
            print(f"❌ 예외 발생: {str(e)}")
        
        time.sleep(2)  # API 호출 간격

def test_model_configuration_via_logs():
    """CloudWatch 로그를 통한 모델 설정 확인 가이드"""
    
    print("\n🔍 모델 설정 확인 방법")
    print("=" * 60)
    print("""
1. AWS Console → CloudWatch → Log groups
2. /aws/lambda/cs-chatbot-api-AIResponseGenerator 로그 그룹 선택
3. 최신 로그 스트림 확인
4. 다음 로그 메시지 확인:
   - "Selected model: claude-4-sonnet (complexity: simple, priority: normal)"
   - "AI response generated using claude-4-1-opus for inquiry: ..."

5. 환경변수 확인:
   - AWS Console → Lambda → cs-chatbot-api-AIResponseGenerator
   - Configuration → Environment variables 탭
   - BEDROCK_DEFAULT_MODEL, BEDROCK_FALLBACK_MODEL 등 확인
""")

def generate_curl_commands():
    """cURL 명령어 생성"""
    
    print("\n🔧 cURL 테스트 명령어")
    print("=" * 60)
    
    curl_commands = [
        {
            "name": "간단한 문의",
            "command": f"""curl -X POST {API_BASE_URL}/api/ai-response \\
  -H "Content-Type: application/json" \\
  -d '{{"title": "인사", "content": "안녕하세요", "category": "general", "urgency": "normal"}}'"""
        },
        {
            "name": "복잡한 문의",
            "command": f"""curl -X POST {API_BASE_URL}/api/ai-response \\
  -H "Content-Type: application/json" \\
  -d '{{"title": "복잡한 기술 문의", "content": "결제 시스템에 문제가 있어서 상세한 분석과 해결방법이 필요합니다.", "category": "technical", "urgency": "normal"}}'"""
        }
    ]
    
    for cmd in curl_commands:
        print(f"\n# {cmd['name']}")
        print(cmd['command'])

def check_environment_variables():
    """현재 환경변수 설정 확인"""
    
    print("\n⚙️ 현재 환경변수 설정")
    print("=" * 60)
    
    env_vars = [
        "BEDROCK_DEFAULT_MODEL",
        "BEDROCK_FALLBACK_MODEL", 
        "BEDROCK_FAST_MODEL",
        "BEDROCK_MAX_TOKENS",
        "BEDROCK_TEMPERATURE",
        "BEDROCK_SELECTION_STRATEGY"
    ]
    
    for var in env_vars:
        value = os.getenv(var, "Not set")
        print(f"{var}: {value}")

if __name__ == "__main__":
    print("🔧 Bedrock 모델 스위칭 테스트")
    print("=" * 60)
    
    # 실제 API URL 입력 받기
    api_url = input("API Gateway URL을 입력하세요 (예: https://abc123.execute-api.us-east-1.amazonaws.com/prod): ").strip()
    
    if api_url:
        API_BASE_URL = api_url
        print(f"✅ API URL 설정: {API_BASE_URL}")
        
        # 테스트 실행
        test_ai_response_with_different_complexities()
    else:
        print("⚠️ API URL이 입력되지 않았습니다. 가이드만 표시합니다.")
    
    # 가이드 표시
    test_model_configuration_via_logs()
    generate_curl_commands()
    check_environment_variables()
    
    print("\n🎯 모델 스위칭 확인 체크리스트:")
    print("□ CloudWatch 로그에서 'Selected model' 메시지 확인")
    print("□ 간단한 요청 → claude-4-sonnet 선택 확인")
    print("□ 복잡한 요청 → claude-4-1-opus 선택 확인")
    print("□ 높은 우선순위 → claude-4-1-opus 선택 확인")
    print("□ Lambda 환경변수 설정 확인")
    print("□ 다른 환경변수 값으로 변경 후 재배포 테스트")