import json
import os
import sys
import uuid
from datetime import datetime
import logging
from decimal import Decimal

# 기존 소스 코드 경로 추가
sys.path.append('/opt/python')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def decimal_default(obj):
    """Decimal 타입을 JSON 직렬화 가능한 형태로 변환"""
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

def success_response(data):
    """성공 응답 생성"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({
            'success': True,
            'data': data
        }, ensure_ascii=False, default=decimal_default)
    }

def error_response(message, status_code=400):
    """에러 응답 생성"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({
            'success': False,
            'error': message
        }, ensure_ascii=False, default=decimal_default)
    }

def options_response():
    """OPTIONS 요청 응답 (CORS preflight)"""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '86400'
        },
        'body': ''
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

def escalate_inquiry(inquiry_id, reason=None):
    """문의 에스케이션"""
    try:
        import boto3
        
        dynamodb = boto3.resource('dynamodb')
        table_name = os.environ.get('DYNAMODB_TABLE', 'cs-inquiries')
        table = dynamodb.Table(table_name)
        
        # 문의 존재 확인
        inquiry = get_inquiry(inquiry_id)
        if not inquiry:
            return None
        
        # 상태 업데이트
        updated_at = datetime.utcnow().isoformat()
        
        table.update_item(
            Key={'inquiry_id': inquiry_id},
            UpdateExpression='SET #status = :status, updatedAt = :updated_at, escalationReason = :reason',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':status': 'escalated',
                ':updated_at': updated_at,
                ':reason': reason or '고객이 에스케이션을 요청했습니다.'
            }
        )
        
        logger.info(f"Inquiry {inquiry_id} escalated successfully")
        return {'inquiryId': inquiry_id, 'status': 'escalated', 'updatedAt': updated_at}
        
    except Exception as e:
        logger.error(f"Error escalating inquiry: {str(e)}")
        raise e

def lambda_handler(event, context):
    """통합 문의 처리 Lambda 핸들러"""
    try:
        http_method = event.get('httpMethod', 'GET')
        path_parameters = event.get('pathParameters') or {}
        resource_path = event.get('resource', '')
        
        # OPTIONS 요청 처리 (CORS preflight)
        if http_method == 'OPTIONS':
            return options_response()
        
        # 에스케이션 요청 처리
        if http_method == 'POST' and 'escalate' in resource_path:
            inquiry_id = path_parameters.get('id')
            if not inquiry_id:
                return error_response("Inquiry ID is required")
            
            body = json.loads(event.get('body', '{}'))
            reason = body.get('reason')
            
            result = escalate_inquiry(inquiry_id, reason)
            if not result:
                return error_response("Inquiry not found", 404)
            
            return success_response(result)
        
        elif http_method == 'POST':
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