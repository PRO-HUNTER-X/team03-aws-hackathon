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

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        query_params = event.get('queryStringParameters', {}) or {}
        
        company_id = query_params.get('companyId')
        status = query_params.get('status')
        limit = int(query_params.get('limit', 50))
        
        if not company_id:
            return error_response("companyId is required", 400)
        
        inquiries = list_inquiries(company_id, status, limit)
        
        return success_response({
            'inquiries': inquiries,
            'count': len(inquiries)
        })
        
    except Exception as e:
        logger.error(f"Error listing inquiries: {str(e)}")
        return error_response(str(e), 500)