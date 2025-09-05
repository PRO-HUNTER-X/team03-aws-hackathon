import pytest
from moto import mock_dynamodb
import boto3
from src.services.dynamodb_service import DynamoDBService


@mock_dynamodb
class TestDynamoDBService:
    
    def setup_method(self, method):
        """각 테스트 전에 실행되는 설정"""
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        
        # 테스트용 테이블 생성
        self.inquiries_table = self.dynamodb.create_table(
            TableName='cs-chatbot-inquiries',
            KeySchema=[{'AttributeName': 'id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'id', 'AttributeType': 'S'}],
            BillingMode='PAY_PER_REQUEST'
        )
        
        self.companies_table = self.dynamodb.create_table(
            TableName='cs-chatbot-companies',
            KeySchema=[{'AttributeName': 'id', 'KeyType': 'HASH'}],
            AttributeDefinitions=[{'AttributeName': 'id', 'AttributeType': 'S'}],
            BillingMode='PAY_PER_REQUEST'
        )
        
        self.db_service = DynamoDBService()
    
    def test_create_inquiry_success(self):
        """문의 생성 성공 테스트"""
        inquiry_data = {
            'id': 'test-inquiry-1',
            'companyId': 'test-company',
            'customerEmail': 'test@example.com',
            'title': '테스트 문의',
            'content': '테스트 내용',
            'status': 'pending'
        }
        
        result = self.db_service.create_inquiry(inquiry_data)
        assert result is True
        
        # 실제로 저장되었는지 확인
        saved_item = self.db_service.get_inquiry('test-inquiry-1')
        assert saved_item is not None
        assert saved_item['title'] == '테스트 문의'
    
    def test_get_inquiry_exists(self):
        """존재하는 문의 조회 테스트"""
        inquiry_data = {
            'id': 'test-inquiry-2',
            'companyId': 'test-company',
            'title': '조회 테스트'
        }
        
        self.inquiries_table.put_item(Item=inquiry_data)
        
        result = self.db_service.get_inquiry('test-inquiry-2')
        assert result is not None
        assert result['title'] == '조회 테스트'
    
    def test_get_inquiry_not_exists(self):
        """존재하지 않는 문의 조회 테스트"""
        result = self.db_service.get_inquiry('non-existent-id')
        assert result is None
    
    def test_update_inquiry_status_success(self):
        """문의 상태 업데이트 성공 테스트"""
        inquiry_data = {
            'id': 'test-inquiry-3',
            'status': 'pending'
        }
        
        self.inquiries_table.put_item(Item=inquiry_data)
        
        result = self.db_service.update_inquiry_status('test-inquiry-3', 'resolved')
        assert result is not None
        assert result['status'] == 'resolved'
        assert 'updatedAt' in result
    
    def test_update_inquiry_status_not_exists(self):
        """존재하지 않는 문의 상태 업데이트 테스트"""
        result = self.db_service.update_inquiry_status('non-existent-id', 'resolved')
        assert result is None