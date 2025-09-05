import pytest
from datetime import datetime
from backend.models.customer import Customer


class TestCustomer:
    """Customer 모델 테스트"""
    
    def test_고객_생성_성공(self):
        """고객 생성 시 필수 필드 검증"""
        # Given
        email = "test@hunters.com"
        password = "password123"
        name = "홍길동"
        
        # When
        customer = Customer.create(email=email, password=password, name=name)
        
        # Then
        assert customer.email == email
        assert customer.name == name
        assert customer.password_hash is not None
        assert customer.password_hash != password  # 해싱되어야 함
        assert customer.customer_id is not None
        assert isinstance(customer.created_at, datetime)
    
    def test_이메일_중복_검증(self):
        """동일한 이메일로 고객 생성 시 예외 발생"""
        # Given
        email = "duplicate@hunters.com"
        Customer.create(email=email, password="password1", name="고객1")
        
        # When & Then
        with pytest.raises(ValueError, match="이미 존재하는 이메일입니다"):
            Customer.create(email=email, password="password2", name="고객2")
    
    def test_비밀번호_검증_성공(self):
        """올바른 비밀번호 검증"""
        # Given
        customer = Customer.create(
            email="verify@hunters.com", 
            password="correct_password", 
            name="테스트"
        )
        
        # When & Then
        assert customer.verify_password("correct_password") is True
        assert customer.verify_password("wrong_password") is False
    
    def test_이메일로_고객_조회(self):
        """이메일로 고객 조회"""
        # Given
        email = "find@hunters.com"
        customer = Customer.create(email=email, password="password", name="찾을고객")
        
        # When
        found_customer = Customer.find_by_email(email)
        
        # Then
        assert found_customer is not None
        assert found_customer.email == email
        assert found_customer.customer_id == customer.customer_id
    
    def test_존재하지_않는_이메일_조회(self):
        """존재하지 않는 이메일 조회 시 None 반환"""
        # When
        customer = Customer.find_by_email("notexist@hunters.com")
        
        # Then
        assert customer is None