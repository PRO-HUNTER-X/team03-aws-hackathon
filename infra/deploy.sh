#!/bin/bash
set -e

# 사용법 출력
show_usage() {
    echo "🚀 CS 챗봇 배포 스크립트"
    echo ""
    echo "사용법: ./deploy.sh [스택명] [옵션]"
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
    echo "  ./deploy.sh frontend      # 프론트엔드만 배포"
    echo "  ./deploy.sh api --fast    # API 빠른 배포"
    echo "  ./deploy.sh               # 전체 배포"
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

# 개별 스택 배포
deploy_stack() {
    local stack_name=$1
    local start_time=$(date +%s)
    
    case $stack_name in
        "data")
            echo "💾 데이터 스택 배포 중..."
            check_deployment_status "cs-chatbot-data" || exit 1
            cdk deploy cs-chatbot-data --require-approval never --concurrency 10
            ;;
        "api")
            echo "🔗 API 스택 배포 중..."
            check_deployment_status "cs-chatbot-api" || exit 1
            cdk deploy cs-chatbot-api --require-approval never --concurrency 10
            ;;
        "frontend")
            echo "🌐 프론트엔드 스택 배포 중..."
            check_deployment_status "cs-chatbot-frontend" || exit 1
            
            # Next.js 빌드
            echo "🔨 Next.js 빌드 중..."
            cd ../frontend
            npm install > /dev/null 2>&1
            npm run build > /dev/null 2>&1
            cd ../infra
            
            cdk deploy cs-chatbot-frontend --require-approval never --concurrency 10
            ;;
        "all")
            echo "🚀 전체 스택 배포 중..."
            # 각 스택 상태 확인
            check_deployment_status "cs-chatbot-data" || exit 1
            check_deployment_status "cs-chatbot-api" || exit 1
            check_deployment_status "cs-chatbot-frontend" || exit 1
            
            # Next.js 빌드
            echo "🔨 Next.js 빌드 중..."
            cd ../frontend
            npm install > /dev/null 2>&1
            npm run build > /dev/null 2>&1
            cd ../infra
            
            # 의존성 순서대로 배포
            cdk deploy cs-chatbot-data --require-approval never --concurrency 10
            cdk deploy cs-chatbot-api --require-approval never --concurrency 10  
            cdk deploy cs-chatbot-frontend --require-approval never --concurrency 10
            ;;
        *)
            echo "❌ 알 수 없는 스택: $stack_name"
            show_usage
            exit 1
            ;;
    esac
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    echo "✅ $stack_name 배포 완료! (${duration}초)"
}

# 메인 실행
main() {
    local FAST_MODE=false
    local STACK_NAME="all"
    
    # 첫 번째 인자가 스택명인지 확인
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
    
    echo "🚀 CS 챗봇 배포 시작 (스택: $STACK_NAME, 빠른모드: $FAST_MODE)"
    echo "📌 고정 엔드포인트 유지: 모든 개발자가 동일한 스택 업데이트"
    
    setup_environment
    install_dependencies
    
    # 부트스트랩 (빠른 모드가 아닐 때만)
    if [ "$FAST_MODE" != "true" ]; then
        echo "🏗️ CDK 부트스트랩..."
        cdk bootstrap > /dev/null 2>&1 || true
    fi
    
    deploy_stack $STACK_NAME
    
    echo "📋 배포 상태 확인: cdk list"
}

# 스크립트 실행
main "$@"