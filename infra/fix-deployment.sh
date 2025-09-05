#!/bin/bash
set -e

export AWS_PROFILE=aws-hackathon

echo "🔧 프론트엔드 배포 문제 해결 중..."

# 1. 현재 상태 확인
echo "📊 현재 스택 상태 확인..."
STACK_STATUS=$(aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].StackStatus' --output text --region us-east-1)
echo "현재 상태: $STACK_STATUS"

if [[ $STACK_STATUS == *"IN_PROGRESS"* ]]; then
    echo "⚠️  스택이 진행 중 상태입니다. 취소를 시도합니다..."
    
    # 2. 스택 업데이트 취소 시도
    echo "🛑 스택 업데이트 취소 중..."
    aws cloudformation cancel-update-stack --stack-name cs-chatbot-frontend --region us-east-1 || true
    
    # 3. 취소 완료까지 대기
    echo "⏳ 취소 완료 대기 중..."
    aws cloudformation wait stack-update-complete --stack-name cs-chatbot-frontend --region us-east-1 || true
    
    # 4. 상태 재확인
    STACK_STATUS=$(aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].StackStatus' --output text --region us-east-1)
    echo "취소 후 상태: $STACK_STATUS"
fi

# 5. 프론트엔드 빌드 정리 및 재빌드
echo "🔨 프론트엔드 빌드 정리 및 재빌드..."
cd ../frontend

# 기존 빌드 결과 삭제
rm -rf out/
rm -rf .next/
rm -rf node_modules/.cache/

# 의존성 재설치
echo "📦 의존성 재설치..."
npm ci

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

# 6. 스택 재배포
echo "🚀 스택 재배포 시작..."
cdk deploy cs-chatbot-frontend --require-approval never --concurrency 10

echo "✅ 배포 완료!"

# 7. 엔드포인트 출력
echo ""
echo "🌐 배포된 서비스 엔드포인트:"
echo "="*50
CF_URL=$(aws cloudformation describe-stacks --stack-name cs-chatbot-frontend --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text --region us-east-1 2>/dev/null || echo "없음")
echo "📱 프론트엔드: $CF_URL"
echo "="*50