import pytest
from src.utils.validation import validate_email, validate_inquiry_data


class TestValidationUtils:
    
    def test_validate_email_valid(self):
        """유효한 이메일 주소 테스트"""
        valid_emails = [
            "test@example.com",
            "user.name@domain.co.kr",
            "admin+tag@company.org"
        ]
        
        for email in valid_emails:
            assert validate_email(email) is True
    
    def test_validate_email_invalid(self):
        """유효하지 않은 이메일 주소 테스트"""
        invalid_emails = [
            "invalid-email",
            "@domain.com",
            "user@",
            "user@domain",
            ""
        ]
        
        for email in invalid_emails:
            assert validate_email(email) is False
    
    def test_validate_inquiry_data_valid(self):
        """유효한 문의 데이터 테스트"""
        valid_data = {
            'companyId': 'test-company',
            'customerEmail': 'customer@example.com',
            'title': '테스트 문의',
            'content': '문의 내용입니다.',
            'urgency': 'medium'
        }
        
        errors = validate_inquiry_data(valid_data)
        assert len(errors) == 0
    
    def test_validate_inquiry_data_missing_required(self):
        """필수 필드 누락 테스트"""
        invalid_data = {
            'customerEmail': 'customer@example.com'
            # companyId, title, content 누락
        }
        
        errors = validate_inquiry_data(invalid_data)
        assert len(errors) == 3
        assert 'companyId is required' in errors
        assert 'title is required' in errors
        assert 'content is required' in errors
    
    def test_validate_inquiry_data_invalid_email(self):
        """유효하지 않은 이메일 테스트"""
        invalid_data = {
            'companyId': 'test-company',
            'customerEmail': 'invalid-email',
            'title': '테스트 문의',
            'content': '문의 내용입니다.'
        }
        
        errors = validate_inquiry_data(invalid_data)
        assert len(errors) == 1
        assert 'Invalid email format' in errors
    
    def test_validate_inquiry_data_invalid_urgency(self):
        """유효하지 않은 긴급도 테스트"""
        invalid_data = {
            'companyId': 'test-company',
            'customerEmail': 'customer@example.com',
            'title': '테스트 문의',
            'content': '문의 내용입니다.',
            'urgency': 'invalid'
        }
        
        errors = validate_inquiry_data(invalid_data)
        assert len(errors) == 1
        assert 'urgency must be low, medium, or high' in errors