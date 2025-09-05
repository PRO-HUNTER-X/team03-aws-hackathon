#!/bin/bash
set -e

# 사용법 출력
show_usage() {
    echo "🗑️ CS 챗봇 DEV 환경 정리 스크립트"
    echo ""
    echo "사용법: ./destroy-dev.sh [개발자명] [옵션]"
    echo ""
    echo "개발자명: (필수) 본인 이름 (영문, 소문자)"
    echo "  예: dahye, jeongmin, dana, gyuwon"
    echo ""
    echo "옵션:"
    echo "  --force, -f    확인 없이 강제 삭제"
    echo "  --help, -h     도움말"
    echo ""
    echo "예시:"
    echo "  ./destroy-dev.sh dahye          # 다혜의 dev 환경 삭제 (확인 후)"
    echo "  ./destroy-dev.sh jeongmin -f    # 정민의 dev 환경 강제 삭제"
    echo ""
    echo "⚠️ 주의: 이 명령은 해당 개발자의 모든 DEV 리소스를 삭제합니다!"
    echo "  - DynamoDB: cs-inquiries-dev-{개발자명}"
    echo "  - API Gateway: CS Chatbot API (dev-{개발자명})"
    echo "  - S3 + CloudFront: cs-chatbot-frontend-dev-{개발자명}"
}

# 환경 설정
setup_environment() {
    export AWS_PROFILE=aws-hackathon
    
    if ! command -v cdk &> /dev/null; then
        echo "❌ AWS CDK CLI가 설치되어 있지 않습니다."
        echo "설치: npm install -g aws-cdk"
        exit 1
    fi
    
    if [ -d "venv" ]; then
        source venv/bin/activate
    fi
}

# 스택 존재 여부 확인
check_stack_exists() {
    local stack_name=$1
    local status=$(aws cloudformation describe-stacks --stack-name $stack_name --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_EXISTS")
    
    if [ "$status" = "NOT_EXISTS" ]; then
        return 1
    fi
    return 0
}

# 스택 목록 출력
show_stacks() {
    local developer=$1
    echo ""
    echo "🔍 $developer 개발자의 DEV 스택 현황:"
    echo "="*50
    
    local data_stack="cs-chatbot-dev-${developer}-data"
    local api_stack="cs-chatbot-dev-${developer}-api"
    local frontend_stack="cs-chatbot-dev-${developer}-frontend"
    
    if check_stack_exists $data_stack; then
        echo "💾 데이터 스택: $data_stack ✅"
    else
        echo "💾 데이터 스택: $data_stack ❌"
    fi
    
    if check_stack_exists $api_stack; then
        echo "🔗 API 스택: $api_stack ✅"
    else
        echo "🔗 API 스택: $api_stack ❌"
    fi
    
    if check_stack_exists $frontend_stack; then
        echo "🌐 프론트엔드 스택: $frontend_stack ✅"
    else
        echo "🌐 프론트엔드 스택: $frontend_stack ❌"
    fi
    
    echo "="*50
    echo ""
}

# 확인 메시지
confirm_deletion() {
    local developer=$1
    
    echo "⚠️ 경고: $developer 개발자의 모든 DEV 리소스가 삭제됩니다!"
    echo ""
    echo "삭제될 리소스:"
    echo "  - DynamoDB 테이블: cs-inquiries-dev-$developer"
    echo "  - Lambda 함수들 (API)"
    echo "  - API Gateway"
    echo "  - S3 버킷 및 모든 파일"
    echo "  - CloudFront 배포"
    echo ""
    read -p "정말로 삭제하시겠습니까? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "❌ 삭제가 취소되었습니다."
        exit 0
    fi
}

# DEV 환경 삭제
destroy_dev_environment() {
    local developer=$1
    local force=$2
    
    # 환경변수 설정
    export DEVELOPER=$developer
    
    local data_stack="cs-chatbot-dev-${developer}-data"
    local api_stack="cs-chatbot-dev-${developer}-api"
    local frontend_stack="cs-chatbot-dev-${developer}-frontend"
    
    # 스택 존재 여부 확인
    local has_stacks=false
    if check_stack_exists $data_stack || check_stack_exists $api_stack || check_stack_exists $frontend_stack; then
        has_stacks=true
    fi
    
    if [ "$has_stacks" = "false" ]; then
        echo "ℹ️ $developer 개발자의 DEV 스택이 존재하지 않습니다."
        exit 0
    fi
    
    # 확인 (강제 모드가 아닐 때만)
    if [ "$force" != "true" ]; then
        confirm_deletion $developer
    fi
    
    echo "🗑️ DEV 환경 삭제 시작... (dev-${developer})"
    
    # 역순으로 삭제 (의존성 고려)
    if check_stack_exists $frontend_stack; then
        echo "🌐 프론트엔드 스택 삭제 중..."
        cdk destroy $frontend_stack --force
    fi
    
    if check_stack_exists $api_stack; then
        echo "🔗 API 스택 삭제 중..."
        cdk destroy $api_stack --force
    fi
    
    if check_stack_exists $data_stack; then
        echo "💾 데이터 스택 삭제 중..."
        cdk destroy $data_stack --force
    fi
    
    echo "✅ $developer 개발자의 DEV 환경이 완전히 삭제되었습니다!"
    echo ""
    echo "🔄 새로운 DEV 환경 생성: ./deploy-dev.sh $developer"
}

# 메인 실행
main() {
    local FORCE_MODE=false
    local DEVELOPER=""
    
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
    
    # 나머지 옵션 파싱
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force|-f)
                FORCE_MODE=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            *)
                echo "❌ 알 수 없는 옵션: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🗑️ CS 챗봇 DEV 환경 정리"
    echo "👤 개발자: $DEVELOPER"
    
    setup_environment
    show_stacks $DEVELOPER
    destroy_dev_environment $DEVELOPER $FORCE_MODE
}

# 스크립트 실행
main "$@"