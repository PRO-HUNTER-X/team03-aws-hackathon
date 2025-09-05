import json
from datetime import datetime

def lambda_handler(event, context):
    """Health check endpoint"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'healthy',
            'service': 'CS Chatbot API',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0.0'
        }, ensure_ascii=False)
    }