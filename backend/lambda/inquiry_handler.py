import json
import boto3
import uuid
import os
from datetime import datetime
from typing import Dict, Any
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body', '{}'))
        
        # Create inquiry record
        inquiry_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat()
        
        item = {
            'inquiry_id': inquiry_id,
            'created_at': timestamp,
            'status': 'pending',
            'customer_email': body.get('email'),
            'subject': body.get('subject'),
            'message': body.get('message'),
            'category': body.get('category', 'general')
        }
        
        table.put_item(Item=item)
        
        return success_response({
            'inquiry_id': inquiry_id,
            'status': 'received'
        })
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return error_response(str(e), 500)

def success_response(data: Any) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'data': data})
    }

def error_response(message: str, status_code: int) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': False, 'error': message})
    }