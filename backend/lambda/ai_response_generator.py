import json
import boto3
import os
from typing import Dict, Any
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

bedrock = boto3.client('bedrock-runtime')
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    try:
        body = json.loads(event.get('body', '{}'))
        inquiry_id = body.get('inquiry_id')
        
        # Get inquiry from DynamoDB
        response = table.get_item(Key={'inquiry_id': inquiry_id})
        if 'Item' not in response:
            return error_response("Inquiry not found", 404)
        
        inquiry = response['Item']
        
        # Generate AI response using Bedrock
        ai_response = generate_ai_response(inquiry['message'], inquiry['category'])
        
        # Update inquiry with AI response
        table.update_item(
            Key={'inquiry_id': inquiry_id},
            UpdateExpression='SET ai_response = :response, #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':response': ai_response,
                ':status': 'ai_responded'
            }
        )
        
        return success_response({'ai_response': ai_response})
        
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return error_response(str(e), 500)

def generate_ai_response(message: str, category: str) -> str:
    prompt = f"""Customer inquiry: {message}
Category: {category}

Please provide a helpful, professional response."""
    
    try:
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-5-sonnet-20241022-v2:0',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 500,
                'messages': [{'role': 'user', 'content': prompt}]
            })
        )
        
        result = json.loads(response['body'].read())
        return result['content'][0]['text']
        
    except Exception as e:
        logger.error(f"Bedrock error: {str(e)}")
        return "죄송합니다. 현재 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요."

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