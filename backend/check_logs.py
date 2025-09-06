#!/usr/bin/env python3
"""
CloudWatch 로그 확인 스크립트
"""
import boto3
from datetime import datetime, timedelta
import json

def check_lambda_logs():
    """Lambda 함수 로그 확인"""
    try:
        # CloudWatch Logs 클라이언트
        logs_client = boto3.client('logs', region_name='us-east-1')
        
        # 최근 10분간의 로그 확인
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(minutes=10)
        
        # Lambda 함수 로그 그룹들
        log_groups = [
            '/aws/lambda/cs-chatbot-api-InquiryHandler',
            '/aws/lambda/cs-chatbot-api-AIResponseGenerator',
            '/aws/lambda/cs-chatbot-api-CustomerInquiries'
        ]
        
        for log_group in log_groups:
            print(f"\n{'='*60}")
            print(f"로그 그룹: {log_group}")
            print(f"{'='*60}")
            
            try:
                # 로그 스트림 목록 가져오기
                streams_response = logs_client.describe_log_streams(
                    logGroupName=log_group,
                    orderBy='LastEventTime',
                    descending=True,
                    limit=5
                )
                
                for stream in streams_response['logStreams']:
                    stream_name = stream['logStreamName']
                    print(f"\n--- 로그 스트림: {stream_name} ---")
                    
                    # 로그 이벤트 가져오기
                    events_response = logs_client.get_log_events(
                        logGroupName=log_group,
                        logStreamName=stream_name,
                        startTime=int(start_time.timestamp() * 1000),
                        endTime=int(end_time.timestamp() * 1000)
                    )
                    
                    events = events_response['events']
                    if events:
                        for event in events[-10:]:  # 최근 10개 이벤트
                            timestamp = datetime.fromtimestamp(event['timestamp'] / 1000)
                            message = event['message'].strip()
                            print(f"[{timestamp}] {message}")
                    else:
                        print("최근 로그 없음")
                        
            except Exception as e:
                print(f"로그 그룹 {log_group} 확인 실패: {str(e)}")
                
    except Exception as e:
        print(f"로그 확인 중 오류: {str(e)}")

if __name__ == "__main__":
    print("CloudWatch 로그 확인 시작...")
    check_lambda_logs()
