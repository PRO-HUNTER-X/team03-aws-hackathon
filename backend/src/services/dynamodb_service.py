import boto3
import os
from typing import Dict, Any, Optional
import logging
from datetime import datetime
from boto3.dynamodb.conditions import Attr

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class DynamoDBService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table_name = os.environ.get('DYNAMODB_TABLE', 'cs-inquiries')
        self.inquiries_table = self.dynamodb.Table(table_name)
        # companies_table은 현재 사용하지 않으므로 제거
    
    def create_inquiry(self, inquiry_data: Dict[str, Any]) -> bool:
        """문의 생성"""
        try:
            self.inquiries_table.put_item(Item=inquiry_data)
            logger.info(f"Inquiry created: {inquiry_data.get('inquiry_id', 'unknown')}")
            return True
        except Exception as e:
            logger.error(f"Error creating inquiry: {str(e)}")
            return False
    
    def get_inquiry(self, inquiry_id: str) -> Optional[Dict[str, Any]]:
        """문의 조회"""
        try:
            response = self.inquiries_table.get_item(Key={'inquiry_id': inquiry_id})
            return response.get('Item')
        except Exception as e:
            logger.error(f"Error getting inquiry: {str(e)}")
            return None
    
    def update_inquiry_status(self, inquiry_id: str, status: str, human_response: Optional[str] = None) -> bool:
        """문의 상태 업데이트"""
        try:
            # 먼저 아이템 존재 여부 확인
            existing_item = self.get_inquiry(inquiry_id)
            if not existing_item:
                return False
            
            update_expression = "SET #status = :status, updatedAt = :updated_at"
            expression_values = {
                ':status': status,
                ':updated_at': datetime.utcnow().isoformat()
            }
            expression_names = {'#status': 'status'}
            
            if human_response:
                update_expression += ", humanResponse = :human_response"
                expression_values[':human_response'] = human_response
            
            if status == 'resolved':
                update_expression += ", resolvedAt = :resolved_at"
                expression_values[':resolved_at'] = datetime.utcnow().isoformat()
            
            response = self.inquiries_table.update_item(
                Key={'inquiry_id': inquiry_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ExpressionAttributeNames=expression_names,
                ReturnValues='ALL_NEW'
            )
            
            return True
        except Exception as e:
            logger.error(f"Error updating inquiry status: {str(e)}")
            return False
    
    def list_inquiries(self, company_id: str, status: str = None, limit: int = 50) -> list:
        """회사별 문의 목록 조회"""
        try:
            from boto3.dynamodb.conditions import Attr
            
            # Condition 객체 사용
            filter_expression = Attr('companyId').eq(company_id)
            
            if status:
                filter_expression = filter_expression & Attr('status').eq(status)
            
            response = self.inquiries_table.scan(
                FilterExpression=filter_expression,
                Limit=limit
            )
            
            return response.get('Items', [])
            
        except Exception as e:
            logger.error(f"Error listing inquiries: {str(e)}")
            return []
    
    def get_inquiries_by_email(self, customer_email: str, limit: int = 50) -> list:
        """고객 이메일별 문의 목록 조회"""
        try:
            filter_expression = Attr('customerEmail').eq(customer_email)
            
            response = self.inquiries_table.scan(
                FilterExpression=filter_expression,
                Limit=limit
            )
            
            return response.get('Items', [])
            
        except Exception as e:
            logger.error(f"Error getting inquiries by email: {str(e)}")
            return []