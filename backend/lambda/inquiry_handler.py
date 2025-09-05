import json
import os
import sys
import uuid
from datetime import datetime
import logging

# 기존 소스 코드 경로 추가
sys.path.append('/opt/python')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def success_response(data):
    """성공 응답 생성"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'data': data
        }, ensure_ascii=False)
    }

def error_response(message, status_code=400):
    """에러 응답 생성"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': False,
            'error': message
        }, ensure_ascii=False)
    }

def validate_inquiry_data(data):
    """문의 데이터 검증"""
    required_fields = ['companyId', 'customerEmail', 'title', 'content']
    errors = []
    
    for field in required_fields:
        if not data.get(field):
            errors.append(f"{field} is required")
    
    if data.get('customerEmail') and '@' not in data['customerEmail']:
        errors.append("Invalid email format")
    
    return errors

def create_inquiry(data):
    """문의 생성 (DynamoDB 연동)"""
    try:
        import boto3
        
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('DYNAMODB_TABLE', 'cs-inquiries')
        table = dynamodb.Table(table_name)
        
        inquiry_id = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()
        
        item = {
            'inquiry_id': inquiry_id,
            'created_at': created_at,
            'companyId': data['companyId'],
            'customerEmail': data['customerEmail'],
            'title': data['title'],
            'content': data['content'],
            'category': data.get('category', 'general'),
            'urgency': data.get('urgency', 'medium'),
            'status': 'pending',
            'estimatedResponseTime': 15
        }
        
        table.put_item(Item=item)
        
        return {
            'inquiryId': inquiry_id,
            'status': 'pending',
            'estimatedResponseTime': 15,
            'createdAt': created_at
        }
        
    except Exception as e:
        logger.error(f"Error creating inquiry: {str(e)}")
        raise e

def get_inquiry(inquiry_id):
    """문의 조회"""
    try:
        import boto3
        
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('DYNAMODB_TABLE', 'cs-inquiries')
        table = dynamodb.Table(table_name)
        
        response = table.get_item(
            Key={'inquiry_id': inquiry_id}
        )
        
        return response.get('Item')
        
    except Exception as e:
        logger.error(f"Error getting inquiry: {str(e)}")
        return None

def lambda_handler(event, context):
    """통합 문의 처리 Lambda 핸들러"""
    try:
        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters') or {}
        
        if http_method == 'POST':
            # 문의 생성
            body = json.loads(event.get('body', '{}'))
            
            # 입력 검증
            validation_errors = validate_inquiry_data(body)
            if validation_errors:
                return error_response(f"Validation errors: {', '.join(validation_errors)}")
            
            # 문의 생성
            result = create_inquiry(body)
            return success_response(result)
            
        elif http_method == 'GET':
            # 문의 조회
            inquiry_id = path_parameters.get('id')
            if not inquiry_id:
                return error_response("Inquiry ID is required")
            
            inquiry = get_inquiry(inquiry_id)
            if not inquiry:
                return error_response("Inquiry not found", 404)
            
            return success_response(inquiry)
        
        else:
            return error_response(f"Method {http_method} not allowed", 405)
            
    except Exception as e:
        logger.error(f"Error in inquiry handler: {str(e)}")
        return error_response("Internal server error", 500)