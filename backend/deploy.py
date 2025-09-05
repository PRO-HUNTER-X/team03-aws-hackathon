#!/usr/bin/env python3
"""
Lambda 배포 스크립트
각 Lambda 함수를 개별적으로 배포하기 위한 헬퍼 스크립트
"""

import os
import zipfile
import boto3
from pathlib import Path

def create_deployment_package(function_name: str) -> str:
    """Lambda 배포 패키지 생성"""
    
    # 배포 패키지 디렉토리 생성
    package_dir = Path(f"./packages/{function_name}")
    package_dir.mkdir(parents=True, exist_ok=True)
    
    # 소스 코드 복사
    os.system(f"cp -r src/ {package_dir}/")
    os.system(f"cp lambda_functions/{function_name}.py {package_dir}/")
    
    # requirements 설치
    os.system(f"pip install -r requirements.txt -t {package_dir}/")
    
    # ZIP 파일 생성
    zip_path = f"./packages/{function_name}.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, package_dir)
                zipf.write(file_path, arcname)
    
    return zip_path

def deploy_lambda(function_name: str, zip_path: str):
    """Lambda 함수 배포"""
    
    lambda_client = boto3.client('lambda')
    
    try:
        # 함수 업데이트
        with open(zip_path, 'rb') as zip_file:
            lambda_client.update_function_code(
                FunctionName=f"cs-chatbot-{function_name}",
                ZipFile=zip_file.read()
            )
        print(f"✅ {function_name} 함수 업데이트 완료")
        
    except lambda_client.exceptions.ResourceNotFoundException:
        print(f"❌ {function_name} 함수를 찾을 수 없습니다. AWS CDK로 먼저 생성해주세요.")

def main():
    """메인 배포 함수"""
    
    functions = [
        'create_inquiry',
        'get_inquiry', 
        'auth',
        'admin',
        'update_status'
    ]
    
    print("🚀 Lambda 함수 배포 시작...")
    
    for function_name in functions:
        print(f"📦 {function_name} 패키징 중...")
        zip_path = create_deployment_package(function_name)
        
        print(f"🚀 {function_name} 배포 중...")
        deploy_lambda(function_name, zip_path)
    
    print("✅ 모든 Lambda 함수 배포 완료!")

if __name__ == "__main__":
    main()