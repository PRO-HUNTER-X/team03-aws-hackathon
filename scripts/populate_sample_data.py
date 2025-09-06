#!/usr/bin/env python3
"""
CS 문의 데이터를 기반으로 companies와 qna-data 테이블에 샘플 데이터를 생성하는 스크립트
"""

import boto3
import json
from datetime import datetime, timedelta
import uuid
from typing import List, Dict, Any

# AWS 설정
session = boto3.Session(profile_name='aws-hackathon')
dynamodb = session.resource('dynamodb', region_name='us-east-1')

# 테이블 참조
companies_table = dynamodb.Table('cs-companies')
qna_table = dynamodb.Table('qna-data')

def create_company_data() -> List[Dict[str, Any]]:
    """cs-inquiries 데이터를 기반으로 회사 정보 생성"""
    
    # 실제 문의에서 추출한 회사 ID들
    company_ids = [
        "test-company", "hunters-company", "demo-company", "test123"
    ]
    
    companies = []
    
    # 각 회사별 상세 정보 생성
    company_details = {
        "test-company": {
            "name": "테스트 컴퍼니",
            "industry": "technology",
            "businessType": "startup",
            "companySize": "small",
            "description": "AI 기반 솔루션 테스트를 위한 스타트업",
            "contactEmail": "contact@test-company.com",
            "website": "https://test-company.com"
        },
        "hunters-company": {
            "name": "프로 헌터스",
            "industry": "consulting",
            "businessType": "enterprise",
            "companySize": "medium",
            "description": "전문 컨설팅 및 기술 솔루션 제공 기업",
            "contactEmail": "contact@hunters-company.com",
            "website": "https://hunters-company.com"
        },
        "demo-company": {
            "name": "데모 컴퍼니",
            "industry": "retail",
            "businessType": "corporation",
            "companySize": "large",
            "description": "리테일 및 이커머스 솔루션 데모 기업",
            "contactEmail": "contact@demo-company.com",
            "website": "https://demo-company.com"
        },
        "test123": {
            "name": "테스트123",
            "industry": "education",
            "businessType": "startup",
            "companySize": "small",
            "description": "교육 기술 솔루션 개발 스타트업",
            "contactEmail": "contact@test123.com",
            "website": "https://test123.com"
        }
    }
    
    for company_id in company_ids:
        detail = company_details[company_id]
        company = {
            "companyId": company_id,
            "name": detail["name"],
            "industry": detail["industry"],
            "businessType": detail["businessType"],
            "companySize": detail["companySize"],
            "description": detail["description"],
            "contactEmail": detail["contactEmail"],
            "website": detail["website"],
            "createdAt": (datetime.now() - timedelta(days=30)).isoformat(),
            "updatedAt": datetime.now().isoformat(),
            "isActive": True,
            "subscriptionPlan": "premium" if detail["companySize"] == "large" else "standard",
            "monthlyInquiries": 150 if detail["companySize"] == "large" else 50
        }
        companies.append(company)
    
    return companies

