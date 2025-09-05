#!/bin/bash
set -e

# 사용법 출력
show_usage() {
    echo "🚀 CS 챗봇 DEV 환경 배포 스크립트"
    echo ""
    echo "사용법: ./deploy-dev.sh [개발자명] [스택명] [옵션]"
    echo ""
    echo "개발자명: (필수) 본인 이름 (영문, 소문자)"
    echo "  예: dahye, jeongmin, dana, gyuwon"
    echo ""
    echo "스택명:"
    echo "  data           DynamoDB 테이블 (~10초)"
    echo "  api            Lambda API (~15초)"
    echo "  frontend       CloudFront + S3 (~20초)"
    echo "  all            전체 배포 (기본값)"
    echo ""
    echo "옵션:"
    echo "  --fast, -f     빠른 배포 (의존성 설치 스킵)"
    echo "  --help, -h     도움말"
    echo ""
    echo "예시:"
    echo "  ./deploy-dev.sh dahye frontend      # 다혜의 프론트엔드 배포"
    echo "  ./deploy-dev.sh jeongmin api --fast # 정민의 API 빠른 배포"
    echo "  ./deploy-dev.sh dana                # 다나의 전체 배포"
    echo ""
    echo "📌 각 개발자는 독립적인 AWS 리소스를 가집니다:"
    echo "  - DynamoDB: cs-inquiries-dev-{개발자명}"
    echo "  - API: CS Chatbot API (dev-{개발자명})"
    echo "  - S3: cs-chatbot-frontend-dev-{개발자명}-{계정ID}"
}

# 환경 설정
setup_environment() {
    export AWS_PROFILE=aws-hackathon
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3가 설치되어 있지 않습니다."
        exit 1
    fi
    
    if ! command -v cdk &> /dev/null; then
        echo "❌ AWS CDK CLI가 설치되어 있지 않습니다."
        echo "설치: npm install -g aws-cdk"
        exit 1
    fi
}

# 의존성 설치 (빠른 모드가 아닐 때만)
install_dependencies() {
    if [ "$FAST_MODE" != "true" ]; then
        if [ ! -d "venv" ]; then
            echo "📦 가상환경 생성..."
            python3 -m venv venv
        fi
        
        echo "🔧 가상환경 활성화..."
        source venv/bin/activate
        
        echo "📥 의존성 설치..."
        pip install --upgrade pip > /dev/null 2>&1
        pip install -r requirements.txt > /dev/null 2>&1
    else
        if [ -d "venv" ]; then
            source venv/bin/activate
        fi
    fi
}

