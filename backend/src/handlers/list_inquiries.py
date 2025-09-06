import json
from typing import Dict, Any
import logging

from src.utils.response import success_response, error_response
from src.services.dynamodb_service import DynamoDBService

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 서비스 인스턴스
db_service = DynamoDBService()

def list_inquiries(company_id: str, status: str = None, limit: int = 50):
    """문의 목록 조회 (DI를 위한 래퍼 함수)"""
    return db_service.list_inquiries(company_id, status, limit)

def get_inquiries_by_email(customer_email: str, limit: int = 50):
    """이메일별 문의 목록 조회 (DI를 위한 래퍼 함수)"""
    return db_service.get_inquiries_by_email(customer_email, limit)

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        
        # 이메일로 조회하는 경우
        email = query_params.get('email')
        if email:
            logger.info(f"Querying inquiries by email: {email}")
            inquiries = get_inquiries_by_email(email)
            return success_response({
                'inquiries': inquiries,
                'count': len(inquiries)
            })
        
        # 회사 ID로 조회하는 경우 (기존 로직)
        company_id = query_params.get('companyId')
        status = query_params.get('status')
        limit = int(query_params.get('limit', 50))
        
        if not company_id:
            return error_response("companyId or email is required", 400)
        
        inquiries = list_inquiries(company_id, status, limit)
        
        return success_response({
            'inquiries': inquiries,
            'count': len(inquiries)
        })
        
    except Exception as e:
        logger.error(f"Error listing inquiries: {str(e)}")
        return error_response(str(e), 500)