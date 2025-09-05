import json
import os
import sys
import logging
from datetime import datetime, timedelta

sys.path.append('/opt/python')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def success_response(data):
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
        }, ensure_ascii=False)
    }

def error_response(message, status_code=400):
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
        }, ensure_ascii=False)
    }

def get_cloudwatch_logs(function_name, minutes=10):
    """CloudWatch 로그 조회"""
    try:
        import boto3
        
        logs_client = boto3.client('logs', region_name='us-east-1')
        
        # 로그 그룹 이름 매핑
        log_group_mapping = {
            'ai-response': '/aws/lambda/cs-chatbot-dev-kyuwon-api-AIResponseGenerator509A2-Aowj1Fee9nwE',
            'inquiry': '/aws/lambda/cs-chatbot-dev-kyuwon-api-InquiryHandler',
            'health': '/aws/lambda/cs-chatbot-dev-kyuwon-api-HealthCheck'
        }
        
        log_group_name = log_group_mapping.get(function_name)
        if not log_group_name:
            return []
        
        # 시간 범위 설정 (최근 N분)
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=minutes)
        
        start_timestamp = int(start_time.timestamp() * 1000)
        end_timestamp = int(end_time.timestamp() * 1000)
        
        # CloudWatch 로그 조회
        response = logs_client.filter_log_events(
            logGroupName=log_group_name,
            startTime=start_timestamp,
            endTime=end_timestamp,
            limit=100
        )
        
        # 로그 파싱
        parsed_logs = []
        for event in response.get('events', []):
            message = event['message']
            timestamp = datetime.fromtimestamp(event['timestamp'] / 1000).isoformat() + 'Z'
            
            # 로그 레벨 추출
            level = 'INFO'
            if '[ERROR]' in message:
                level = 'ERROR'
            elif '[WARNING]' in message:
                level = 'WARNING'
            elif '[INFO]' in message:
                level = 'INFO'
            
            # Request ID 추출
            request_id = None
            import re
            request_match = re.search(r'([a-f0-9-]{36})', message)
            if request_match:
                request_id = request_match.group(1)
            
            # 메시지 정리
            clean_message = message
            for prefix in ['[INFO]', '[WARNING]', '[ERROR]']:
                if prefix in clean_message:
                    clean_message = clean_message.split(prefix, 1)[1].strip()
                    break
            
            # Request ID 제거
            if request_id:
                clean_message = clean_message.replace(request_id, '').strip()
            
            parsed_logs.append({
                'timestamp': timestamp,
                'level': level,
                'message': clean_message,
                'requestId': request_id,
                'raw': message
            })
        
        return parsed_logs
        
    except Exception as e:
        logger.error(f"Error fetching CloudWatch logs: {str(e)}")
        return []

def lambda_handler(event, context):
    """로그 조회 Lambda 핸들러"""
    try:
        # OPTIONS 요청 처리
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
        
        path_parameters = event.get('pathParameters') or {}
        function_name = path_parameters.get('function', 'ai-response')
        
        # 쿼리 파라미터에서 시간 범위 가져오기
        query_params = event.get('queryStringParameters') or {}
        minutes = int(query_params.get('minutes', 10))
        
        # CloudWatch 로그 조회
        logs = get_cloudwatch_logs(function_name, minutes)
        
        result = {
            'logs': logs,
            'function': function_name,
            'timeRange': f'{minutes}분',
            'count': len(logs)
        }
        
        return success_response(result)
        
    except Exception as e:
        logger.error(f"Error in logs handler: {str(e)}")
        return error_response("Internal server error", 500)