# 배포 상태 확인
check_deployment_status() {
    local stack_name=$1
    local status=$(aws cloudformation describe-stacks --stack-name $stack_name --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_EXISTS")
    
    if [[ $status == *"IN_PROGRESS"* ]]; then
        echo "⚠️  $stack_name 스택이 현재 배포 중입니다. 잠시 후 다시 시도하세요."
        echo "현재 상태: $status"
        return 1
    fi
    return 0
}

# 엔드포인트 출력
show_endpoints() {
    local stack_name=$1
    local developer=$2
    echo ""
    echo "🌐 배포된 DEV 서비스 엔드포인트 (${developer}):"
    echo "="*60
    
    case $stack_name in
        "frontend")
            local cf_url=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-frontend --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text 2>/dev/null || echo "없음")
            echo "📱 프론트엔드: $cf_url"
            echo "✨ CloudFront 캐시 무효화: 완료"
            echo "🔄 새로고침 후 최신 콘텐츠 확인 가능"
            ;;
        "api")
            local api_url=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-api --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text 2>/dev/null || echo "없음")
            echo "🔗 API 엔드포인트: $api_url"
            ;;
        "data")
            local table_name=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-data --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' --output text 2>/dev/null || echo "없음")
            echo "💾 DynamoDB 테이블: $table_name"
            ;;
        "all")
            local cf_url=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-frontend --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontUrl`].OutputValue' --output text 2>/dev/null || echo "없음")
            local api_url=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-api --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text 2>/dev/null || echo "없음")
            local table_name=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-data --query 'Stacks[0].Outputs[?OutputKey==`TableName`].OutputValue' --output text 2>/dev/null || echo "없음")
            echo "📱 프론트엔드: $cf_url"
            echo "🔗 API 엔드포인트: $api_url"
            echo "💾 DynamoDB 테이블: $table_name"
            echo "✨ CloudFront 캐시 무효화: 완료"
            echo "🔄 새로고침 후 최신 콘텐츠 확인 가능"
            ;;
    esac
    echo "="*60
    echo ""
}

# 개별 스택 배포
deploy_stack() {
    local developer=$1
    local stack_name=$2
    local start_time=$(date +%s)
    
    # 환경변수 설정
    export DEVELOPER=$developer
    
    case $stack_name in
        "data")
            echo "💾 데이터 스택 배포 중... (dev-${developer})"
            check_deployment_status "cs-chatbot-dev-${developer}-data" || exit 1
            cdk deploy cs-chatbot-dev-${developer}-data --require-approval never --concurrency 10
            ;;
        "api")
            echo "🔗 API 스택 배포 중... (dev-${developer})"
            check_deployment_status "cs-chatbot-dev-${developer}-api" || exit 1
            cdk deploy cs-chatbot-dev-${developer}-api --require-approval never --concurrency 10
            ;;
        "frontend")
            echo "🌐 프론트엔드 스택 배포 중... (dev-${developer})"
            check_deployment_status "cs-chatbot-dev-${developer}-frontend" || exit 1
            
            # Next.js 빌드
            echo "🔨 Next.js 빌드 중..."
            cd ../frontend
            
            # Node.js 의존성 설치 (항상 실행)
            echo "  📦 npm 의존성 설치..."
            npm install
            
            # API URL 가져오기 및 환경변수 설정
            echo "  🔗 API URL 설정..."
            API_URL=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-api --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text 2>/dev/null || echo "")
            if [ -n "$API_URL" ]; then
                echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local
                echo "  ✅ API URL 설정 완료: $API_URL"
            else
                echo "  ⚠️  API URL을 찾을 수 없습니다. 기본값 사용"
            fi
            
            # 빌드 실행
            echo "  🔨 빌드 실행..."
            npm run build
            
            # 빌드 결과 확인
            if [ ! -d "out" ]; then
                echo "❌ Next.js 빌드 실패 - out 폴더가 생성되지 않았습니다"
                echo "generateStaticParams 함수를 확인하세요."
                exit 1
            fi
            
            cd ../infra
            
            cdk deploy cs-chatbot-dev-${developer}-frontend --require-approval never --concurrency 10
            
            # CloudFront invalidation 수동 실행
            echo "✨ CloudFront 캐시 무효화 진행 중..."
            
            # CloudFront Distribution ID 가져오기
            DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-frontend --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text 2>/dev/null || echo "")
            
            if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
                echo "  🔄 Distribution ID: $DISTRIBUTION_ID"
                aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" > /dev/null 2>&1
                echo "  ✅ 캐시 무효화 요청 완료"
            else
                echo "  ⚠️  Distribution ID를 찾을 수 없습니다"
            fi
            
            sleep 2
            ;;
        "all")
            echo "🚀 전체 스택 배포 중... (dev-${developer})"
            # 각 스택 상태 확인
            check_deployment_status "cs-chatbot-dev-${developer}-data" || exit 1
            check_deployment_status "cs-chatbot-dev-${developer}-api" || exit 1
            check_deployment_status "cs-chatbot-dev-${developer}-frontend" || exit 1
            
            # Next.js 빌드
            echo "🔨 Next.js 빌드 중..."
            cd ../frontend
            
            # Node.js 의존성 설치 (항상 실행)
            echo "  📦 npm 의존성 설치..."
            npm install
            
            cd ../infra
            
            # 의존성 순서대로 배포 (API 먼저)
            cdk deploy cs-chatbot-dev-${developer}-data --require-approval never --concurrency 10
            cdk deploy cs-chatbot-dev-${developer}-api --require-approval never --concurrency 10
            
            # API URL 가져오기 및 프론트엔드 빌드
            cd ../frontend
            echo "  🔗 API URL 설정..."
            API_URL=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-api --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text 2>/dev/null || echo "")
            if [ -n "$API_URL" ]; then
                echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local
                echo "  ✅ API URL 설정 완료: $API_URL"
            else
                echo "  ⚠️  API URL을 찾을 수 없습니다. 기본값 사용"
            fi
            
            # 빌드 실행
            echo "  🔨 빌드 실행..."
            npm run build
            
            # 빌드 결과 확인
            if [ ! -d "out" ]; then
                echo "❌ Next.js 빌드 실패 - out 폴더가 생성되지 않았습니다"
                echo "generateStaticParams 함수를 확인하세요."
                exit 1
            fi
            
            cd ../infra
            
            # 프론트엔드 배포
            cdk deploy cs-chatbot-dev-${developer}-frontend --require-approval never --concurrency 10
            
            # CloudFront invalidation 수동 실행
            echo "✨ CloudFront 캐시 무효화 진행 중..."
            
            # CloudFront Distribution ID 가져오기
            DISTRIBUTION_ID=$(aws cloudformation describe-stacks --stack-name cs-chatbot-dev-${developer}-frontend --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text 2>/dev/null || echo "")
            
            if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "None" ]; then
                echo "  🔄 Distribution ID: $DISTRIBUTION_ID"
                aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*" > /dev/null 2>&1
                echo "  ✅ 캐시 무효화 요청 완료"
            else
                echo "  ⚠️  Distribution ID를 찾을 수 없습니다"
            fi
            
            sleep 2
            ;;
        *)
            echo "❌ 알 수 없는 스택: $stack_name"
            show_usage
            exit 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo "✅ $stack_name 배포 완료! (dev-${developer}, ${duration}초)"
    
    # 배포 완료 후 엔드포인트 출력
    show_endpoints $stack_name $developer
}

# 메인 실행
main() {
    local FAST_MODE=false
    local DEVELOPER=""
    local STACK_NAME="all"
    
    # 개발자명이 첫 번째 인자인지 확인
    if [ $# -eq 0 ]; then
        echo "❌ 개발자명이 필요합니다."
        show_usage
        exit 1
    fi
    
    DEVELOPER=$1
    shift
    
    # 개발자명 검증
    if [[ ! $DEVELOPER =~ ^[a-z]+$ ]]; then
        echo "❌ 개발자명은 영문 소문자만 사용 가능합니다: $DEVELOPER"
        show_usage
        exit 1
    fi
    
    # 두 번째 인자가 스택명인지 확인
    if [[ $1 =~ ^(data|api|frontend|all)$ ]]; then
        STACK_NAME=$1
        shift
    fi
    
    # 나머지 옵션 파싱
    while [[ $# -gt 0 ]]; do
        case $1 in
            --fast|-f)
                FAST_MODE=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            data|api|frontend|all)
                STACK_NAME=$1
                shift
                ;;
            *)
                echo "❌ 알 수 없는 옵션: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    local mode_text="기본"
    if [ "$FAST_MODE" = "true" ]; then
        mode_text="빠른"
    fi
    
    echo "🚀 CS 챗봇 DEV 환경 배포 시작"
    echo "👤 개발자: $DEVELOPER"
    echo "📦 스택: $STACK_NAME"
    echo "⚡ 모드: $mode_text"
    echo "📌 독립적인 DEV 리소스 생성/업데이트"
    
    setup_environment
    install_dependencies
    
    # 부트스트랩 (빠른 모드가 아닐 때만)
    if [ "$FAST_MODE" != "true" ]; then
        echo "🏗️ CDK 부트스트랩..."
        cdk bootstrap > /dev/null 2>&1 || true
    fi
    
    deploy_stack $DEVELOPER $STACK_NAME
    
    echo "📋 배포 상태 확인: cdk list"
    echo "🗑️ DEV 환경 정리: ./destroy-dev.sh $DEVELOPER"
}

# 스크립트 실행
main "$@"