import json
from typing import Dict, Any

def lambda_handler(event: Dict[str, Any], context) -> Dict[str, Any]:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'message': 'CS 챗봇 API 서버가 정상 작동 중입니다! 🤖',
            'status': 'healthy',
            'version': '1.0.0'
        })
    }