#!/bin/bash
set -e

echo "🧹 프론트엔드 스택 완전 삭제 후 재배포"

# 1. 현재 상태 확인
echo "📊 현재 스택 상태 확인..."
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].StackStatus' --output text --region us-east-1 2>/dev/null || echo "NOT_EXISTS")
echo "현재 상태: $STACK_STATUS"

# 2. 롤백 완료 대기 (필요한 경우)
if [[ $STACK_STATUS == *"ROLLBACK_IN_PROGRESS"* ]]; then
    echo "⏳ 롤백 완료 대기 중..."
    aws cloudformation wait stack-update-rollback-complete --stack-name cs-chatbot-frontend --region us-east-1
    echo "✅ 롤백 완료"
fi

# 3. 스택 완전 삭제
if [[ $STACK_STATUS != "NOT_EXISTS" ]]; then
    echo "🗑️ 프론트엔드 스택 삭제 중..."
    cdk destroy cs-chatbot-frontend --force
    
    echo "⏳ 스택 삭제 완료 대기..."
    aws cloudformation wait stack-delete-complete --stack-name cs-chatbot-frontend --region us-east-1
    echo "✅ 스택 삭제 완료"
fi

# 4. 프론트엔드 빌드 정리 및 재빌드
echo "🔨 프론트엔드 빌드 정리 및 재빌드..."
cd ../frontend

# 기존 빌드 결과 완전 삭제
rm -rf out/
rm -rf .next/
rm -rf node_modules/
rm -rf package-lock.json

# 의존성 새로 설치
echo "📦 의존성 새로 설치..."
npm install

# 빌드 실행
echo "🔨 빌드 실행..."
npm run build

# 빌드 결과 확인
if [ ! -d "out" ]; then
    echo "❌ 빌드 실패 - out 폴더가 생성되지 않았습니다"
    exit 1
fi

echo "✅ 빌드 완료"

cd ../infra

# 5. CDK 부트스트랩 (필요한 경우)
echo "🏗️ CDK 부트스트랩..."
cdk bootstrap

# 6. 스택 새로 배포
echo "🚀 프론트엔드 스택 새로 배포..."
cdk deploy cs-chatbot-frontend --require-approval never

echo "✅ 배포 완료!"

# 7. 엔드포인트 출력
echo ""
echo "🌐 배포된 서비스 엔드포인트:"
echo "="*50
CF_URL=$(aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text --region us-east-1 2>/dev/null || echo "없음")
echo "📱 프론트엔드: $CF_URL"
echo "="*50