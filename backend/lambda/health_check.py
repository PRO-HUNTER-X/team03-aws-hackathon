import json
from datetime import datetime

def lambda_handler(event, context):
    """Health check endpoint"""
    # OPTIONS 요청 처리 (CORS preflight)
    if event.get('httpMethod') == 'OPTIONS':
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
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps({
            'status': 'healthy',
            'service': 'CS Chatbot API',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        }, ensure_ascii=False)
    }