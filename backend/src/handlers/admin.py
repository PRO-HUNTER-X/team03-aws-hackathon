import json
from typing import Dict, Any
from ..utils.middleware import admin_required

# 임시 문의 데이터 (실제로는 DynamoDB에서 관리)
INQUIRIES = [
    {
        "id": "1",
        "title": "결제 문제 문의",
        "content": "결제가 안 되는데 도와주세요",
        "category": "payment",
        "urgency": "high",
        "status": "pending",
        "created_at": "2024-01-15T10:30:00Z",
        "ai_response": "결제 문제는 다음과 같은 방법으로 해결할 수 있습니다...",
        "satisfaction_score": None
    },
    {
        "id": "2", 
        "title": "기술 지원 요청",
        "content": "API 연동 방법을 알고 싶습니다",
        "category": "technical",
        "urgency": "medium",
        "status": "in_progress",
        "created_at": "2024-01-15T09:15:00Z",
        "ai_response": "API 연동은 다음 단계를 따라 진행하시면 됩니다...",
        "satisfaction_score": 4
    }
]

@admin_required
def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """관리자 API Lambda 핸들러"""
    
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    
    try:
        method = event.get('httpMethod')
        path = event.get('path', '')
        
        # GET /admin/inquiries - 문의 목록 조회
        if method == 'GET' and '/admin/inquiries' in path:
            return handle_get_inquiries(event, headers)
        
        # GET /admin/inquiries/{id} - 문의 상세 조회
        elif method == 'GET' and '/admin/inquiries/' in path:
            inquiry_id = path.split('/')[-1]
            return handle_get_inquiry(inquiry_id, headers)
        
        # PUT /admin/inquiries/{id}/status - 문의 상태 변경
        elif method == 'PUT' and '/status' in path:
            inquiry_id = path.split('/')[-2]
            return handle_update_status(inquiry_id, event, headers)
        
        # GET /admin/dashboard - 대시보드 통계
        elif method == 'GET' and '/admin/dashboard' in path:
            return handle_dashboard(headers)
        
        else:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Not found'})
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }

def handle_get_inquiries(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """문의 목록 조회"""
    query_params = event.get('queryStringParameters') or {}
    status_filter = query_params.get('status')
    
    # 상태별 필터링
    filtered_inquiries = INQUIRIES
    if status_filter:
        filtered_inquiries = [inq for inq in INQUIRIES if inq['status'] == status_filter]
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'inquiries': filtered_inquiries,
            'total': len(filtered_inquiries)
        })
    }

def handle_get_inquiry(inquiry_id: str, headers: Dict[str, str]) -> Dict[str, Any]:
    """문의 상세 조회"""
    inquiry = next((inq for inq in INQUIRIES if inq['id'] == inquiry_id), None)
    
    if not inquiry:
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': '문의를 찾을 수 없습니다'})
        }
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({'inquiry': inquiry})
    }

def handle_update_status(inquiry_id: str, event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """문의 상태 변경"""
    try:
        body = json.loads(event.get('body', '{}'))
        new_status = body.get('status')
        
        if not new_status:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': '상태값이 필요합니다'})
            }
        
        # 문의 찾기 및 상태 업데이트
        for inquiry in INQUIRIES:
            if inquiry['id'] == inquiry_id:
                inquiry['status'] = new_status
                return {
                    'statusCode': 200,
                    'headers': headers,
                    'body': json.dumps({'message': '상태가 업데이트되었습니다', 'inquiry': inquiry})
                }
        
        return {
            'statusCode': 404,
            'headers': headers,
            'body': json.dumps({'error': '문의를 찾을 수 없습니다'})
        }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': '잘못된 JSON 형식입니다'})
        }

def handle_dashboard(headers: Dict[str, str]) -> Dict[str, Any]:
    """대시보드 통계"""
    total_inquiries = len(INQUIRIES)
    pending_count = len([inq for inq in INQUIRIES if inq['status'] == 'pending'])
    in_progress_count = len([inq for inq in INQUIRIES if inq['status'] == 'in_progress'])
    completed_count = len([inq for inq in INQUIRIES if inq['status'] == 'completed'])
    
    # 만족도 평균 계산
    satisfaction_scores = [inq['satisfaction_score'] for inq in INQUIRIES if inq['satisfaction_score']]
    avg_satisfaction = sum(satisfaction_scores) / len(satisfaction_scores) if satisfaction_scores else 0
    
    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'stats': {
                'total_inquiries': total_inquiries,
                'pending_count': pending_count,
                'in_progress_count': in_progress_count,
                'completed_count': completed_count,
                'avg_satisfaction': round(avg_satisfaction, 1)
            }
        })
    }