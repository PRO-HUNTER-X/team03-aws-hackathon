#!/usr/bin/env python3
"""로컬 테스트용 간단한 HTTP 서버"""

import json
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging

# 프로젝트 루트를 Python 경로에 추가
sys.path.append(os.path.dirname(__file__))

# Lambda 함수들 import
from lambda_functions.customer_inquiries import lambda_handler as get_inquiries_handler
from src.handlers.create_inquiry import lambda_handler as create_inquiry_handler
from src.handlers.get_inquiry import lambda_handler as get_inquiry_handler

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LocalHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        query_params = parse_qs(parsed_path.query)
        
        # 쿼리 파라미터를 단일 값으로 변환
        query_string_params = {k: v[0] if v else None for k, v in query_params.items()}
        
        try:
            if path == '/api/inquiries':
                # 고객 문의 목록 조회
                event = {
                    'httpMethod': 'GET',
                    'queryStringParameters': query_string_params
                }
                response = get_inquiries_handler(event, None)
                
            elif path.startswith('/api/inquiries/'):
                # 문의 상세 조회
                inquiry_id = path.split('/')[-1]
                event = {
                    'httpMethod': 'GET',
                    'pathParameters': {'id': inquiry_id}
                }
                response = get_inquiry_handler(event, None)
                
            else:
                response = {
                    'statusCode': 404,
                    'body': json.dumps({'success': False, 'error': {'message': 'Not Found'}})
                }
            
            self._send_response(response)
            
        except Exception as e:
            logger.error(f"GET 요청 처리 오류: {str(e)}")
            self._send_error_response(str(e))
    
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            if self.path == '/api/inquiries':
                # 문의 생성
                event = {
                    'httpMethod': 'POST',
                    'body': post_data.decode('utf-8')
                }
                response = create_inquiry_handler(event, None)
                
            else:
                response = {
                    'statusCode': 404,
                    'body': json.dumps({'success': False, 'error': {'message': 'Not Found'}})
                }
            
            self._send_response(response)
            
        except Exception as e:
            logger.error(f"POST 요청 처리 오류: {str(e)}")
            self._send_error_response(str(e))
    
    def _send_response(self, lambda_response):
        status_code = lambda_response.get('statusCode', 200)
        body = lambda_response.get('body', '{}')
        
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        self.wfile.write(body.encode('utf-8'))
    
    def _send_error_response(self, error_message):
        self.send_response(500)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        error_body = json.dumps({
            'success': False,
            'error': {'message': f'서버 오류: {error_message}'}
        }, ensure_ascii=False)
        
        self.wfile.write(error_body.encode('utf-8'))

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, LocalHandler)
    
    print(f"🚀 로컬 서버 시작: http://localhost:{port}")
    print("📋 사용 가능한 엔드포인트:")
    print("  GET  /api/inquiries?email=test@example.com")
    print("  POST /api/inquiries")
    print("  GET  /api/inquiries/{id}")
    print("\n💡 Ctrl+C로 서버 종료")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 서버 종료")
        httpd.server_close()

if __name__ == '__main__':
    # 환경변수 설정
    os.environ.setdefault('DYNAMODB_TABLE', 'cs-inquiries-local')
    os.environ.setdefault('JWT_SECRET', 'local-test-secret')
    
    run_server()
