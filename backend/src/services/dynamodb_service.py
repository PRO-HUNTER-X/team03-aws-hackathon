import boto3
from typing import Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class DynamoDBService:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.inquiries_table = self.dynamodb.Table('cs-chatbot-inquiries')
        self.companies_table = self.dynamodb.Table('cs-chatbot-companies')
    
    def create_inquiry(self, inquiry_data: Dict[str, Any]) -> bool:
        """문의 생성"""
        try:
            self.inquiries_table.put_item(Item=inquiry_data)
            logger.info(f"Inquiry created: {inquiry_data['id']}")
            return True
        except Exception as e:
            logger.error(f"Error creating inquiry: {str(e)}")
            return False
    
    def get_inquiry(self, inquiry_id: str) -> Optional[Dict[str, Any]]:
        """문의 조회"""
        try:
            response = self.inquiries_table.get_item(Key={'id': inquiry_id})
            return response.get('Item')
        except Exception as e:
            logger.error(f"Error getting inquiry: {str(e)}")
            return None
    
    def update_inquiry_status(self, inquiry_id: str, status: str, human_response: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """문의 상태 업데이트"""
        try:
            # 먼저 아이템 존재 여부 확인
            existing_item = self.get_inquiry(inquiry_id)
            if not existing_item:
                return None
            
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
                Key={'id': inquiry_id},
                UpdateExpression=update_expression,
                ExpressionAttributeValues=expression_values,
                ExpressionAttributeNames=expression_names,
                ReturnValues='ALL_NEW'
            )
            
            return response.get('Attributes')
        except Exception as e:
            logger.error(f"Error updating inquiry status: {str(e)}")
            return None
    
    def list_inquiries(self, company_id: str, status: str = None, limit: int = 50) -> list:
        """회사별 문의 목록 조회"""
        try:
            # 실제 구현에서는 GSI를 사용하여 companyId로 쿼리
            # 현재는 스캔으로 임시 구현
            filter_expression = 'companyId = :company_id'
            expression_values = {':company_id': company_id}
            
            if status:
                filter_expression += ' AND #status = :status'
                expression_values[':status'] = status
            
            response = self.inquiries_table.scan(
                FilterExpression=filter_expression,
                ExpressionAttributeValues=expression_values,
                ExpressionAttributeNames={'#status': 'status'} if status else None,
                Limit=limit
            )
            
            return response.get('Items', [])
        except Exception as e:
            logger.error(f"Error listing inquiries: {str(e)}")
            return []