#!/usr/bin/env python3
"""
Claude Sonnet 4 모델 Cross-Region Inference 테스트
참고: https://docs.aws.amazon.com/bedrock/latest/userguide/cross-region-inference.html
"""
import boto3
from botocore.exceptions import ClientError

def list_available_inference_profiles():
    """사용 가능한 Inference Profile 목록 조회"""
    
    print("🔍 사용 가능한 Inference Profile 조회:")
    print("=" * 50)
    
    session = boto3.Session(profile_name='aws-hackathon')
    bedrock_client = session.client("bedrock", region_name="us-east-1")
    
    try:
        response = bedrock_client.list_inference_profiles()
        
        claude_profiles = []
        for profile in response.get('inferenceProfileSummaries', []):
            profile_id = profile['inferenceProfileId']
            profile_name = profile['inferenceProfileName']
            
            if 'claude' in profile_id.lower() or 'claude' in profile_name.lower():
                claude_profiles.append((profile_id, profile_name))
                print(f"🎯 {profile_id}")
                print(f"   📝 {profile_name}")
                
                # 모델 정보가 있다면 출력
                if 'models' in profile:
                    for model in profile['models']:
                        print(f"   🤖 {model.get('modelId', 'N/A')}")
                print()
        
        return claude_profiles
        
    except ClientError as e:
        print(f"❌ Inference Profile 조회 실패: {e}")
        return []
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {str(e)}")
        return []

def test_claude_sonnet4_with_inference_profiles():
    """Inference Profile을 사용한 Claude Sonnet 4 테스트"""
    
    # CRIS 지원 리전 (us-east-1에서 다른 리전의 모델에 접근)
    region = "us-east-1"
    
    # Claude Sonnet 4 Inference Profile ARNs (CRIS용)
    inference_profiles = [
        # Cross-region inference profiles for Claude Sonnet 4
        "us.anthropic.claude-sonnet-4-20250514-v1:0",
        "eu.anthropic.claude-sonnet-4-20250514-v1:0", 
        "apac.anthropic.claude-sonnet-4-20250514-v1:0",
        # 직접 모델 ID도 시도
        "anthropic.claude-sonnet-4-20250514-v1:0"
    ]
    
    # 테스트 메시지
    user_message = "안녕하세요! CS 챗봇 테스트입니다. 간단히 인사해주세요."
    conversation = [
        {
            "role": "user",
            "content": [{"text": user_message}],
        }
    ]
    
    print(f"\n🤖 Claude Sonnet 4 Cross-Region Inference 테스트")
    print(f"🌍 기본 리전: {region} (CRIS 사용)")
    print("=" * 70)
    
    # AWS 세션 생성 (aws-hackathon 프로필 사용)
    session = boto3.Session(profile_name='aws-hackathon')
    client = session.client("bedrock-runtime", region_name=region)
    
    successful_profiles = []
    
    for profile_id in inference_profiles:
        print(f"\n🎯 Inference Profile 테스트: {profile_id}")
        print("-" * 50)
        
        try:
            print(f"🔄 {profile_id} 호출 중...")
            
            # Inference Profile을 사용한 모델 호출
            response = client.converse(
                modelId=profile_id,  # Inference Profile ID 사용
                messages=conversation,
                inferenceConfig={
                    "maxTokens": 200, 
                    "temperature": 0.5, 
                    "topP": 0.9
                },
            )
            
            # 응답 추출
            response_text = response["output"]["message"]["content"][0]["text"]
            
            print(f"✅ {profile_id} 성공!")
            print(f"🎯 응답: {response_text}")
            successful_profiles.append(profile_id)
            
            # 첫 번째 성공한 프로필로 충분하므로 중단
            break
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            
            print(f"❌ {profile_id} 실패: {error_code}")
            
            if "isn't supported" in error_message:
                print(f"   💡 해당 프로필에서 모델 미지원")
            elif "AccessDeniedException" in error_code:
                print(f"   💡 모델 접근 권한 없음")
            elif "ValidationException" in error_code:
                print(f"   💡 프로필 ID 또는 설정 오류")
            elif "ResourceNotFoundException" in error_code:
                print(f"   💡 프로필을 찾을 수 없음")
            else:
                print(f"   📋 상세: {error_message}")
                
        except Exception as e:
            print(f"❌ {profile_id} 예상치 못한 오류: {str(e)}")
    
    # 결과 요약
    print("\n" + "=" * 70)
    print("📊 테스트 결과 요약:")
    print("-" * 30)
    
    if successful_profiles:
        print(f"✅ 성공한 Inference Profile:")
        for profile in successful_profiles:
            print(f"   🎯 {profile}")
        
        print(f"\n🎉 권장 Profile: {successful_profiles[0]}")
        print("💡 이 Profile ID를 백엔드 Lambda에서 사용하세요!")
        
    else:
        print("❌ 모든 Inference Profile에서 실패")
        print("\n📋 해결 방법:")
        print("1. AWS 콘솔 > Bedrock > Model access 확인")
        print("2. Claude Sonnet 4 모델 활성화")
        print("3. Cross-region inference 권한 확인")
        print("4. 올바른 Inference Profile ARN 사용")
        print("5. 대안 Claude 모델 시도")
    
    return successful_profiles