def create_qna_data() -> List[Dict[str, Any]]:
    """실제 문의 내용을 기반으로 QnA 데이터 생성"""
    
    qna_items = []
    
    # 실제 문의에서 추출한 패턴들을 기반으로 QnA 생성
    qna_patterns = [
        {
            "category": "technical",
            "items": [
                {
                    "question": "AI 모델은 어떤 것을 사용하나요?",
                    "answer": "현재 AWS Bedrock의 Claude 3.5 Sonnet 모델을 사용하고 있습니다. 이 모델은 자연어 처리와 대화형 AI에 최적화되어 있어 정확하고 유용한 답변을 제공합니다.",
                    "companyId": "hunters-company"
                },
                {
                    "question": "API 연동은 어떻게 하나요?",
                    "answer": "REST API를 통해 연동 가능합니다. 문서화된 API 스펙을 참고하시고, 인증 토큰을 발급받아 사용하시면 됩니다. 기술 지원팀에서 연동 가이드를 제공해드립니다.",
                    "companyId": "test-company"
                },
                {
                    "question": "배포 시간이 오래 걸리는 이유는?",
                    "answer": "배포 시간은 여러 요인에 영향을 받습니다. 코드 크기, 의존성, 인프라 설정 등을 확인해보시고, 필요시 기술팀에 문의해주세요.",
                    "companyId": "demo-company"
                },
                {
                    "question": "DynamoDB 데이터는 어떻게 조회하나요?",
                    "answer": "AWS 콘솔이나 CLI를 통해 조회 가능합니다. 또한 관리자 대시보드에서 실시간으로 데이터를 확인할 수 있습니다.",
                    "companyId": "hunters-company"
                }
            ]
        },
        {
            "category": "billing",
            "items": [
                {
                    "question": "결제가 안 되는 경우 어떻게 하나요?",
                    "answer": "결제 문제가 발생하면 먼저 카드 정보와 한도를 확인해주세요. 문제가 지속되면 고객지원팀으로 연락주시면 즉시 도움을 드리겠습니다.",
                    "companyId": "hunters-company"
                },
                {
                    "question": "요금제는 어떻게 되나요?",
                    "answer": "기본 요금제는 월 50건 문의 처리가 가능하며, 프리미엄 요금제는 월 150건까지 처리 가능합니다. 사용량에 따라 적절한 요금제를 선택하시면 됩니다.",
                    "companyId": "demo-company"
                }
            ]
        },
        {
            "category": "general",
            "items": [
                {
                    "question": "문의 상태는 어떻게 확인하나요?",
                    "answer": "문의 접수 후 제공되는 문의 번호로 상태를 추적할 수 있습니다. 고객 포털에서 실시간으로 처리 현황을 확인하실 수 있습니다.",
                    "companyId": "demo-company"
                },
                {
                    "question": "AI 답변이 만족스럽지 않으면?",
                    "answer": "AI 답변에 만족하지 않으시면 에스컬레이션 기능을 통해 인간 상담사에게 연결됩니다. 더 전문적이고 맞춤형 답변을 받으실 수 있습니다.",
                    "companyId": "test-company"
                },
                {
                    "question": "서비스 이용 시간은?",
                    "answer": "AI 챗봇은 24시간 연중무휴로 서비스됩니다. 인간 상담사 연결은 평일 9시-18시에 가능합니다.",
                    "companyId": "test123"
                }
            ]
        },
        {
            "category": "product",
            "items": [
                {
                    "question": "새로운 기능 요청은 어떻게 하나요?",
                    "answer": "기능 요청은 고객지원팀을 통해 접수 가능합니다. 제품팀에서 검토 후 로드맵에 반영 여부를 결정합니다.",
                    "companyId": "hunters-company"
                }
            ]
        },
        {
            "category": "other",
            "items": [
                {
                    "question": "회사 소개를 해주세요",
                    "answer": "저희는 AI 기반 고객 서비스 자동화 솔루션을 제공하는 회사입니다. 중소기업의 CS 운영 효율성을 높이는 것이 목표입니다.",
                    "companyId": "test-company"
                }
            ]
        }
    ]
    
    # QnA 데이터 생성
    for category_data in qna_patterns:
        category = category_data["category"]
        for item in category_data["items"]:
            qna_item = {
                "id": str(uuid.uuid4()),
                "question": item["question"],
                "answer": item["answer"],
                "category": category,
                "companyId": item["companyId"],
                "createdAt": (datetime.now() - timedelta(days=15)).isoformat(),
                "updatedAt": datetime.now().isoformat(),
                "isActive": True,
                "useCount": 5  # 사용 횟수
            }
            qna_items.append(qna_item)
    
    return qna_items

def populate_companies():
    """Companies 테이블에 데이터 삽입"""
    companies = create_company_data()
    
    print(f"Companies 테이블에 {len(companies)}개 데이터 삽입 중...")
    
    for company in companies:
        try:
            companies_table.put_item(Item=company)
            print(f"✅ {company['name']} ({company['companyId']}) 삽입 완료")
        except Exception as e:
            print(f"❌ {company['companyId']} 삽입 실패: {e}")

def populate_qna_data():
    """QnA 테이블에 데이터 삽입"""
    qna_items = create_qna_data()
    
    print(f"\nQnA 테이블에 {len(qna_items)}개 데이터 삽입 중...")
    
    for qna in qna_items:
        try:
            qna_table.put_item(Item=qna)
            print(f"✅ QnA 삽입 완료: {qna['question'][:30]}...")
        except Exception as e:
            print(f"❌ QnA 삽입 실패: {e}")

def main():
    """메인 실행 함수"""
    print("🚀 CS 챗봇 플랫폼 샘플 데이터 생성 시작")
    print("=" * 50)
    
    # Companies 테이블 데이터 생성
    populate_companies()
    
    # QnA 테이블 데이터 생성
    populate_qna_data()
    
    print("\n" + "=" * 50)
    print("✅ 모든 샘플 데이터 생성 완료!")
    print("\n📊 생성된 데이터:")
    print("- Companies: 4개 회사")
    print("- QnA: 12개 질문-답변 쌍")

if __name__ == "__main__":
    main()
