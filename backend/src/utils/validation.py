import re
from typing import Dict, Any, List

def validate_email(email: str) -> bool:
    """이메일 주소 유효성 검증"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_inquiry_data(data: Dict[str, Any]) -> List[str]:
    """문의 데이터 유효성 검증"""
    errors = []
    
    if not data.get('companyId'):
        errors.append('companyId is required')
    
    if not data.get('customerEmail'):
        errors.append('customerEmail is required')
    elif not validate_email(data['customerEmail']):
        errors.append('Invalid email format')
    
    if not data.get('title'):
        errors.append('title is required')
    
    if not data.get('content'):
        errors.append('content is required')
    
    urgency = data.get('urgency', 'medium')
    if urgency not in ['low', 'medium', 'high']:
        errors.append('urgency must be low, medium, or high')
    
    return errors