def test_alternative_claude_models():
    """대안 Claude 모델들 테스트"""
    
    alternative_models = [
        "anthropic.claude-3-5-sonnet-20241022-v2:0",
        "anthropic.claude-3-5-sonnet-20240620-v1:0", 
        "anthropic.claude-3-sonnet-20240229-v1:0",
        "anthropic.claude-3-haiku-20240307-v1:0"
    ]
    
    print("\n🔄 대안 Claude 모델 테스트:")
    print("=" * 50)
    
    session = boto3.Session(profile_name='aws-hackathon')
    client = session.client("bedrock-runtime", region_name="us-east-1")
    
    user_message = "안녕하세요!"
    conversation = [{"role": "user", "content": [{"text": user_message}]}]
    
    working_models = []
    
    for model_id in alternative_models:
        print(f"\n🤖 테스트: {model_id}")
        
        try:
            response = client.converse(
                modelId=model_id,
                messages=conversation,
                inferenceConfig={"maxTokens": 100, "temperature": 0.5},
            )
            
            response_text = response["output"]["message"]["content"][0]["text"]
            print(f"✅ 성공: {response_text[:30]}...")
            working_models.append(model_id)
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            print(f"❌ 실패: {error_code}")
    
    return working_models

if __name__ == "__main__":
    print("🚀 Claude Sonnet 4 Cross-Region Inference 테스트 시작")
    
    # 사용 가능한 Inference Profile 조회
    available_profiles = list_available_inference_profiles()
    
    # Inference Profile을 사용한 테스트
    successful_profiles = test_claude_sonnet4_with_inference_profiles()
    
    # 실패한 경우 대안 모델 테스트
    if not successful_profiles:
        print("\n🔄 대안 Claude 모델로 테스트 진행...")
        working_models = test_alternative_claude_models()
        
        if working_models:
            print(f"\n💡 대안으로 사용 가능한 모델: {working_models[0]}")
            print("📝 백엔드에서 이 모델 ID를 사용하세요.")
        else:
            print("\n⚠️  사용 가능한 Claude 모델이 없습니다.")
            print("\n📋 추가 확인사항:")
            print("1. AWS 콘솔에서 Bedrock 모델 액세스 상태 확인")
            print("2. 계정의 Bedrock 권한 확인")
            print("3. 리전별 모델 가용성 확인")
    else:
        print(f"\n🎉 Claude Sonnet 4 사용 준비 완료!")
        print(f"📝 백엔드에서 사용할 Profile ID: {successful_profiles[0]}")