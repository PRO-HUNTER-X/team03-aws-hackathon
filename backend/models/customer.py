"""
Customer 모델 - 고객 정보 관리
"""
import hashlib
import uuid
from datetime import datetime
from typing import Optional, Dict, Any


class Customer:
    """고객 모델"""
    # 메모리 저장소 (실제로는 DynamoDB 사용)
    _customers: Dict[str, 'Customer'] = {}
    _email_index: Dict[str, str] = {}  # email -> customer_id 매핑
    
    def __init__(self, customer_id: str, email: str, password_hash: str, name: str, created_at: datetime):
        self.customer_id = customer_id
        self.email = email
        self.password_hash = password_hash
        self.name = name
        self.created_at = created_at
    
    @classmethod
    def create(cls, email: str, password: str, name: str) -> 'Customer':
        """새 고객 생성"""
        # 이메일 중복 검증
        if email in cls._email_index:
            raise ValueError("이미 존재하는 이메일입니다")
        
        # 고객 생성
        customer_id = str(uuid.uuid4())
        password_hash = cls._hash_password(password)
        created_at = datetime.utcnow()
        
        customer = cls(
            customer_id=customer_id,
            email=email,
            password_hash=password_hash,
            name=name,
            created_at=created_at
        )
        
        # 저장
        cls._customers[customer_id] = customer
        cls._email_index[email] = customer_id
        
        return customer
    
    @classmethod
    def find_by_email(cls, email: str) -> Optional['Customer']:
        """이메일로 고객 조회"""
        customer_id = cls._email_index.get(email)
        if customer_id:
            return cls._customers.get(customer_id)
        return None
    
    @classmethod
    def find_by_id(cls, customer_id: str) -> Optional['Customer']:
        """ID로 고객 조회"""
        return cls._customers.get(customer_id)
    
    def verify_password(self, password: str) -> bool:
        """비밀번호 검증"""
        return self.password_hash == self._hash_password(password)
    
    @staticmethod
    def _hash_password(password: str) -> str:
        """비밀번호 해싱"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def to_dict(self) -> Dict[str, Any]:
        """딕셔너리로 변환 (비밀번호 제외)"""
        return {
            'customer_id': self.customer_id,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def clear_all(cls):
        """테스트용: 모든 데이터 삭제"""
        cls._customers.clear()
        cls._email_index.clear()