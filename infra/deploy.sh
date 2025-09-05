#!/bin/bash
set -e

echo "🚀 CS 챗봇 인프라 배포 시작..."

# Set AWS profile
export AWS_PROFILE=aws-hackathon

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3가 설치되어 있지 않습니다."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 가상환경 생성 중..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 가상환경 활성화..."
source venv/bin/activate

# Upgrade pip and install dependencies
echo "📥 의존성 설치 중..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if CDK is installed globally
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK CLI가 설치되어 있지 않습니다."
    echo "다음 명령어로 설치하세요: npm install -g aws-cdk"
    exit 1
fi

# Bootstrap CDK (run once per account/region)
echo "🏗️  CDK 부트스트랩..."
cdk bootstrap

# Deploy all stacks
echo "🚀 스택 배포 중..."
cdk deploy --all --require-approval never

echo "✅ 배포 완료!"
echo "📋 배포된 리소스를 확인하려면: cdk list"