#!/usr/bin/env python3
"""
원클릭 환경 설정 스크립트
심사위원/운영진용 완전 자동화 설치
"""
import subprocess
import sys
import os

def run_command(cmd, description):
    print(f"🔧 {description}...")
    try:
        subprocess.run(cmd, shell=True, check=True)
        print(f"✅ {description} 완료")
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} 실패: {e}")
        sys.exit(1)

def main():
    print("🚀 CS 챗봇 환경 설정 시작...")
    
    # Check prerequisites
    print("📋 사전 요구사항 확인...")
    
    # Check Node.js for CDK
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js가 설치되어 있지 않습니다.")
        print("https://nodejs.org 에서 설치하세요.")
        sys.exit(1)
    
    # Install CDK globally
    run_command("npm install -g aws-cdk", "AWS CDK CLI 설치")
    
    # Create virtual environment
    run_command("python3 -m venv venv", "Python 가상환경 생성")
    
    # Install Python dependencies
    if os.name == 'nt':  # Windows
        activate_cmd = "venv\\Scripts\\activate && "
    else:  # Unix/Linux/macOS
        activate_cmd = "source venv/bin/activate && "
    
    run_command(f"{activate_cmd}pip install --upgrade pip", "pip 업그레이드")
    run_command(f"{activate_cmd}pip install -r requirements.txt", "Python 의존성 설치")
    
    print("✅ 환경 설정 완료!")
    print("📋 다음 단계:")
    print("1. AWS CLI 프로필 설정: aws configure --profile aws-hackathon")
    print("2. 배포 실행: ./deploy.sh")

if __name__ == "__main__":
    main()