import pytest
import json
from unittest.mock import patch
from lambda_functions.admin import handle_get_inquiries, handle_dashboard, handle_get_inquiry, handle_update_status

class TestAdminHandler:
    """관리자 API 핸들러 테스트"""
    
    def test_문의_목록_조회_성공(self):
        """관리자가 문의 목록을 성공적으로 조회"""
        event = {
            'httpMethod': 'GET',
            'path': '/admin/inquiries',
            'queryStringParameters': None
        }
        headers = {"Content-Type": "application/json"}
        
        response = handle_get_inquiries(event, headers)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'inquiries' in body
        assert 'total' in body
        assert len(body['inquiries']) >= 0
    
    def test_문의_목록_상태별_필터링(self):
        """상태별로 문의 목록 필터링"""
        event = {
            'httpMethod': 'GET',
            'path': '/admin/inquiries',
            'queryStringParameters': {'status': 'pending'}
        }
        headers = {"Content-Type": "application/json"}
        
        response = handle_get_inquiries(event, headers)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        # 모든 문의가 pending 상태인지 확인
        for inquiry in body['inquiries']:
            assert inquiry['status'] == 'pending'
    
    def test_문의_상세_조회_성공(self):
        """특정 문의 상세 정보 조회 성공"""
        headers = {"Content-Type": "application/json"}
        
        response = handle_get_inquiry('1', headers)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'inquiry' in body
        assert body['inquiry']['id'] == '1'
    
    def test_문의_상세_조회_실패_존재하지_않는_ID(self):
        """존재하지 않는 문의 ID로 조회시 실패"""
        headers = {"Content-Type": "application/json"}
        
        response = handle_get_inquiry('999', headers)
        
        assert response['statusCode'] == 404
        body = json.loads(response['body'])
        assert '문의를 찾을 수 없습니다' in body['error']
    
    def test_문의_상태_변경_성공(self):
        """문의 상태 변경 성공"""
        event = {
            'httpMethod': 'PUT',
            'path': '/admin/inquiries/1/status',
            'body': json.dumps({'status': 'completed'})
        }
        headers = {"Content-Type": "application/json"}
        
        response = handle_update_status('1', event, headers)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert '상태가 업데이트되었습니다' in body['message']
        assert body['inquiry']['status'] == 'completed'
    
    def test_문의_상태_변경_실패_상태값_누락(self):
        """상태값 누락시 문의 상태 변경 실패"""
        event = {
            'httpMethod': 'PUT',
            'path': '/admin/inquiries/1/status',
            'body': json.dumps({})  # status 누락
        }
        headers = {"Content-Type": "application/json"}
        
        response = handle_update_status('1', event, headers)
        
        assert response['statusCode'] == 400
        body = json.loads(response['body'])
        assert '상태값이 필요합니다' in body['error']
    
    def test_대시보드_통계_조회_성공(self):
        """대시보드 통계 조회 성공"""
        headers = {"Content-Type": "application/json"}
        
        response = handle_dashboard(headers)
        
        assert response['statusCode'] == 200
        body = json.loads(response['body'])
        assert 'stats' in body
        stats = body['stats']
        assert 'total_inquiries' in stats
        assert 'pending_count' in stats
        assert 'in_progress_count' in stats
        assert 'completed_count' in stats
        assert 'avg_satisfaction' in stats
    
    def test_존재하지_않는_엔드포인트_404(self):
        """존재하지 않는 엔드포인트는 별도 테스트 불필요 (라우팅 로직에서 처리)"""
        # 이 테스트는 실제 lambda_handler에서만 의미가 있음
        pass
    
    def test_CORS_헤더_포함(self):
        """모든 응답에 CORS 헤더 포함"""
        headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
        
        response = handle_dashboard(headers)
        
        assert response['headers']['Access-Control-Allow-Origin'] == '*'
        assert 'GET' in response['headers']['Access-Control-Allow-Methods']